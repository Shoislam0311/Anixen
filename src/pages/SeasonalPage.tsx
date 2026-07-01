import { useSeasonalAnime } from '@/hooks/useAnime';
import AnimeGrid from '@/components/anime/AnimeGrid';
import SectionHeader from '@/components/anime/SectionHeader';
import { Sparkles } from 'lucide-react';

export default function SeasonalPage() {
  const { anime, loading } = useSeasonalAnime();

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <SectionHeader title="This Season" icon={<Sparkles className="h-5 w-5" />} />
      <p className="text-gray-500 mb-6">Anime airing this season</p>
      <AnimeGrid anime={anime} loading={loading} />
    </div>
  );
}
