/**
 * Senshi Streaming Provider (Fallback)
 * Supports: Sub & Dub
 * Features: Search with MAL fallback, Episode listing, Multi-server support
 */

import { proxyFetch } from './fetch-helper';

interface SenshiSearchResult {
  id: string;
  title: string;
  url: string;
  subOrDub: 'sub' | 'dub';
}

interface SenshiEpisode {
  id: string;
  title: string;
  number: number;
  url: string;
}

interface SenshiServer {
  server: string;
  headers: Record<string, string>;
  videoSources: {
    url: string;
    quality: string;
    type: string;
    subtitles: { url: string; label: string; }[];
  }[];
}

const BASE_URL = 'https://senshi.live';

export async function searchSenshi(query: string, dub = false, malId?: number): Promise<SenshiSearchResult[]> {
  try {
    const json = await proxyFetch(`${BASE_URL}/anime/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm: query, page: 1, limit: 30 }),
    });

    let data = json?.data ?? json;

    if (data.length === 0 && malId) {
      const mal = await proxyFetch(`https://api.jikan.moe/v4/anime/${malId}`);
      const retryJson = await proxyFetch(`${BASE_URL}/anime/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: mal.data.title, page: 1, limit: 30 }),
      });
      data = retryJson?.data ?? retryJson;
    }

    return data.map((item: any) => ({
      id: `${item.id}/${dub ? 'dub' : 'sub'}`,
      title: item.title_english || item.title || '',
      url: `${BASE_URL}/watch/${item.public_id}/1`,
      subOrDub: dub ? 'dub' : 'sub',
    }));
  } catch (error) {
    console.error('Senshi search error:', error);
    return [];
  }
}

export async function getSenshiEpisodes(id: string): Promise<SenshiEpisode[]> {
  const [animeId, lang] = id.split('/');

  try {
    const data: any[] = await proxyFetch(`${BASE_URL}/episodes/${animeId}`);

    return data.map((ep: any) => ({
      id: `${ep.mal_id}/${lang}`,
      number: ep.ep_id,
      url: `${BASE_URL}/episode-embeds/${ep.mal_id}/${ep.ep_id}`,
      title: ep.ep_title || `Episode ${ep.ep_id}`,
    }));
  } catch (error) {
    console.error('Senshi episodes error:', error);
    return [];
  }
}

export async function getSenshiServer(
  episode: SenshiEpisode,
  server: string
): Promise<SenshiServer> {
  const [, lang] = episode.id.split('/');

  const data: any[] = await proxyFetch(episode.url);

  const filtered = lang === 'dub'
    ? data.filter((source: any) => source.status === 'Dub')
    : data.filter((source: any) => source.status === 'HardSub');

  const videoSources = filtered
    .filter((source: any) => server === 'Server 1' ? source.url : source.server2)
    .map((source: any) => {
      const url: string = server === 'Server 1' ? source.url : source.server2;
      const type = url.includes('.m3u8') ? 'm3u8' : 'mp4';
      return {
        url,
        type,
        quality: 'auto',
        subtitles: [],
      };
    });

  return {
    server,
    headers: {
      'Referer': BASE_URL,
    },
    videoSources,
  };
}
