import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAnimeDetail, useAnimeEpisodes } from '@/hooks/useAnime';
import VideoPlayer from '@/components/player/VideoPlayer';
import EpisodeList from '@/components/anime/EpisodeList';
import CommentSection from '@/components/comments/CommentSection';
import WatchOrder from '@/components/anime/WatchOrder';
import { useAuth } from '@/hooks/useAuth';
import { addToWatchHistory } from '@/lib/supabase';
import {
  ChevronLeft, ChevronRight, Share2, AlertTriangle, ListOrdered, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const animeId = Number(id);
  const initialEp = Number(searchParams.get('ep')) || 1;
  const titleFromQuery = searchParams.get('title') || '';

  const { anime } = useAnimeDetail(animeId);
  const { episodes, hasNextPage, loadMore } = useAnimeEpisodes(animeId);

  const [currentEpisode, setCurrentEpisode] = useState(initialEp);
  const [activeTab, setActiveTab] = useState<'episodes' | 'watchOrder' | 'comments'>('episodes');

  const animeTitle = anime?.title_english || anime?.title || titleFromQuery;
  const totalEpisodes = anime?.episodes || episodes.length;

  useEffect(() => {
    if (!isLoggedIn && !user) {
      // Allow guest access
    }
  }, [isLoggedIn, user]);

  const handleEpisodeChange = (epNum: number) => {
    setCurrentEpisode(epNum);
    navigate(`/watch/${animeId}?ep=${epNum}&title=${encodeURIComponent(animeTitle)}`, { replace: true });
  };

  const handleNextEpisode = () => {
    if (currentEpisode < (totalEpisodes || episodes.length)) {
      handleEpisodeChange(currentEpisode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      handleEpisodeChange(currentEpisode - 1);
    }
  };

  const saveHistory = async () => {
    if (!isLoggedIn || !user || !anime) return;
    try {
      const currentEp = episodes.find(e => e.episode === currentEpisode);
      await addToWatchHistory(user.id, {
        anime_id: animeId,
        anime_title: anime.title_english || anime.title,
        anime_image: anime.images.webp?.small_image_url || anime.images.jpg?.small_image_url || '',
        episode_number: currentEpisode,
        episode_title: currentEp?.title || `Episode ${currentEpisode}`,
        timestamp: Date.now(),
        progress: 0,
        duration: 0,
      });
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    const timeout = setTimeout(saveHistory, 30000);
    return () => clearTimeout(timeout);
  }, [currentEpisode, anime]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (!anime && !titleFromQuery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const hasNext = currentEpisode < (totalEpisodes || episodes.length);
  const hasPrev = currentEpisode > 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {!isLoggedIn && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Login to save your watch history and bookmarks</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/anime/${animeId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Details
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevEpisode}
              disabled={!hasPrev}
              className="text-gray-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <span className="text-sm text-gray-400 px-3">
              EP {currentEpisode} / {totalEpisodes || '?'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextEpisode}
              disabled={!hasNext}
              className="text-gray-400 hover:text-white disabled:opacity-30"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-400 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg md:text-xl font-bold text-white mb-4 truncate">
          {animeTitle} <span className="text-gray-500 font-normal">- Episode {currentEpisode}</span>
        </h1>

        {/* Video Player */}
        <div className="mb-6">
          <VideoPlayer
            animeTitle={animeTitle}
            episodeNumber={currentEpisode}
            animeId={animeId}
            malId={anime?.mal_id}
            onNextEpisode={handleNextEpisode}
            hasNextEpisode={hasNext}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 bg-[#111] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'episodes'
                ? 'bg-[#ff4444] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Episodes
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'episodes' && (
              <EpisodeList
                episodes={episodes}
                animeId={animeId}
                animeTitle={animeTitle}
                currentEpisode={currentEpisode}
                hasNextPage={hasNextPage}
                onLoadMore={loadMore}
              />
            )}
            {activeTab === 'watchOrder' && (
              <WatchOrder animeId={animeId} />
            )}
            {activeTab === 'comments' && (
              <CommentSection animeId={animeId} episodeNumber={currentEpisode} />
            )}
          </div>

          {/* Sidebar - Watch Order & Comments */}
          <div className="hidden lg:block space-y-6">
            {activeTab !== 'watchOrder' && <WatchOrder animeId={animeId} />}
            {activeTab !== 'comments' && (
              <CommentSection animeId={animeId} episodeNumber={currentEpisode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
