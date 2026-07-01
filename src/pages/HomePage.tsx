import HeroCarousel from '@/components/anime/HeroCarousel';
import AnimeGrid from '@/components/anime/AnimeGrid';
import SectionHeader from '@/components/anime/SectionHeader';
import { useTopAiring, usePopularAnime, useSeasonalAnime, useUpcomingAnime } from '@/hooks/useAnime';
import { TrendingUp, Sparkles, Radio, Calendar } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import AnimeCard from '@/components/anime/AnimeCard';
import 'swiper/css';

export default function HomePage() {
  const { anime: topAiring, loading: topAiringLoading } = useTopAiring();
  const { anime: popular, loading: popularLoading } = usePopularAnime();
  const { anime: seasonal, loading: seasonalLoading } = useSeasonalAnime();
  const { anime: upcoming, loading: upcomingLoading } = useUpcomingAnime();
  void popularLoading;

  // Use top airing for hero
  const heroAnime = topAiring.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel anime={heroAnime} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Trending Now */}
        <section>
          <SectionHeader
            title="Trending Now"
            icon={<TrendingUp className="h-5 w-5" />}
            viewAllLink="/top-airing"
          />
          <AnimeGrid anime={topAiring.slice(0, 12)} loading={topAiringLoading} />
        </section>

        {/* Seasonal Anime */}
        <section>
          <SectionHeader
            title="This Season"
            icon={<Sparkles className="h-5 w-5" />}
            viewAllLink="/seasonal"
          />
          <AnimeGrid anime={seasonal.slice(0, 12)} loading={seasonalLoading} />
        </section>

        {/* Most Popular */}
        <section>
          <SectionHeader
            title="Most Popular"
            icon={<Radio className="h-5 w-5" />}
            viewAllLink="/most-popular"
          />
          <div className="relative">
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
              className="popular-swiper"
            >
              {popular.map((anime) => (
                <SwiperSlide key={anime.mal_id}>
                  <AnimeCard anime={anime} />
                </SwiperSlide>
              ))}
            </Swiper>
            <button className="popular-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#ff4444] transition-colors">
              <Calendar className="h-4 w-4" />
            </button>
            <button className="popular-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#ff4444] transition-colors">
              <Calendar className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <SectionHeader
            title="Coming Soon"
            icon={<Calendar className="h-5 w-5" />}
            viewAllLink="/seasonal"
          />
          <AnimeGrid anime={upcoming.slice(0, 6)} loading={upcomingLoading} />
        </section>
      </div>
    </div>
  );
}
