/**
 * Watch Order API Integration
 * Fetches and displays anime watch orders from GitHub data source
 */

const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/Bas1874/Anime-Watch-Order-Api/refs/heads/main/data/watch_order_api.json';

interface WatchOrderStep {
  step_title: string;
  is_optional: boolean;
  media: {
    id: number;
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
    format: string;
    season: string;
    seasonYear: number;
    mediaListEntry?: {
      status: string;
    };
  };
}

interface WatchOrder {
  name: string;
  description: string;
  description_html: string | null;
  steps: WatchOrderStep[];
}

interface SeriesData {
  title: string;
  alternative_titles: string[];
  prologue: string | null;
  prologue_html: string | null;
  entry_notes: string | null;
  watch_orders: WatchOrder[];
}

export interface WatchOrderResponse {
  data: SeriesData[];
}

// Cache for API data
let cachedData: WatchOrderResponse | null = null;

export async function fetchWatchOrderData(): Promise<WatchOrderResponse | null> {
  if (cachedData) return cachedData;

  try {
    const res = await fetch(GITHUB_DATA_URL);
    if (!res.ok) throw new Error('Failed to fetch watch order data');
    
    const data: WatchOrderResponse = await res.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('Watch order fetch error:', error);
    return null;
  }
}

export async function getWatchOrderForAnime(animeId: number): Promise<{
  seriesData: SeriesData | null;
  watchOrder: WatchOrder | null;
}> {
  const data = await fetchWatchOrderData();
  if (!data) return { seriesData: null, watchOrder: null };

  const seriesData = data.data.find(series =>
    series.watch_orders.some(wo =>
      wo.steps.some(step => step.media?.id === animeId)
    )
  );

  if (!seriesData) return { seriesData: null, watchOrder: null };

  const watchOrder = seriesData.watch_orders.find(wo =>
    wo.steps.some(step => step.media?.id === animeId)
  );

  return { seriesData, watchOrder: watchOrder ?? null };
}

export function formatWatchOrderMetadata(anime: WatchOrderStep['media']): string {
  const parts: string[] = [];
  
  if (anime.format) parts.push(anime.format.replace(/_/g, ' '));
  if (anime.mediaListEntry?.status) {
    parts.push(anime.mediaListEntry.status.charAt(0).toUpperCase() + anime.mediaListEntry.status.slice(1).toLowerCase());
  }
  if (anime.season) parts.push(anime.season.charAt(0).toUpperCase() + anime.season.slice(1).toLowerCase());
  if (anime.seasonYear) parts.push(String(anime.seasonYear));
  
  return parts.join(' · ');
}

export function parseHtmlToTextChunks(html: string | null): { type: 'text' | 'link'; content: string; href?: string; }[] {
  if (!html) return [];

  const chunks: { type: 'text' | 'link'; content: string; href?: string; }[] = [];
  
  const linkRegex = /<a[^>]+href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const text = html.slice(lastIndex, match.index).replace(/<[^>]+>/g, '').trim();
      if (text) chunks.push({ type: 'text', content: text });
    }

    let href = match[1];
    if (href.startsWith('/u/')) {
      href = `https://www.reddit.com${href}`;
    }

    chunks.push({ type: 'link', content: match[2].replace(/<[^>]+>/g, ''), href });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    const text = html.slice(lastIndex).replace(/<[^>]+>/g, '').trim();
    if (text) chunks.push({ type: 'text', content: text });
  }

  if (chunks.length === 0) {
    const plainText = html.replace(/<[^>]+>/g, '').trim();
    if (plainText) chunks.push({ type: 'text', content: plainText });
  }

  return chunks;
}
