import { useMovies } from '@/hooks/useAnime';
import AnimeGrid from '@/components/anime/AnimeGrid';
import SectionHeader from '@/components/anime/SectionHeader';
import { Film } from 'lucide-react';

export default function MoviesPage() {
  const { anime, loading } = useMovies();

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <SectionHeader title="Anime Movies" icon={<Film className="h-5 w-5" />} />
      <p className="text-gray-500 mb-6">Watch the best anime movies</p>
      <AnimeGrid anime={anime} loading={loading} />
    </div>
  );
}
