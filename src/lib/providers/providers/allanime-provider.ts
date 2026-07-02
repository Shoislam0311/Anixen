/**
 * Allanime Provider
 * Implements the StreamingProvider interface
 * Based on Mirai streaming logic
 */

import type {
  StreamingProvider,
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  VideoSource,
} from '@/types/streaming';
import { proxyFetch, getProxiedUrl } from '../fetch-helper';

const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0';
const REFR = 'https://youtu-chan.com';
const API_BASE = 'https://api.allanime.day/api';

// Custom hex decoder for Allanime URLs
const customHexMap: Record<string, string> = {
  '00': '8', '01': '9', '02': ':', '03': ';', '05': '=', '07': '?', '08': '0', '09': '1',
  '0a': '2', '0b': '3', '0c': '4', '0d': '5', '0e': '6', '0f': '7',
  '10': '(', '11': ')', '12': '*', '13': '+', '14': ',', '15': '-', '16': '.', '17': '/',
  '19': '!', '1b': '#', '1c': '$', '1d': '%', '1e': '&',
  '40': 'x', '41': 'y', '42': 'z', '46': '~', '48': 'p', '49': 'q', '4a': 'r', '4b': 's',
  '4c': 't', '4d': 'u', '4e': 'v', '4f': 'w',
  '50': 'h', '51': 'i', '52': 'j', '53': 'k', '54': 'l', '55': 'm', '56': 'n', '57': 'o',
  '59': 'a', '5a': 'b', '5b': 'c', '5c': 'd', '5d': 'e', '5e': 'f', '5f': 'g',
  '60': 'X', '61': 'Y', '62': 'Z', '63': '[', '65': ']', '67': '_', '68': 'P', '69': 'Q',
  '6a': 'R', '6b': 'S', '6c': 'T', '6d': 'U', '6e': 'V', '6f': 'W',
  '70': 'H', '71': 'I', '72': 'J', '73': 'K', '74': 'L', '75': 'M', '76': 'N', '77': 'O',
  '78': '@', '79': 'A', '7a': 'B', '7b': 'C', '7c': 'D', '7d': 'E', '7e': 'F', '7f': 'G',
};

function decodeCustomHex(str: string): string {
  let res = '';
  for (let i = 0; i < str.length; i += 2) {
    const chunk = str.substring(i, i + 2).toLowerCase();
    if (customHexMap[chunk]) res += customHexMap[chunk];
    else res += String.fromCharCode(parseInt(chunk, 16));
  }
  return res.replace(/\/clock/g, '/clock.json');
}

function maybeDecodeCustomHex(str: string): string {
  if (!str.startsWith('--')) return str;
  return decodeCustomHex(str.slice(2));
}

async function resolveSource(src: { sourceUrl: string; sourceName: string }): Promise<VideoSource[]> {
  const decodedPath = maybeDecodeCustomHex(src.sourceUrl);
  const fetchUrl = decodedPath.startsWith('http')
    ? decodedPath
    : `https://allanime.day${decodedPath}`;

  // mp4upload: scrape HTML for src
  if (fetchUrl.includes('mp4upload')) {
    try {
      const html = await proxyFetch(fetchUrl);
      const match = html.match(/src:\s*"([^"]+)"/);
      if (match) {
        return [{
          url: getProxiedUrl(match[1]),
          quality: 'auto',
          type: 'mp4',
          subtitles: [],
        }];
      }
    } catch { return []; }
    return [];
  }

  // tools.fast4speed.rsvp: use URL directly
  if (fetchUrl.includes('tools.fast4speed.rsvp')) {
    return [{
      url: getProxiedUrl(fetchUrl),
      quality: 'auto',
      type: 'mp4',
      subtitles: [],
    }];
  }

  // wixmp / allanime CDN: fetch clock.json and extract links
  try {
    const data = await proxyFetch(fetchUrl);

    // If it's a direct video URL
    if (typeof data === 'string' && data.includes('http')) {
      return [{
        url: getProxiedUrl(fetchUrl),
        quality: 'auto',
        type: 'm3u8',
        subtitles: [],
      }];
    }

    const sources: VideoSource[] = [];
    for (const link of data?.links ?? []) {
      if (link.link && typeof link.link === 'string') {
        sources.push({
          url: getProxiedUrl(link.link),
          quality: link.resolutionStr ?? 'auto',
          type: link.link.includes('.m3u8') ? 'm3u8' : 'mp4',
          subtitles: [],
        });
      }
    }
    return sources;
  } catch {
    return [];
  }
}

export const allanimeProvider: StreamingProvider = {
  name: 'allanime',
  priority: 3,
  supportsSub: true,
  supportsDub: true,

  async search(options: SearchOptions): Promise<SearchResult[]> {
    const mode = options.mode === 'dub' ? 'dub' : 'sub';
    const gql = `query( $search: SearchInput $limit: Int $page: Int $translationType: VaildTranslationTypeEnumType $countryOrigin: VaildCountryOriginEnumType ) { shows( search: $search limit: $limit page: $page translationType: $translationType countryOrigin: $countryOrigin ) { edges { _id name availableEpisodes thumbnail __typename } }}`;
    const vars = {
      search: { allowAdult: false, allowUnknown: false, query: options.query },
      limit: 40, page: 1, translationType: mode, countryOrigin: 'ALL',
    };

    try {
      const data = await proxyFetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables: vars, query: gql }),
      });

      if (!data?.data?.shows?.edges) return [];

      return data.data.shows.edges.map((edge: any) => ({
        id: edge._id,
        title: edge.name,
        url: `https://allanime.to/anime/${edge._id}`,
        subOrDub: mode,
        provider: 'allanime',
        image: edge.thumbnail,
      }));
    } catch (error) {
      console.error('Allanime search error:', error);
      return [];
    }
  },

  async getEpisodes(id: string): Promise<Episode[]> {
    const gql = `query ($showId: String!) { show( _id: $showId ) { _id availableEpisodesDetail }}`;

    try {
      const data = await proxyFetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables: { showId: id }, query: gql }),
      });

      const detail = data?.data?.show?.availableEpisodesDetail ?? {};

      // Combine sub and dub episodes
      const episodes: Episode[] = [];
      const subEps = detail.sub ?? [];
      const dubEps = detail.dub ?? [];

      for (const ep of subEps) {
        episodes.push({
          id: `${id}/sub/${ep}`,
          title: `Episode ${ep}`,
          number: parseInt(ep, 10),
          url: '',
          provider: 'allanime',
        });
      }

      // Add dub episodes with different IDs
      for (const ep of dubEps) {
        episodes.push({
          id: `${id}/dub/${ep}`,
          title: `Episode ${ep} (Dub)`,
          number: parseInt(ep, 10),
          url: '',
          provider: 'allanime',
        });
      }

      return episodes;
    } catch (error) {
      console.error('Allanime episodes error:', error);
      return [];
    }
  },

  async getServers(episode: Episode): Promise<ServerResult[]> {
    const parts = episode.id.split('/');
    const showId = parts[0];
    const mode = parts[1] as 'sub' | 'dub';
    const epNum = parts[2];

    const queryHash = 'd405d0edd690624b66baba3068e0edc3ac90f1597d898a1ec8db4e5c43c00fec';
    const vars = JSON.stringify({ showId, translationType: mode, episodeString: epNum });
    const ext = JSON.stringify({ persistedQuery: { version: 1, sha256Hash: queryHash } });

    const params = new URLSearchParams({ variables: vars, extensions: ext });

    let rawStr = '';

    // Step 1: GET with persisted query
    try {
      const data = await proxyFetch(`${API_BASE}?${params.toString()}`);
      rawStr = JSON.stringify(data);
    } catch {
      // Continue to POST fallback
    }

    // Step 2: POST fallback
    if (!rawStr || (!rawStr.includes('sourceUrl') && !rawStr.includes('tobeparsed'))) {
      const gql = `query ($showId: String!, $translationType: VaildTranslationTypeEnumType!, $episodeString: String!) { episode( showId: $showId translationType: $translationType episodeString: $episodeString ) { episodeString sourceUrls }}`;
      try {
        const data = await proxyFetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ variables: { showId, translationType: mode, episodeString: epNum }, query: gql }),
        });
        rawStr = JSON.stringify(data);
      } catch {
        // Continue
      }
    }

    if (!rawStr) return [];

    // Step 3: Extract source entries
    const sources: { sourceUrl: string; sourceName: string }[] = [];

    try {
      const data = JSON.parse(rawStr);
      if (data?.data?.tobeparsed) {
        // Decode tobeparsed
        const buf = Uint8Array.from(atob(data.data.tobeparsed), c => c.charCodeAt(0));
        const ct = buf.slice(13, buf.length - 16);
        try {
          const decoded = new TextDecoder().decode(ct);
          const json = JSON.parse(decoded);
          const sourceUrls = json.episode?.sourceUrls || json.sourceUrls || [];
          for (const src of sourceUrls) {
            if (src.sourceUrl) {
              sources.push({
                sourceUrl: src.sourceUrl.startsWith('--') ? src.sourceUrl.slice(2) : src.sourceUrl,
                sourceName: src.sourceName ?? 'Unknown',
              });
            }
          }
        } catch { /* ignore decode errors */ }
      } else if (data?.data?.episode?.sourceUrls) {
        for (const src of data.data.episode.sourceUrls) {
          if (!src.sourceUrl) continue;
          const rawUrl = src.sourceUrl.startsWith('--') ? src.sourceUrl.slice(2) : src.sourceUrl;
          sources.push({ sourceUrl: rawUrl, sourceName: src.sourceName ?? 'Unknown' });
        }
      }
    } catch { /* ignore parse errors */ }

    if (sources.length === 0) return [];

    // Step 4: Resolve sources in parallel
    const resolvedSources: VideoSource[] = [];
    const results = await Promise.allSettled(
      sources.map(async (src) => resolveSource(src))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        resolvedSources.push(...result.value);
      }
    }

    // Fallback: return decoded paths for any direct-URL providers
    if (resolvedSources.length === 0) {
      for (const src of sources) {
        const decoded = maybeDecodeCustomHex(src.sourceUrl);
        if (decoded.startsWith('http')) {
          resolvedSources.push({
            url: getProxiedUrl(decoded),
            quality: 'auto',
            type: decoded.includes('.m3u8') ? 'm3u8' : 'mp4',
            subtitles: [],
          });
        }
      }
    }

    return [{
      server: 'Allanime',
      provider: 'allanime',
      headers: {
        'User-Agent': AGENT,
        'Referer': REFR,
      },
      videoSources: resolvedSources,
      name: 'Allanime',
      priority: 1,
    }];
  },
};
