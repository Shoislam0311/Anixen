import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Image, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  gif?: string;
  timestamp: number;
  likes: number;
  replies: Comment[];
}

interface CommentSectionProps {
  animeId: number;
  episodeNumber?: number;
}

const EMOJI_LIST = [
  '😀', '😂', '🤣', '😍', '🥰', '😎', '🤔', '😢', '😭', '😡',
  '🔥', '💯', '❤️', '💔', '✨', '🎉', '👏', '🙌', '💪', '🤝',
  '👀', '🙌', '🎮', '📺', '🎬', '⭐', '🌟', '💫', '🎯', '🏆',
];

const GIF_CATEGORIES = ['anime', 'reactions', 'funny', 'cool', 'sad', 'happy'];

export default function CommentSection({ animeId, episodeNumber }: CommentSectionProps) {
  const { user, profile, isLoggedIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [animeId, episodeNumber]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage for demo (in production, use Firebase/API)
      const storageKey = `comments_${animeId}${episodeNumber ? `_ep${episodeNumber}` : ''}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveComments = (updatedComments: Comment[]) => {
    const storageKey = `comments_${animeId}${episodeNumber ? `_ep${episodeNumber}` : ''}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  const handleSubmitComment = () => {
    if (!isLoggedIn || !user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim() && !selectedGif) {
      toast.error('Please enter a comment or select a GIF');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: profile?.display_name || user.user_metadata?.display_name || 'Anonymous',
      userAvatar: profile?.photo_url || user.user_metadata?.avatar_url || '',
      content: newComment,
      gif: selectedGif || undefined,
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    };

    saveComments([comment, ...comments]);
    setNewComment('');
    setSelectedGif(null);
    setShowGifPicker(false);
    toast.success('Comment posted!');
  };

  const handleLike = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    });
    saveComments(updated);
  };

  const handleReply = (commentId: string, replyContent: string) => {
    if (!isLoggedIn || !user) {
      toast.error('Please login to reply');
      return;
    }

    const reply: Comment = {
      id: `${commentId}_${Date.now()}`,
      userId: user.id,
      userName: profile?.display_name || user.user_metadata?.display_name || 'Anonymous',
      userAvatar: profile?.photo_url || user.user_metadata?.avatar_url || '',
      content: replyContent,
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    };

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...c.replies, reply] };
      }
      return c;
    });
    saveComments(updated);
    toast.success('Reply posted!');
  };

  const insertEmoji = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-[#111] rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-[#ff4444]" />
        <h3 className="text-white font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* Comment Input */}
      {isLoggedIn ? (
        <div className="mb-6">
          <div className="flex gap-3">
            <img
              src={profile?.photo_url || user?.user_metadata?.avatar_url || ''}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none min-h-[80px]"
              />

              {/* Selected GIF Preview */}
              {selectedGif && (
                <div className="mt-2 relative inline-block">
                  <img src={selectedGif} alt="Selected GIF" className="h-20 rounded" />
                  <button
                    onClick={() => setSelectedGif(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() && !selectedGif}
                  className="bg-[#ff4444] hover:bg-[#ff3333] text-white"
                >
                  <Send className="h-4 w-4 mr-2" /> Post
                </Button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-2 p-3 bg-[#1a1a1a] rounded-lg border border-white/10">
                  <div className="grid grid-cols-10 gap-2">
                    {EMOJI_LIST.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GIF Picker */}
              {showGifPicker && (
                <div className="mt-2 p-3 bg-[#1a1a1a] rounded-lg border border-white/10">
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {GIF_CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {/* GIF placeholders - in production, fetch from Tenor/Giphy API */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="aspect-video bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center"
                        onClick={() => {
                          setSelectedGif(`https://via.placeholder.com/300x200?text=GIF+${i}`);
                          setShowGifPicker(false);
                        }}
                      >
                        <span className="text-gray-500 text-xs">GIF {i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-white/5 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Login to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#ff4444] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onReply={handleReply}
              formatTimestamp={formatTimestamp}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  onLike: (id: string) => void;
  onReply: (id: string, content: string) => void;
  formatTimestamp: (ts: number) => string;
}

function CommentItem({ comment, onLike, onReply, formatTimestamp }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReply(false);
    }
  };

  return (
    <div className="flex gap-3">
      <img
        src={comment.userAvatar || ''}
        alt={comment.userName}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium text-sm">{comment.userName}</span>
          <span className="text-gray-500 text-xs">{formatTimestamp(comment.timestamp)}</span>
        </div>
        <p className="text-gray-300 text-sm">{comment.content}</p>
        {comment.gif && (
          <img src={comment.gif} alt="GIF" className="mt-2 max-h-32 rounded" />
        )}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => onLike(comment.id)}
            className="text-gray-500 hover:text-[#ff4444] text-xs flex items-center gap-1"
          >
            ❤️ {comment.likes}
          </button>
          <button
            onClick={() => setShowReply(!showReply)}
            className="text-gray-500 hover:text-white text-xs"
          >
            Reply
          </button>
        </div>

        {/* Reply Input */}
        {showReply && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
            />
            <Button
              size="sm"
              onClick={handleReplySubmit}
              className="bg-[#ff4444] hover:bg-[#ff3333]"
            >
              Reply
            </Button>
          </div>
        )}

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l border-white/10">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <img
                  src={reply.userAvatar || ''}
                  alt={reply.userName}
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-xs">{reply.userName}</span>
                    <span className="text-gray-500 text-xs">{formatTimestamp(reply.timestamp)}</span>
                  </div>
                  <p className="text-gray-300 text-xs">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
