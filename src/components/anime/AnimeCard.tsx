import { useNavigate } from 'react-router-dom';
import type { JikanAnime } from '@/types';
import { Play, Star, Tv, Film } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface AnimeCardProps {
  anime: JikanAnime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const navigate = useNavigate();
  const title = anime.title_english || anime.title;
  const image = anime.images.webp?.large_image_url || anime.images.jpg?.large_image_url || '';
  const smallImage = anime.images.webp?.small_image_url || anime.images.jpg?.small_image_url || '';

  return (
    <div
      onClick={() => navigate(`/anime/${anime.mal_id}`)}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-[#111] hover:bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ff4444]/5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <LazyLoadImage
          src={image}
          placeholderSrc={smallImage}
          alt={title}
          effect="blur"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-[#ff4444] flex items-center justify-center shadow-lg shadow-[#ff4444]/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 text-white fill-white ml-1" />
          </div>
        </div>
        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-white">{anime.score.toFixed(1)}</span>
          </div>
        )}
        {/* Type Badge */}
        <div className="absolute top-2 left-2 bg-[#ff4444]/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          {anime.type === 'Movie' ? <Film className="h-3 w-3 text-white" /> : <Tv className="h-3 w-3 text-white" />}
          <span className="text-xs font-medium text-white">{anime.type || 'TV'}</span>
        </div>
        {/* Episodes Badge */}
        {anime.episodes && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-xs text-white">{anime.episodes} EPS</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#ff4444] transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-500">{anime.status}</span>
          <span className="text-gray-700">&bull;</span>
          <span className="text-xs text-gray-500">{anime.duration}</span>
        </div>
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {anime.genres.slice(0, 3).map(g => (
              <span key={g.mal_id} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
