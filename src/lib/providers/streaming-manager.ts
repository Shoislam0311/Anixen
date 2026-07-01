/**
 * Unified Streaming Manager
 * Combines AnimeHeaven (primary) and Senshi (fallback) providers
 */

import {
  searchAnimeHeaven,
  getAnimeHeavenEpisodes,
  getAnimeHeavenServer,
} from './animeheaven';

import {
  searchSenshi,
  getSenshiEpisodes,
  getSenshiServer,
} from './senshi';

export type SubDubMode = 'sub' | 'dub';
export type ProviderName = 'animeheaven' | 'senshi';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  subOrDub: SubDubMode;
  provider: ProviderName;
}

export interface Episode {
  id: string;
  title: string;
  number: number;
  url: string;
  provider: ProviderName;
}

export interface VideoSource {
  url: string;
  quality: string;
  type: 'mp4' | 'm3u8';
  subtitles: { url: string; label: string; }[];
}

export interface ServerResult {
  server: string;
  provider: ProviderName;
  headers: Record<string, string>;
  videoSources: VideoSource[];
}

// Search across all providers
export async function searchAllProviders(
  query: string,
  mode: SubDubMode = 'sub',
  malId?: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  const [animeheavenResults, senshiResults] = await Promise.allSettled([
    searchAnimeHeaven(query),
    searchSenshi(query, mode === 'dub', malId),
  ]);

  if (animeheavenResults.status === 'fulfilled') {
    results.push(
      ...animeheavenResults.value.map(r => ({
        ...r,
        subOrDub: mode,
        provider: 'animeheaven' as ProviderName,
      }))
    );
  }

  if (senshiResults.status === 'fulfilled') {
    results.push(
      ...senshiResults.value.map(r => ({
        ...r,
        subOrDub: mode,
        provider: 'senshi' as ProviderName,
      }))
    );
  }

  return results;
}

// Get episodes from specific provider or try all
export async function getEpisodes(
  provider: ProviderName,
  id: string
): Promise<Episode[]> {
  switch (provider) {
    case 'animeheaven':
      const ahEpisodes = await getAnimeHeavenEpisodes(id);
      return ahEpisodes.map(e => ({ ...e, provider: 'animeheaven' }));
    
    case 'senshi':
      const senshiEpisodes = await getSenshiEpisodes(id);
      return senshiEpisodes.map(e => ({ ...e, provider: 'senshi' }));
    
    default:
      return [];
  }
}

// Get video server from specific provider
export async function getVideoServer(
  provider: ProviderName,
  episode: Episode,
  server: string = 'Server 1'
): Promise<ServerResult> {
  switch (provider) {
    case 'animeheaven': {
      const ahServer = await getAnimeHeavenServer(episode, server);
      return {
        server: ahServer.server,
        headers: ahServer.headers,
        provider: 'animeheaven',
        videoSources: ahServer.videoSources.map(vs => ({
          url: vs.url,
          quality: vs.quality,
          type: vs.type as 'mp4' | 'm3u8',
          subtitles: vs.subtitles,
        })),
      };
    }

    case 'senshi': {
      const senshiServer = await getSenshiServer(episode, server);
      return {
        server: senshiServer.server,
        headers: senshiServer.headers,
        provider: 'senshi',
        videoSources: senshiServer.videoSources.map(vs => ({
          url: vs.url,
          quality: vs.quality,
          type: vs.type as 'mp4' | 'm3u8',
          subtitles: vs.subtitles,
        })),
      };
    }
    
    default:
      throw new Error('Unknown provider');
  }
}

// Auto-fallback: try primary, then fallback
export async function getVideoWithFallback(
  episode: Episode,
  server: string = 'Server 1'
): Promise<ServerResult> {
  try {
    return await getVideoServer(episode.provider, episode, server);
  } catch (error) {
    console.error(`Primary provider ${episode.provider} failed, trying fallback...`);
    
    const fallbackProvider = episode.provider === 'animeheaven' ? 'senshi' : 'animeheaven';
    
    try {
      return await getVideoServer(fallbackProvider, { ...episode, provider: fallbackProvider }, server);
    } catch (fallbackError) {
      throw new Error('All streaming providers failed');
    }
  }
}
