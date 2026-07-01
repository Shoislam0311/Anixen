import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  searchAllProviders,
  getEpisodes,
  getVideoServer,
  type SubDubMode,
  type ProviderName,
} from '@/lib/providers/streaming-manager';

export type { SubDubMode };

export function useStreaming(animeTitle: string, episodeNumber: number, malId?: number) {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<SubDubMode>('sub');
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [activeProvider, setActiveProvider] = useState<ProviderName | null>(null);
  const abortRef = useRef(0);

  const fetchSources = useCallback(async () => {
    if (!animeTitle) return;

    const fetchId = ++abortRef.current;
    setLoading(true);
    setSources([]);
    setSelectedSource(null);

    try {
      // Search across all providers
      const results = await searchAllProviders(animeTitle, mode, malId);

      if (results.length === 0) {
        toast.error('Anime not found in any streaming provider');
        if (fetchId === abortRef.current) setLoading(false);
        return;
      }

      // Pick the first result from the first available provider
      const firstResult = results[0];
      const provider = firstResult.provider;

      // Get episodes for this provider
      const episodes = await getEpisodes(provider, firstResult.id);

      if (episodes.length === 0) {
        toast.error('No episodes available');
        if (fetchId === abortRef.current) setLoading(false);
        return;
      }

      // Find the requested episode
      const episode = episodes.find(e => e.number === episodeNumber) || episodes[0];

      if (!episode) {
        toast.error(`Episode ${episodeNumber} not found`);
        if (fetchId === abortRef.current) setLoading(false);
        return;
      }

      // Get video server
      const serverResult = await getVideoServer(provider, episode);

      if (fetchId !== abortRef.current) return;

      if (!serverResult.videoSources || serverResult.videoSources.length === 0) {
        toast.error('No streaming sources available');
        if (fetchId === abortRef.current) setLoading(false);
        return;
      }

      const streamSources = serverResult.videoSources.map(s => ({
        sourceName: `${serverResult.server} (${provider})`,
        sourceUrl: s.url,
        quality: s.quality,
        headers: serverResult.headers,
        type: s.type,
      }));

      setSources(streamSources);
      setSelectedSource(streamSources[0]);
      setActiveProvider(provider);
    } catch (error: any) {
      if (fetchId !== abortRef.current) return;
      console.error('Streaming error:', error);
      toast.error(error.message || 'Failed to load streaming sources');
    } finally {
      if (fetchId === abortRef.current) setLoading(false);
    }
  }, [animeTitle, episodeNumber, mode, malId]);

  useEffect(() => {
    fetchSources();
    return () => { abortRef.current++; };
  }, [fetchSources]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'sub' ? 'dub' : 'sub');
  }, []);

  return {
    sources,
    loading,
    mode,
    selectedSource,
    activeProvider,
    toggleMode,
    refetch: fetchSources,
  };
}
