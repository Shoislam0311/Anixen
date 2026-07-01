// Anime Types from Jikan API
export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: {
    from: string | null;
    to: string | null;
    string: string;
  };
  duration: string;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
  genres: { mal_id: number; type: string; name: string; url: string }[];
  studios: { mal_id: number; type: string; name: string; url: string }[];
  producers: { mal_id: number; type: string; name: string; url: string }[];
  licensors: { mal_id: number; type: string; name: string; url: string }[];
  source: string;
  members: number;
  favorites: number;
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  episode: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  aired: string;
  score: number | null;
  filler: boolean;
  recap: boolean;
  synopsis: string | null;
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
}

export interface JikanResponse<T> {
  data: T[];
  pagination: JikanPagination;
}

export interface JikanSingleResponse<T> {
  data: T;
}

// Streaming Types (Mirai/Allanime)
export interface StreamSource {
  sourceName: string;
  sourceUrl: string;
  quality?: string;
}

export interface EpisodeDetail {
  sub?: string[];
  dub?: string[];
  raw?: string[];
}

// User Types (Supabase compatible)
export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  email_verified: boolean;
  created_at: string;
  bookmarks?: BookmarkItem[];
  watch_history?: WatchHistoryItem[];
}

export interface WatchHistoryItem {
  anime_id: number;
  anime_title: string;
  anime_image: string;
  episode_number: number;
  episode_title: string;
  timestamp: number;
  progress: number;
  duration: number;
}

export interface BookmarkItem {
  anime_id: number;
  title: string;
  image: string;
  score: number | null;
  type: string;
  added_at: number;
}

// UI Types
export interface CarouselSlide {
  id: number;
  title: string;
  image: string;
  coverImage: string;
  synopsis: string;
  type: string;
  duration: string;
  aired: string;
  score: number;
  rank: number;
  genres: string[];
}
