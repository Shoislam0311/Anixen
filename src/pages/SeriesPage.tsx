import { useTVSeries } from '@/hooks/useAnime';
import AnimeGrid from '@/components/anime/AnimeGrid';
import SectionHeader from '@/components/anime/SectionHeader';
import { Tv } from 'lucide-react';

export default function SeriesPage() {
  const { anime, loading } = useTVSeries();

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <SectionHeader title="TV Series" icon={<Tv className="h-5 w-5" />} />
      <p className="text-gray-500 mb-6">Browse all TV anime series</p>
      <AnimeGrid anime={anime} loading={loading} />
    </div>
  );
}
