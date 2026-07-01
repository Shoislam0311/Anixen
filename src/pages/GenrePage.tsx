import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAnimeByGenre, GENRE_MAP, POPULAR_GENRES } from '@/lib/jikan';
import type { JikanAnime } from '@/types';
import AnimeGrid from '@/components/anime/AnimeGrid';
import { Tag } from 'lucide-react';

export default function GenrePage() {
  const { genreName } = useParams<{ genreName: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  const genreId = genreName ? (GENRE_MAP[genreName.toLowerCase()] || null) : null;
  const displayName = genreName ? genreName.charAt(0).toUpperCase() + genreName.slice(1) : '';

  useEffect(() => {
    if (!genreId) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAnimeByGenre(genreId, 1, 24);
        setAnime(data.data);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [genreId]);

  // Show genre browser if no valid genre
  if (!genreId) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Tag className="h-6 w-6 text-[#ff4444]" />
          <h1 className="text-2xl font-bold text-white">Browse by Genre</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {POPULAR_GENRES.map(genre => (
            <button
              key={genre.id}
              onClick={() => navigate(`/genre/${genre.name.toLowerCase()}`)}
              className="p-6 bg-[#111] rounded-xl hover:bg-[#1a1a1a] transition-all hover:-translate-y-1 text-center group"
            >
              <p className="text-lg font-bold text-white group-hover:text-[#ff4444] transition-colors">{genre.name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Tag className="h-6 w-6 text-[#ff4444]" />
        <h1 className="text-2xl font-bold text-white">{displayName} Anime</h1>
      </div>
      <AnimeGrid anime={anime} loading={loading} />
    </div>
  );
}
