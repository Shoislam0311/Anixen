import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeDetail, useAnimeEpisodes, useAnimeRecommendations } from '@/hooks/useAnime';
import EpisodeList from '@/components/anime/EpisodeList';
import AnimeGrid from '@/components/anime/AnimeGrid';
import CommentSection from '@/components/comments/CommentSection';
import WatchOrder from '@/components/anime/WatchOrder';
import { useAuth } from '@/hooks/useAuth';
import { addBookmark, removeBookmark } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import {
  Star, Play, Calendar, Clock, Tv, Film, BookmarkPlus, BookmarkCheck,
  ChevronLeft, Users, Award, Globe, Layers, ListOrdered, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { anime, loading } = useAnimeDetail(Number(id));
  const { episodes, hasNextPage, loadMore } = useAnimeEpisodes(Number(id));
  const { recommendations } = useAnimeRecommendations(Number(id));
  const { isLoggedIn, profile } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'episodes' | 'watchOrder' | 'comments'>('episodes');

  const animeId = Number(id);
  const title = anime?.title_english || anime?.title || '';

  useEffect(() => {
    if (profile?.bookmarks && animeId) {
      setIsBookmarked(profile.bookmarks.some((b: any) => b.anime_id === animeId));
    }
  }, [profile, animeId]);

  const handleBookmark = async () => {
    if (!isLoggedIn || !anime) {
      toast.error('Please login to bookmark');
      return;
    }

    const bookmarkData = {
      anime_id: animeId,
      title: anime.title_english || anime.title,
      image: anime.images.webp?.small_image_url || anime.images.jpg?.small_image_url || '',
      score: anime.score,
      type: anime.type || 'TV',
      added_at: Date.now(),
    };

    try {
      if (!profile) return;
      if (isBookmarked) {
        await removeBookmark(profile.id, bookmarkData);
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await addBookmark(profile.id, bookmarkData);
        setIsBookmarked(true);
        toast.success('Added to bookmarks');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ff4444] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading anime details...</p>
        </div>
      </div>
    );
  }

  const image = anime.images.webp?.large_image_url || anime.images.jpg?.large_image_url || '';
  const bgImage = anime.images.webp?.small_image_url || anime.images.jpg?.small_image_url || '';

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center h-full"
          style={{
            backgroundImage: `url(${bgImage})`,
            filter: 'blur(30px) brightness(0.3)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-[220px] md:w-[260px] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <img src={image} alt={title} className="w-full h-auto" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-black text-white mb-4">{title}</h1>
              {anime.title_japanese && (
                <p className="text-gray-500 text-sm mb-4">{anime.title_japanese}</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {anime.score && (
                  <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="h-3.5 w-3.5 fill-yellow-400" /> {anime.score.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {anime.type === 'Movie' ? <Film className="h-3.5 w-3.5" /> : <Tv className="h-3.5 w-3.5" />}
                  {anime.type || 'TV'}
                </span>
                <span className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1 rounded-full text-sm">
                  <Clock className="h-3.5 w-3.5" /> {anime.duration}
                </span>
                <span className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1 rounded-full text-sm">
                  <Calendar className="h-3.5 w-3.5" /> {anime.aired?.string || 'N/A'}
                </span>
                {anime.status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    anime.status === 'Currently Airing' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-300'
                  }`}>
                    {anime.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {anime.genres?.map(g => (
                  <button
                    key={g.mal_id}
                    onClick={() => navigate(`/genre/${g.name.toLowerCase()}`)}
                    className="px-3 py-1 bg-[#ff4444]/10 text-[#ff4444] rounded-full text-xs font-medium hover:bg-[#ff4444]/20 transition-colors"
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{anime.synopsis || 'No synopsis available.'}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {anime.studios && anime.studios.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Studios</p>
                    <p className="text-sm text-white">{anime.studios.map(s => s.name).join(', ')}</p>
                  </div>
                )}
                {anime.source && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Source</p>
                    <p className="text-sm text-white">{anime.source}</p>
                  </div>
                )}
                {anime.rating && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rating</p>
                    <p className="text-sm text-white">{anime.rating}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Episodes</p>
                  <p className="text-sm text-white">{anime.episodes || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {episodes.length > 0 && (
                  <Button
                    onClick={() => navigate(`/watch/${animeId}?ep=1&title=${encodeURIComponent(title)}`)}
                    className="bg-[#ff4444] hover:bg-[#ff3333] text-white px-6"
                  >
                    <Play className="h-4 w-4 mr-2 fill-white" /> Watch Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  className={`border-white/10 ${isBookmarked ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <BookmarkPlus className="h-4 w-4 mr-2" />}
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">{anime.members?.toLocaleString() || 'N/A'} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Rank #{anime.rank || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Popularity #{anime.popularity || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">{anime.favorites?.toLocaleString() || 'N/A'} favorites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-1 mb-6 bg-[#111] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'episodes'
                ? 'bg-[#ff4444] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Episodes ({episodes.length})
          </button>
          <button
            onClick={() => setActiveTab('watchOrder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'watchOrder'
                ? 'bg-[#ff4444] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            Watch Order
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'bg-[#ff4444] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Comments
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'episodes' && (
              <EpisodeList
                episodes={episodes}
                animeId={animeId}
                animeTitle={title}
                hasNextPage={hasNextPage}
                onLoadMore={loadMore}
              />
            )}
            {activeTab === 'watchOrder' && (
              <WatchOrder animeId={animeId} />
            )}
            {activeTab === 'comments' && (
              <CommentSection animeId={animeId} />
            )}

            {/* Recommendations */}
            {activeTab === 'episodes' && recommendations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">You Might Also Like</h2>
                <AnimeGrid anime={recommendations.slice(0, 6)} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {activeTab !== 'watchOrder' && <WatchOrder animeId={animeId} />}
            {activeTab !== 'comments' && <CommentSection animeId={animeId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
