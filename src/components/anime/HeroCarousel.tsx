import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Play, Info, Star, Calendar, Clock } from 'lucide-react';
import type { JikanAnime } from '@/types';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroCarouselProps {
  anime: JikanAnime[];
}

export default function HeroCarousel({ anime }: HeroCarouselProps) {
  const navigate = useNavigate();

  if (anime.length === 0) return null;

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        navigation={{
          prevEl: '.hero-prev',
          nextEl: '.hero-next',
        }}
        loop={anime.length > 1}
        className="hero-swiper"
      >
        {anime.slice(0, 8).map((item, index) => {
          const title = item.title_english || item.title;
          const coverImage = item.images.webp?.large_image_url || item.images.jpg?.large_image_url || '';

          return (
            <SwiperSlide key={item.mal_id}>
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[560px] overflow-hidden">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${coverImage})`,
                    filter: 'blur(20px) brightness(0.4)',
                    transform: 'scale(1.1)',
                  }}
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />

                {/* Content */}
                <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 w-full">
                    {/* Poster */}
                    <div
                      className="hidden md:block shrink-0 w-[200px] h-[300px] rounded-xl overflow-hidden shadow-2xl shadow-black/50 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate(`/anime/${item.mal_id}`)}
                    >
                      <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 max-w-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#ff4444] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                          #{index + 1} Spotlight
                        </span>
                        {item.score && (
                          <span className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400" />
                            {item.score.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <h2
                        className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight cursor-pointer hover:text-[#ff4444] transition-colors"
                        onClick={() => navigate(`/anime/${item.mal_id}`)}
                      >
                        {title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <Play className="h-3.5 w-3.5" />
                          {item.type || 'TV'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {item.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.aired?.string || 'N/A'}
                        </span>
                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium">HD</span>
                      </div>

                      <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 max-w-xl">
                        {item.synopsis || 'No synopsis available.'}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => navigate(`/anime/${item.mal_id}`)}
                          className="flex items-center gap-2 bg-[#ff4444] hover:bg-[#ff3333] text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#ff4444]/20"
                        >
                          <Play className="h-4 w-4 fill-white" />
                          Watch Now
                        </button>
                        <button
                          onClick={() => navigate(`/anime/${item.mal_id}`)}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                          <Info className="h-4 w-4" />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Navigation */}
      <button className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-[#ff4444] text-white flex items-center justify-center transition-colors">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-[#ff4444] text-white flex items-center justify-center transition-colors">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
