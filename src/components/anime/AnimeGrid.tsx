import type { JikanAnime } from '@/types';
import AnimeCard from './AnimeCard';
import { Loader2 } from 'lucide-react';

interface AnimeGridProps {
  anime: JikanAnime[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function AnimeGrid({ anime, loading = false, emptyMessage = 'No anime found' }: AnimeGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff4444]" />
      </div>
    );
  }

  if (anime.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {anime.map((item, idx) => (
        <AnimeCard key={item.mal_id} anime={item} index={idx} />
      ))}
    </div>
  );
}
