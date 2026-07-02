// Provider exports
export { providerRegistry } from './provider-registry';
export { animeheavenProvider } from './providers/animeheaven-provider';
export { senshiProvider } from './providers/senshi-provider';
export { allanimeProvider } from './providers/allanime-provider';

// Streaming manager (main API)
export {
  searchAnime,
  getEpisodes,
  getServers,
  getBestServer,
  getVideoWithFallback,
  getProviderCapabilities,
  getProvider,
  getAllProviders,
  // Legacy API
  searchAllProviders,
  getVideoServer,
} from './streaming-manager';

// Types
export type {
  StreamingProvider,
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  VideoSource,
  Subtitle,
  SubDubMode,
  ProviderCapabilities,
} from '@/types/streaming';
