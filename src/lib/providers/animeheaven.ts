/**
 * AnimeHeaven Streaming Provider (Primary)
 * Supports: Sub & Dub
 * Features: Search, Episode listing, Video URL extraction
 */

interface AnimeHeavenSearchResult {
  id: string;
  title: string;
  url: string;
  subOrDub: 'sub' | 'dub';
}

interface AnimeHeavenEpisode {
  id: string;
  title: string;
  number: number;
  url: string;
}

interface AnimeHeavenServer {
  server: string;
  headers: Record<string, string>;
  videoSources: {
    url: string;
    quality: string;
    type: string;
    subtitles: { url: string; label: string; }[];
  }[];
}

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

export async function searchAnimeHeaven(query: string): Promise<AnimeHeavenSearchResult[]> {
  try {
    const html = await fetchHtml(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);

    const regex = /<div class='similarimg'>.*?<a href='(anime\.php\?.*?)'><img.*?alt='(.*?)'/gs;
    const results: AnimeHeavenSearchResult[] = [];
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
      });
    }

    return results;
  } catch (error) {
    console.error('AnimeHeaven search error:', error);
    return [];
  }
}

export async function getAnimeHeavenEpisodes(id: string): Promise<AnimeHeavenEpisode[]> {
  try {
    const html = await fetchHtml(`${BASE_URL}/anime.php?${id}`);

    const regex = /onclick='gatea\("([a-f0-9]+)"\)'[\s\S]*?<div class='[^']*watch2[^']*'>(\d+)<\/div>/g;
    const episodes: AnimeHeavenEpisode[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const gateKey = match[1];
      const number = parseInt(match[2], 10);

      episodes.push({
        id: gateKey,
        title: `Episode ${number}`,
        number,
        url: `${BASE_URL}/gate.php`,
      });
    }

    episodes.sort((a, b) => a.number - b.number);
    return episodes;
  } catch (error) {
    console.error('AnimeHeaven episodes error:', error);
    return [];
  }
}

export async function getAnimeHeavenServer(
  episode: AnimeHeavenEpisode,
  _server: string
): Promise<AnimeHeavenServer> {
  const gateKey = episode.id;
  const animeReferer = `${BASE_URL}/anime.php`;

  const html = await fetchHtml(`${BASE_URL}/gate.php`, {
    headers: {
      'Cookie': `key=${gateKey}`,
      'Referer': animeReferer,
    },
  });

  let videoUrl = null;

  const sourceMatch = html.match(/<source[^>]+src=['"]([^'"]+\.mp4[^'"]*)['"]/i);
  if (sourceMatch) {
    videoUrl = sourceMatch[1];
  }

  if (!videoUrl) {
    const dlMatch = html.match(/href='(https?:\/\/ax\.animeheaven\.me\/video\.mp4\?[^']+)'/);
    if (dlMatch) videoUrl = dlMatch[1];
  }

  if (!videoUrl) {
    const tokenMatch = html.match(/video\.mp4\?([a-f0-9]+)&([a-f0-9]+)/);
    if (tokenMatch) {
      videoUrl = `https://ax.animeheaven.me/video.mp4?${tokenMatch[1]}&${tokenMatch[2]}`;
    }
  }

  if (!videoUrl) throw new Error('Video URL not found in gate.php response');

  return {
    server: 'AnimeHeaven',
    headers: {
      'Referer': 'https://animeheaven.me/',
      'Origin': 'https://animeheaven.me',
    },
    videoSources: [
      {
        url: videoUrl,
        quality: 'auto',
        type: 'mp4',
        subtitles: [],
      },
    ],
  };
}

export async function searchAnimeHeavenDub(query: string): Promise<AnimeHeavenSearchResult[]> {
  const results = await searchAnimeHeaven(query);
  return results.map(r => ({ ...r, subOrDub: 'dub' as const }));
}
