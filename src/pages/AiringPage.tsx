import { useTopAiring } from '@/hooks/useAnime';
import AnimeGrid from '@/components/anime/AnimeGrid';
import SectionHeader from '@/components/anime/SectionHeader';
import { Radio } from 'lucide-react';

export default function AiringPage() {
  const { anime, loading } = useTopAiring();

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <SectionHeader title="Top Airing" icon={<Radio className="h-5 w-5" />} />
      <p className="text-gray-500 mb-6">Currently airing anime this season</p>
      <AnimeGrid anime={anime} loading={loading} />
    </div>
  );
}
