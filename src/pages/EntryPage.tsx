import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimeCard from '@/components/anime/AnimeCard';
import { useTopAiring, usePopularAnime } from '@/hooks/useAnime';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

export default function EntryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showContent, setShowContent] = useState(false);
  const { anime: topAiring } = useTopAiring();
  const { anime: popular } = usePopularAnime();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://via.placeholder.com/1920x1080/0a0a0a/ffffff?text=AniXen"
      >
        <source src="https://animex.one/misc/intro.webm" type="video/webm" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight">
              Ani<span className="text-[#ff4444]">Xen</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Your Ultimate Anime Streaming Destination
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="pl-12 pr-4 py-6 bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-lg rounded-xl focus:border-[#ff4444]/50 focus:ring-[#ff4444]/20"
                />
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/home')}
                size="lg"
                className="bg-[#ff4444] hover:bg-[#ff3333] text-white px-8 py-6 text-lg"
              >
                <Play className="h-5 w-5 mr-2 fill-white" /> Start Watching
              </Button>
              <Button
                onClick={() => navigate('/most-popular')}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                Explore Library <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Content (Below fold) */}
        <div className={`pb-16 px-4 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Trending */}
            {topAiring.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#ff4444] rounded-full" />
                  Trending Now
                </h2>
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={16}
                  slidesPerView={2}
                  navigation={{
                    prevEl: '.entry-prev',
                    nextEl: '.entry-next',
                  }}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                    1280: { slidesPerView: 6 },
                  }}
                >
                  {topAiring.slice(0, 12).map((anime) => (
                    <SwiperSlide key={anime.mal_id}>
                      <AnimeCard anime={anime} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Popular */}
            {popular.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#ff4444] rounded-full" />
                  Most Popular
                </h2>
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={16}
                  slidesPerView={2}
                  navigation={{
                    prevEl: '.popular-prev',
                    nextEl: '.popular-next',
                  }}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                    1280: { slidesPerView: 6 },
                  }}
                >
                  {popular.slice(0, 12).map((anime) => (
                    <SwiperSlide key={anime.mal_id}>
                      <AnimeCard anime={anime} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center border-t border-white/5">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AniXen. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
