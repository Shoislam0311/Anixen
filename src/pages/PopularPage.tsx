import { usePopularAnime } from '@/hooks/useAnime';
import AnimeGrid from '@/components/anime/AnimeGrid';
import SectionHeader from '@/components/anime/SectionHeader';
import { TrendingUp } from 'lucide-react';

export default function PopularPage() {
  const { anime, loading } = usePopularAnime();

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <SectionHeader title="Most Popular" icon={<TrendingUp className="h-5 w-5" />} />
      <p className="text-gray-500 mb-6">The most popular anime of all time</p>
      <AnimeGrid anime={anime} loading={loading} />
    </div>
  );
}
