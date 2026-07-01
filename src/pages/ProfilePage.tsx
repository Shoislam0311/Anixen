import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AvatarPicker from '@/components/profile/AvatarPicker';
import { User, Mail, Calendar, Edit3, Loader2, Clock, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, profile, loading, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff4444]" />
      </div>
    );
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/home')} className="bg-[#ff4444] hover:bg-[#ff3333]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const avatarUrl = profile?.photo_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'User';
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Unknown';

  const watchHistory = profile?.watch_history || [];
  const bookmarks = profile?.bookmarks || [];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#ff4444]/30 cursor-pointer hover:border-[#ff4444] transition-colors"
              onClick={() => setShowAvatarPicker(true)}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#ff4444] rounded-full flex items-center justify-center hover:bg-[#ff3333] transition-colors shadow-lg"
            >
              <Edit3 className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white mb-1">{displayName}</h1>
            <div className="flex flex-col md:flex-row items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Joined {joinDate}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{watchHistory.length}</p>
              <p className="text-xs text-gray-500">Watched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{bookmarks.length}</p>
              <p className="text-xs text-gray-500">Bookmarked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Watch History */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#ff4444]" /> Continue Watching
          </h2>
          {watchHistory.length === 0 ? (
            <div className="bg-[#111] rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">No watch history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchHistory.slice(0, 10).map((item: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/watch/${item.anime_id}?ep=${item.episode_number}&title=${encodeURIComponent(item.anime_title)}`)}
                  className="w-full flex items-center gap-3 p-3 bg-[#111] rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <img
                    src={item.anime_image}
                    alt={item.anime_title}
                    className="w-16 h-10 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.anime_title}</p>
                    <p className="text-xs text-gray-500">Episode {item.episode_number}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[#ff4444]" /> Bookmarks
          </h2>
          {bookmarks.length === 0 ? (
            <div className="bg-[#111] rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">No bookmarks yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.slice(0, 10).map((item: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/anime/${item.anime_id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-[#111] rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-10 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.type} &bull; {item.score ? `${item.score} ★` : 'N/A'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={logout}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          Sign Out
        </Button>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        open={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatar={avatarUrl || ''}
      />
    </div>
  );
}
