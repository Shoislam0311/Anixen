import axios from 'axios';
import type {
  JikanAnime,
  JikanEpisode,
  JikanResponse,
  JikanSingleResponse,
} from '@/types';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

const jikanClient = axios.create({
  baseURL: JIKAN_BASE,
  timeout: 15000,
});

// Rate limiting: Jikan allows 3 requests per second
let lastRequestTime = 0;
const MIN_INTERVAL = 400; // ms between requests

async function rateLimitedGet<T>(url: string, params?: Record<string, any>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  const response = await jikanClient.get<T>(url, { params });
  return response.data;
}

// Search anime
export const searchAnime = async (query: string, page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/anime', {
    q: query,
    page,
    limit,
    order_by: 'popularity',
    sort: 'asc',
  });
};

// Get anime details
export const getAnimeDetails = async (id: number) => {
  return rateLimitedGet<JikanSingleResponse<JikanAnime>>(`/anime/${id}/full`);
};

// Get anime episodes
export const getAnimeEpisodes = async (id: number, page = 1) => {
  return rateLimitedGet<JikanResponse<JikanEpisode>>(`/anime/${id}/episodes`, { page });
};

// Get top airing
export const getTopAiring = async (page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/top/anime', {
    filter: 'airing',
    page,
    limit,
  });
};

// Get popular anime
export const getPopular = async (page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/top/anime', {
    filter: 'bypopularity',
    page,
    limit,
  });
};

// Get upcoming anime
export const getUpcoming = async (page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/top/anime', {
    filter: 'upcoming',
    page,
    limit,
  });
};

// Get anime by genre
export const getAnimeByGenre = async (genreId: number, page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/anime', {
    genres: genreId,
    page,
    limit,
    order_by: 'popularity',
    sort: 'asc',
  });
};

// Get seasonal anime
export const getSeasonalAnime = async (year?: number, season?: string, page = 1, limit = 25) => {
  const params: Record<string, any> = { page, limit };
  if (year) params.year = year;
  if (season) params.season = season;
  return rateLimitedGet<JikanResponse<JikanAnime>>('/seasons/now', params);
};

// Get anime by type
export const getAnimeByType = async (type: string, page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/anime', {
    type,
    page,
    limit,
    order_by: 'popularity',
    sort: 'asc',
  });
};

// Get current season
export const getCurrentSeason = async (page = 1, limit = 25) => {
  return rateLimitedGet<JikanResponse<JikanAnime>>('/seasons/now', { page, limit });
};

// Get related anime (recommendations)
export const getAnimeRecommendations = async (id: number) => {
  return rateLimitedGet<JikanResponse<{ entry: JikanAnime }>>(`/anime/${id}/recommendations`);
};

// Get anime streaming info
export const getAnimeStreaming = async (id: number) => {
  return rateLimitedGet<JikanResponse<{ name: string; url: string }>>(`/anime/${id}/streaming`);
};

// Genre mapping
export const GENRE_MAP: Record<string, number> = {
  action: 1,
  adventure: 2,
  racing: 3,
  comedy: 4,
  avant: 5,
  mystery: 7,
  drama: 8,
  ecchi: 9,
  fantasy: 10,
  game: 11,
  hentai: 12,
  historical: 13,
  horror: 14,
  kids: 15,
  martial: 17,
  mecha: 18,
  music: 19,
  parody: 20,
  samurai: 21,
  romance: 22,
  school: 23,
  scifi: 24,
  shoujo: 25,
  shoujoai: 26,
  shounen: 27,
  shounenai: 28,
  space: 29,
  sports: 30,
  superpower: 31,
  vampire: 32,
  harem: 35,
  sliceoflife: 36,
  supernatural: 37,
  military: 38,
  police: 39,
  psychological: 40,
  thriller: 41,
  seinen: 42,
  josei: 43,
};

// Common genres for display
export const POPULAR_GENRES = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 14, name: 'Horror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' },
  { id: 27, name: 'Shounen' },
];

// Cache helper
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedOrFetch = async <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
