import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Auth helpers
export const registerUser = async (email: string, password: string, displayName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw error;
  if (data.user) {
    // Create user profile in database
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      display_name: displayName,
      email_verified: false,
    });
    if (profileError) throw profileError;
  }
  return data.user;
};

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resendVerification = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const updateUserProfile = async (userId: string, updates: { display_name?: string; photo_url?: string }) => {
  const { error } = await supabase.from('users').update(updates).eq('id', userId);
  if (error) throw error;
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
};

export const addBookmark = async (userId: string, bookmark: {
  anime_id: number;
  title: string;
  image: string;
  score: number | null;
  type: string;
  added_at: number;
}) => {
  const { error } = await supabase.from('bookmarks').upsert({
    user_id: userId,
    anime_id: bookmark.anime_id,
    title: bookmark.title,
    image: bookmark.image,
    score: bookmark.score,
    type: bookmark.type,
    added_at: bookmark.added_at,
  }, { onConflict: 'user_id,anime_id' });
  if (error) throw error;
};

export const removeBookmark = async (userId: string, bookmark: { anime_id: number }) => {
  const { error } = await supabase.from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('anime_id', bookmark.anime_id);
  if (error) throw error;
};

export const getBookmarks = async (userId: string) => {
  const { data, error } = await supabase.from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addToWatchHistory = async (userId: string, item: {
  anime_id: number;
  anime_title: string;
  anime_image: string;
  episode_number: number;
  episode_title: string;
  timestamp: number;
  progress: number;
  duration: number;
}) => {
  const { error } = await supabase.from('watch_history').insert({
    user_id: userId,
    anime_id: item.anime_id,
    anime_title: item.anime_title,
    anime_image: item.anime_image,
    episode_number: item.episode_number,
    episode_title: item.episode_title,
    timestamp: item.timestamp,
    progress: item.progress,
    duration: item.duration,
  });
  if (error) throw error;
};

export const getWatchHistory = async (userId: string) => {
  const { data, error } = await supabase.from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
};

// Storage helpers
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `avatars/${userId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};

// Realtime subscription for user profile
export const subscribeToUserProfile = (userId: string, callback: (data: any) => void) => {
  const channel = supabase
    .channel(`user-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Realtime subscription for bookmarks
export const subscribeToBookmarks = (userId: string, callback: (data: any[]) => void) => {
  const channel = supabase
    .channel(`bookmarks-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const bookmarks = await getBookmarks(userId);
        callback(bookmarks);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Auth state is managed via supabase.auth.onAuthStateChange in useAuth hook
