import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  loginUser,
  registerUser,
  logoutUser,
  resendVerification,
  resetPassword,
  updateUserProfile,
  uploadAvatar,
  getUserProfile,
  getBookmarks,
  getWatchHistory,
  subscribeToUserProfile,
  subscribeToBookmarks,
} from '@/lib/supabase';
import type { UserProfile } from '@/types';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  isLoggedIn: boolean;
  isVerified: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resendVerifyEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateAvatar: (photoURL: string) => Promise<void>;
  uploadAndSetAvatar: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    // Fetch initial profile with bookmarks and watch history
    const fetchProfile = async () => {
      try {
        const [profileData, bookmarksData, historyData] = await Promise.all([
          getUserProfile(user.id),
          getBookmarks(user.id),
          getWatchHistory(user.id),
        ]);
        const profileObj = profileData as Record<string, any>;
        setProfile({
          ...profileObj,
          bookmarks: bookmarksData,
          watch_history: historyData,
        } as UserProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();

    // Subscribe to realtime updates
    const unsubscribeProfile = subscribeToUserProfile(user.id, (data) => {
      setProfile(prev => prev ? { ...prev, ...(data as Record<string, any>) } : data as UserProfile);
    });

    const unsubscribeBookmarks = subscribeToBookmarks(user.id, (bookmarks) => {
      setProfile(prev => prev ? { ...prev, bookmarks } : null);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeBookmarks();
    };
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Authentication is not configured. Please set Supabase environment variables.');
      return false;
    }
    setAuthLoading(true);
    try {
      await loginUser(email, password);
      toast.success('Logged in successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Authentication is not configured. Please set Supabase environment variables.');
      return false;
    }
    setAuthLoading(true);
    try {
      await registerUser(email, password, displayName);
      toast.success('Account created! Please verify your email.');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      await logoutUser();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  }, []);

  const resendVerifyEmail = useCallback(async () => {
    if (!user?.email) return;
    try {
      await resendVerification(user.email);
      toast.success('Verification email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    }
  }, [user]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
      toast.success('Password reset email sent!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      return false;
    }
  }, []);

  const updateAvatar = useCallback(async (photoURL: string) => {
    if (!user) return;
    try {
      await updateUserProfile(user.id, { photo_url: photoURL });
      toast.success('Avatar updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update avatar');
    }
  }, [user]);

  const uploadAndSetAvatar = useCallback(async (file: File) => {
    if (!user) return null;
    try {
      const url = await uploadAvatar(user.id, file);
      await updateUserProfile(user.id, { photo_url: url });
      toast.success('Avatar uploaded!');
      return url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
      return null;
    }
  }, [user]);

  const isVerified = user?.email_confirmed_at != null || profile?.email_verified === true;
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user, profile, loading, authLoading,
      isLoggedIn, isVerified,
      login, register, logout,
      resendVerifyEmail, forgotPassword,
      updateAvatar, uploadAndSetAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
