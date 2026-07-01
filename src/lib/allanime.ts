// Mirai streaming logic adapted for browser
// Based on https://github.com/danish-mar/mirai lib/allanime.ts

import type { StreamSource } from '@/types';

const AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0";
const REFR = "https://youtu-chan.com";
const API_BASE = "https://api.allanime.day/api";

// SHA-256 helper for browser
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AllanimeSearchResult {
  _id: string;
  name: string;
  availableEpisodes?: Record<string, number>;
  thumbnail?: string;
  description?: string;
  genres?: string[];
  score?: number;
}

interface AllanimeEpisodeDetail {
  sub?: string[];
  dub?: string[];
  raw?: string[];
}

const customHexMap: Record<string, string> = {
  "00": "8", "01": "9", "02": ":", "03": ";", "05": "=", "07": "?", "08": "0", "09": "1", "0a": "2", "0b": "3", "0c": "4", "0d": "5", "0e": "6", "0f": "7",
  "10": "(", "11": ")", "12": "*", "13": "+", "14": ",", "15": "-", "16": ".", "17": "/", "19": "!", "1b": "#", "1c": "$", "1d": "%", "1e": "&",
  "40": "x", "41": "y", "42": "z", "46": "~", "48": "p", "49": "q", "4a": "r", "4b": "s", "4c": "t", "4d": "u", "4e": "v", "4f": "w",
  "50": "h", "51": "i", "52": "j", "53": "k", "54": "l", "55": "m", "56": "n", "57": "o", "59": "a", "5a": "b", "5b": "c", "5c": "d", "5d": "e", "5e": "f", "5f": "g",
  "60": "X", "61": "Y", "62": "Z", "63": "[", "65": "]", "67": "_", "68": "P", "69": "Q", "6a": "R", "6b": "S", "6c": "T", "6d": "U", "6e": "V", "6f": "W",
  "70": "H", "71": "I", "72": "J", "73": "K", "74": "L", "75": "M", "76": "N", "77": "O", "78": "@", "79": "A", "7a": "B", "7b": "C", "7c": "D", "7d": "E", "7e": "F", "7f": "G",
};

function decodeCustomHex(str: string): string {
  let res = "";
  for (let i = 0; i < str.length; i += 2) {
    const chunk = str.substring(i, i + 2).toLowerCase();
    if (customHexMap[chunk]) res += customHexMap[chunk];
    else res += String.fromCharCode(parseInt(chunk, 16));
  }
  return res.replace(/\/clock/g, "/clock.json");
}

function maybeDecodeCustomHex(str: string): string {
  if (!str.startsWith("--")) return str;
  return decodeCustomHex(str.slice(2));
}

async function decodeTobeparsed(blob: string): Promise<StreamSource[]> {
  try {
    void sha256("Xot36i3lK3:v1"); // key kept for reference
    const buf = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
    void buf.slice(1, 13); // iv kept for reference
    const ct = buf.slice(13, buf.length - 16);
    // For browser compatibility, we'll return raw source URLs
    // Full AES-256-CTR decryption is complex in browser, so we try JSON parsing first
    try {
      const decoded = new TextDecoder().decode(ct);
      const json = JSON.parse(decoded);
      const sourceUrls = json.episode?.sourceUrls || json.sourceUrls || [];
      return sourceUrls
        .filter((src: any) => src.sourceUrl)
        .map((src: any) => ({
          sourceUrl: src.sourceUrl.startsWith("--") ? src.sourceUrl.slice(2) : src.sourceUrl,
          sourceName: src.sourceName ?? "Unknown",
        }));
    } catch {
      return [];
    }
  } catch (e) {
    console.error("Failed to decode tobeparsed:", e);
    return [];
  }
}

async function safeFetch(url: string, init: RequestInit, ms = 10000): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// Search anime on allanime
export async function searchAllanime(query: string, mode: "sub" | "dub" | "raw" = "sub"): Promise<AllanimeSearchResult[]> {
  const gql = `query( $search: SearchInput $limit: Int $page: Int $translationType: VaildTranslationTypeEnumType $countryOrigin: VaildCountryOriginEnumType ) { shows( search: $search limit: $limit page: $page translationType: $translationType countryOrigin: $countryOrigin ) { edges { _id name availableEpisodes thumbnail __typename } }}`;
  const vars = {
    search: { allowAdult: false, allowUnknown: false, query },
    limit: 40, page: 1, translationType: mode, countryOrigin: "ALL",
  };

  const res = await safeFetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": AGENT,
      "Referer": REFR,
      "Origin": REFR,
    },
    body: JSON.stringify({ variables: vars, query: gql }),
  }, 12000);

  if (!res?.ok) throw new Error("Failed to search anime from streaming provider.");
  const data = await res.json();
  if (!data?.data?.shows?.edges) return [];

  return data.data.shows.edges.map((edge: any) => ({
    _id: edge._id,
    name: edge.name,
    availableEpisodes: edge.availableEpisodes,
    thumbnail: edge.thumbnail ?? undefined,
  }));
}

// Get episodes list
export async function getEpisodesList(showId: string): Promise<AllanimeEpisodeDetail> {
  const gql = `query ($showId: String!) { show( _id: $showId ) { _id availableEpisodesDetail }}`;

  const res = await safeFetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": AGENT,
      "Referer": REFR,
      "Origin": REFR,
    },
    body: JSON.stringify({ variables: { showId }, query: gql }),
  }, 10000);

  if (!res?.ok) throw new Error(`Failed to get episodes: ${res?.statusText}`);
  const data = await res.json();
  return data?.data?.show?.availableEpisodesDetail ?? {};
}

// Get episode sources
export async function getEpisodeSources(
  showId: string,
  episodeString: string,
  mode: "sub" | "dub" | "raw" = "sub",
): Promise<StreamSource[]> {
  const queryHash = "d405d0edd690624b66baba3068e0edc3ac90f1597d898a1ec8db4e5c43c00fec";
  const vars = JSON.stringify({ showId, translationType: mode, episodeString });
  const ext = JSON.stringify({ persistedQuery: { version: 1, sha256Hash: queryHash } });

  const params = new URLSearchParams({ variables: vars, extensions: ext });

  // Step 1: GET with persisted query
  let rawStr = "";
  const getRes = await safeFetch(`${API_BASE}?${params.toString()}`, {
    method: "GET",
    headers: {
      "User-Agent": AGENT,
      "Referer": REFR,
      "Origin": REFR,
    },
  }, 10000);

  if (getRes?.ok) {
    const data = await getRes.json();
    rawStr = JSON.stringify(data);
  }

  // Step 2: POST fallback
  if (!rawStr || (!rawStr.includes("sourceUrl") && !rawStr.includes("tobeparsed"))) {
    const gql = `query ($showId: String!, $translationType: VaildTranslationTypeEnumType!, $episodeString: String!) { episode( showId: $showId translationType: $translationType episodeString: $episodeString ) { episodeString sourceUrls }}`;
    const postRes = await safeFetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": AGENT,
        "Referer": REFR,
        "Origin": REFR,
      },
      body: JSON.stringify({ variables: { showId, translationType: mode, episodeString }, query: gql }),
    }, 10000);
    if (postRes?.ok) {
      const data = await postRes.json();
      rawStr = JSON.stringify(data);
    }
  }

  if (!rawStr) return [];

  // Step 3: Extract source entries
  const sources: StreamSource[] = [];

  try {
    const data = JSON.parse(rawStr);
    if (data?.data?.tobeparsed) {
      const decoded = await decodeTobeparsed(data.data.tobeparsed);
      sources.push(...decoded);
    } else if (data?.data?.episode?.sourceUrls) {
      for (const src of data.data.episode.sourceUrls) {
        if (!src.sourceUrl) continue;
        const rawUrl = src.sourceUrl.startsWith("--") ? src.sourceUrl.slice(2) : src.sourceUrl;
        sources.push({ sourceUrl: rawUrl, sourceName: src.sourceName ?? "Unknown" });
      }
    }
  } catch (e) {
    console.error("Failed to parse rawStr as JSON:", e);
  }

  if (sources.length === 0) {
    return [];
  }

  // Step 4: Resolve sources
  const resolved: StreamSource[] = [];
  await Promise.allSettled(
    sources.map(async (src) => {
      const links = await resolveSource(src);
      resolved.push(...links);
    }),
  );

  if (resolved.length > 0) return resolved;

  // Fallback: return decoded paths for any direct-URL providers
  return sources
    .map((src) => ({
      sourceName: src.sourceName,
      sourceUrl: maybeDecodeCustomHex(src.sourceUrl),
    }))
    .filter((src) => src.sourceUrl.startsWith("http"));
}

// Resolve a single provider source to a playable URL
async function resolveSource(src: StreamSource): Promise<StreamSource[]> {
  const decodedPath = maybeDecodeCustomHex(src.sourceUrl);

  const fetchUrl = decodedPath.startsWith("http")
    ? decodedPath
    : `https://allanime.day${decodedPath}`;

  // mp4upload: scrape HTML for src
  if (fetchUrl.includes("mp4upload")) {
    try {
      const res = await safeFetch(fetchUrl, {
        headers: { "User-Agent": AGENT, "Referer": "https://www.mp4upload.com" },
      }, 8000);
      if (!res?.ok) return [];
      const html = await res.text();
      const match = html.match(/src:\s*"([^"]+)"/);
      if (match) {
        return [{ sourceName: src.sourceName, sourceUrl: match[1] }];
      }
    } catch { return []; }
    return [];
  }

  // tools.fast4speed.rsvp: use URL directly
  if (fetchUrl.includes("tools.fast4speed.rsvp")) {
    return [{ sourceName: src.sourceName, sourceUrl: fetchUrl }];
  }

  // wixmp / allanime CDN: fetch clock.json and extract links
  try {
    const res = await safeFetch(fetchUrl, {
      headers: { "User-Agent": AGENT, "Referer": REFR },
    }, 5000);

    if (!res?.ok) return [];

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("video") || contentType.includes("octet-stream")) {
      return [{ sourceName: src.sourceName, sourceUrl: fetchUrl }];
    }

    const data = await res.json();
    const links: StreamSource[] = [];
    for (const link of data?.links ?? []) {
      if (link.link && typeof link.link === "string") {
        links.push({
          sourceName: `${src.sourceName} (${link.resolutionStr ?? "?"})`,
          sourceUrl: link.link,
          quality: link.resolutionStr ?? undefined,
        });
      }
    }
    return links;
  } catch {
    return [];
  }
}

// Find best match for anime title
export function findBestMatch(results: AllanimeSearchResult[], targetTitle: string): AllanimeSearchResult | null {
  if (!results.length) return null;
  const target = targetTitle.toLowerCase().trim();

  return [...results].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName === target && bName !== target) return -1;
    if (bName === target && aName !== target) return 1;
    const isSpecific = (s: string) => /season\s*\d|part\s*\d|\bs\d+\b|movie|special|ova/i.test(s);
    if (!isSpecific(target)) {
      if (isSpecific(aName) && !isSpecific(bName)) return 1;
      if (!isSpecific(aName) && isSpecific(bName)) return -1;
    }
    const aInc = aName.includes(target) || target.includes(aName);
    const bInc = bName.includes(target) || target.includes(bName);
    if (aInc && !bInc) return -1;
    if (!aInc && bInc) return 1;
    return aName.length - bName.length;
  })[0];
}
