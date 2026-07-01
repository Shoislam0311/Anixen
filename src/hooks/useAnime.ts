import { useState, useEffect, useCallback } from 'react';
import type { JikanAnime, JikanEpisode } from '@/types';
import {
  searchAnime,
  getAnimeDetails,
  getAnimeEpisodes,
  getTopAiring,
  getPopular,
  getUpcoming,
  getCurrentSeason,
  getAnimeByType,
  getAnimeRecommendations,
  getCachedOrFetch,
} from '@/lib/jikan';
import toast from 'react-hot-toast';

export function useSearchAnime(query: string) {
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getCachedOrFetch(`search_${query}`, () => searchAnime(query));
        setResults(data.data);
      } catch {
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetch, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  return { results, loading };
}

export function useAnimeDetail(id: number) {
  const [anime, setAnime] = useState<JikanAnime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getCachedOrFetch(`anime_${id}`, () => getAnimeDetails(id));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { anime, loading };
}

export function useAnimeEpisodes(id: number) {
  const [episodes, setEpisodes] = useState<JikanEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchEpisodes = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data = await getAnimeEpisodes(id, page);
      if (page === 1) {
        setEpisodes(data.data);
      } else {
        setEpisodes(prev => [...prev, ...data.data]);
      }
      setHasNextPage(data.pagination.has_next_page);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load episodes');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEpisodes(1);
  }, [fetchEpisodes]);

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchEpisodes(currentPage + 1);
    }
  }, [hasNextPage, currentPage, fetchEpisodes]);

  return { episodes, loading, hasNextPage, loadMore };
}

export function useTopAiring() {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch('top_airing', () => getTopAiring(1, 12));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load top airing');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { anime, loading };
}

export function usePopularAnime() {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch('popular', () => getPopular(1, 12));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load popular anime');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { anime, loading };
}

export function useUpcomingAnime() {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch('upcoming', () => getUpcoming(1, 12));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load upcoming anime');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { anime, loading };
}

export function useSeasonalAnime() {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch('seasonal', () => getCurrentSeason(1, 12));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load seasonal anime');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { anime, loading };
}

export function useMovies() {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch('movies', () => getAnimeByType('movie', 1, 24));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { anime, loading };
}

export function useTVSeries() {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch('tv_series', () => getAnimeByType('tv', 1, 24));
        setAnime(data.data);
      } catch {
        toast.error('Failed to load TV series');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { anime, loading };
}

export function useAnimeRecommendations(id: number) {
  const [recommendations, setRecommendations] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCachedOrFetch(`recommendations_${id}`, () => getAnimeRecommendations(id));
        setRecommendations(data.data.map((d: any) => d.entry));
      } catch {
        // Recommendations are non-critical, fail silently
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { recommendations, loading };
}
