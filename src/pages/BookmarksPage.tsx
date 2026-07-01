import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeBookmark } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const { isLoggedIn, profile, user } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Please sign in to view your bookmarks</p>
          <Button onClick={() => navigate('/home')} className="bg-[#ff4444] hover:bg-[#ff3333]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const bookmarks = profile?.bookmarks || [];

  const handleRemove = async (bookmark: any) => {
    if (!user) return;
    try {
      await removeBookmark(user.id, bookmark);
      toast.success('Removed from bookmarks');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="h-6 w-6 text-[#ff4444]" />
        <h1 className="text-2xl font-bold text-white">My Bookmarks</h1>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No bookmarks yet. Start exploring and bookmark your favorite anime!</p>
          <Button
            onClick={() => navigate('/home')}
            className="mt-4 bg-[#ff4444] hover:bg-[#ff3333]"
          >
            Explore Anime
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bookmark: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#111] rounded-xl overflow-hidden group hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex gap-4 p-4">
                <button
                  onClick={() => navigate(`/anime/${bookmark.anime_id}`)}
                  className="shrink-0"
                >
                  <img
                    src={bookmark.image}
                    alt={bookmark.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/anime/${bookmark.anime_id}`)}
                    className="text-left"
                  >
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#ff4444] transition-colors">
                      {bookmark.title}
                    </h3>
                  </button>
                  <p className="text-xs text-gray-500 mt-1">{bookmark.type}</p>
                  {bookmark.score && (
                    <p className="text-xs text-yellow-400 mt-1">★ {bookmark.score}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Added {new Date(bookmark.added_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(bookmark)}
                    className="mt-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
