// Streaming Provider Interface & Types
// Inspired by Seanime's architecture but simpler - no extension system

export type SubDubMode = 'sub' | 'dub' | 'raw';

// Standardized search options passed to providers
export interface SearchOptions {
  query: string;
  mode: SubDubMode;
  year?: number;
  malId?: number;
  // Provider can use these for better matching
  synonyms?: string[];
  episodeCount?: number;
}

// Standardized search result from any provider
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  subOrDub: SubDubMode;
  provider: string;
  // Optional metadata for better matching
  year?: number;
  image?: string;
}

// Standardized episode from any provider
export interface Episode {
  id: string;
  title: string;
  number: number;
  url: string;
  provider: string;
  // Optional metadata
  image?: string;
  aired?: string;
}

// Subtitle track
export interface Subtitle {
  id: string;
  url: string;
  language: string;
  label: string;
  isDefault?: boolean;
}

// Video source with quality and subtitles
export interface VideoSource {
  url: string;
  quality: string; // '360p', '480p', '720p', '1080p', 'auto'
  type: 'mp4' | 'm3u8';
  subtitles: Subtitle[];
  // Optional metadata
  width?: number;
  height?: number;
  size?: number; // bytes
}

// Server result with headers and multiple video sources
export interface ServerResult {
  server: string;
  provider: string;
  headers: Record<string, string>;
  videoSources: VideoSource[];
  // Server metadata
  name?: string;
  priority?: number; // Lower = preferred
}

// Provider interface - implement this to add a new provider
export interface StreamingProvider {
  readonly name: string;
  readonly priority: number; // Lower = try first
  readonly supportsSub: boolean;
  readonly supportsDub: boolean;

  // Core methods - must implement
  search(options: SearchOptions): Promise<SearchResult[]>;
  getEpisodes(id: string): Promise<Episode[]>;
  getServers(episode: Episode): Promise<ServerResult[]>;
}

// Provider capabilities for UI display
export interface ProviderCapabilities {
  name: string;
  supportsSub: boolean;
  supportsDub: boolean;
  supportsMultiServer: boolean;
  supportsSubtitles: boolean;
  supportsQualitySelection: boolean;
}
