/**
 * AnimeHeaven Provider
 * Implements the StreamingProvider interface
 */

import type {
  StreamingProvider,
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  VideoSource,
} from '@/types/streaming';

const BASE_URL = 'https://animeheaven.me';

async function fetchHtml(url: string, options?: RequestInit): Promise<string> {
  if (import.meta.env.PROD) {
    const proxyUrl = `/api/proxy?target=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export const animeheavenProvider: StreamingProvider = {
  name: 'animeheaven',
  priority: 1,
  supportsSub: true,
  supportsDub: false,

  async search(options: SearchOptions): Promise<SearchResult[]> {
    try {
      const html = await fetchHtml(
        `${BASE_URL}/search.php?s=${encodeURIComponent(options.query)}`
      );

      const regex = /<div class='similarimg'>.*?<a href='(anime\.php\?.*?)'><img.*?alt='(.*?)'/gs;
      const results: SearchResult[] = [];
      let match;

      while ((match = regex.exec(html)) !== null) {
        const url = `${BASE_URL}/${match[1]}`;
        const title = match[2].replace(/&#039;/g, "'");
        const id = match[1].replace('anime.php?', '');

        results.push({
          id,
          title,
          url,
          subOrDub: 'sub',
          provider: 'animeheaven',
        });
      }

      return results;
    } catch (error) {
      console.error('AnimeHeaven search error:', error);
      return [];
    }
  },

  async getEpisodes(id: string): Promise<Episode[]> {
    try {
      const html = await fetchHtml(`${BASE_URL}/anime.php?${id}`);

      const regex = /onclick='gatea\("([a-f0-9]+)"\)'[\s\S]*?<div class='[^']*watch2[^']*'>(\d+)<\/div>/g;
      const episodes: Episode[] = [];
      let match;

      while ((match = regex.exec(html)) !== null) {
        const gateKey = match[1];
        const number = parseInt(match[2], 10);

        episodes.push({
          id: gateKey,
          title: `Episode ${number}`,
          number,
          url: `${BASE_URL}/gate.php`,
          provider: 'animeheaven',
        });
      }

      episodes.sort((a, b) => a.number - b.number);
      return episodes;
    } catch (error) {
      console.error('AnimeHeaven episodes error:', error);
      return [];
    }
  },

  async getServers(episode: Episode): Promise<ServerResult[]> {
    const gateKey = episode.id;
    const animeReferer = `${BASE_URL}/anime.php`;

    const html = await fetchHtml(`${BASE_URL}/gate.php`, {
      headers: {
        Cookie: `key=${gateKey}`,
        Referer: animeReferer,
      },
    });

    let videoUrl = null;

    const sourceMatch = html.match(
      /<source[^>]+src=['"]([^'"]+\.mp4[^'"]*)['"]/i
    );
    if (sourceMatch) {
      videoUrl = sourceMatch[1];
    }

    if (!videoUrl) {
      const dlMatch = html.match(
        /href='(https?:\/\/ax\.animeheaven\.me\/video\.mp4\?[^']+)'/);
      if (dlMatch) videoUrl = dlMatch[1];
    }

    if (!videoUrl) {
      const tokenMatch = html.match(/video\.mp4\?([a-f0-9]+)&([a-f0-9]+)/);
      if (tokenMatch) {
        videoUrl = `https://ax.animeheaven.me/video.mp4?${tokenMatch[1]}&${tokenMatch[2]}`;
      }
    }

    if (!videoUrl) throw new Error('Video URL not found');

    const videoSources: VideoSource[] = [
      {
        url: videoUrl,
        quality: 'auto',
        type: 'mp4',
        subtitles: [],
      },
    ];

    return [
      {
        server: 'AnimeHeaven',
        provider: 'animeheaven',
        headers: {
          Referer: 'https://animeheaven.me/',
          Origin: 'https://animeheaven.me',
        },
        videoSources,
        name: 'AnimeHeaven',
        priority: 1,
      },
    ];
  },
};
