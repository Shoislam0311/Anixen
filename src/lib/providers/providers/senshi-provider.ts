/**
 * Senshi Provider
 * Implements the StreamingProvider interface
 * Supports: Sub & Dub, Multi-server
 */

import type {
  StreamingProvider,
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  VideoSource,
} from '@/types/streaming';
import { proxyFetch } from '../fetch-helper';

const BASE_URL = 'https://senshi.live';

export const senshiProvider: StreamingProvider = {
  name: 'senshi',
  priority: 2,
  supportsSub: true,
  supportsDub: true,

  async search(options: SearchOptions): Promise<SearchResult[]> {
    try {
      const dub = options.mode === 'dub';
      const json = await proxyFetch(`${BASE_URL}/anime/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: options.query,
          page: 1,
          limit: 30,
        }),
      });

      let data = json?.data ?? json;

      // Fallback to MAL title if no results
      if (data.length === 0 && options.malId) {
        const mal = await proxyFetch(
          `https://api.jikan.moe/v4/anime/${options.malId}`
        );
        const retryJson = await proxyFetch(`${BASE_URL}/anime/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchTerm: mal.data.title,
            page: 1,
            limit: 30,
          }),
        });
        data = retryJson?.data ?? retryJson;
      }

      return data.map((item: any) => ({
        id: `${item.id}/${dub ? 'dub' : 'sub'}`,
        title: item.title_english || item.title || '',
        url: `${BASE_URL}/watch/${item.public_id}/1`,
        subOrDub: dub ? 'dub' : 'sub',
        provider: 'senshi',
        image: item.image,
      }));
    } catch (error) {
      console.error('Senshi search error:', error);
      return [];
    }
  },

  async getEpisodes(id: string): Promise<Episode[]> {
    const [animeId, lang] = id.split('/');

    try {
      const data: any[] = await proxyFetch(`${BASE_URL}/episodes/${animeId}`);

      return data.map((ep: any) => ({
        id: `${ep.mal_id}/${lang}`,
        number: ep.ep_id,
        url: `${BASE_URL}/episode-embeds/${ep.mal_id}/${ep.ep_id}`,
        title: ep.ep_title || `Episode ${ep.ep_id}`,
        provider: 'senshi',
        aired: ep.aired,
      }));
    } catch (error) {
      console.error('Senshi episodes error:', error);
      return [];
    }
  },

  async getServers(episode: Episode): Promise<ServerResult[]> {
    const [, lang] = episode.id.split('/');
    const data: any[] = await proxyFetch(episode.url);

    // Filter by language (sub/dub)
    const filtered = lang === 'dub'
      ? data.filter((source: any) => source.status === 'Dub')
      : data.filter((source: any) => source.status === 'HardSub');

    const servers: ServerResult[] = [];

    // Create server for each available source
    for (const source of filtered) {
      const videoSources: VideoSource[] = [];

      // Server 1
      if (source.url) {
        videoSources.push({
          url: source.url,
          type: source.url.includes('.m3u8') ? 'm3u8' : 'mp4',
          quality: 'auto',
          subtitles: [],
        });
      }

      // Server 2
      if (source.server2) {
        videoSources.push({
          url: source.server2,
          type: source.server2.includes('.m3u8') ? 'm3u8' : 'mp4',
          quality: 'auto',
          subtitles: [],
        });
      }

      if (videoSources.length > 0) {
        servers.push({
          server: source.server || 'Senshi',
          provider: 'senshi',
          headers: {
            Referer: BASE_URL,
          },
          videoSources,
          name: source.server || 'Senshi',
          priority: source.server === 'Server 1' ? 1 : 2,
        });
      }
    }

    return servers;
  },
};
