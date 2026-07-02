/**
 * Unified Streaming Manager
 * Uses ProviderRegistry for clean provider management
 * Inspired by Seanime's architecture
 */

import { providerRegistry } from './provider-registry';
import { animeheavenProvider } from './providers/animeheaven-provider';
import { senshiProvider } from './providers/senshi-provider';
import { allanimeProvider } from './providers/allanime-provider';

import type {
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  VideoSource,
  Subtitle,
  SubDubMode,
  ProviderCapabilities,
} from '@/types/streaming';

// Re-export types for convenience
export type {
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  VideoSource,
  Subtitle,
  SubDubMode,
  ProviderCapabilities,
};

// Initialize providers
function initializeProviders() {
  providerRegistry.register(animeheavenProvider);
  providerRegistry.register(senshiProvider);
  providerRegistry.register(allanimeProvider);
}

// Initialize on module load
initializeProviders();

// ============ Public API ============

/**
 * Search for anime across all providers
 */
export async function searchAnime(
  query: string,
  mode: SubDubMode = 'sub',
  options?: Partial<SearchOptions>
): Promise<SearchResult[]> {
  return providerRegistry.searchAll({
    query,
    mode,
    ...options,
  });
}

/**
 * Get episodes from a specific provider
 */
export async function getEpisodes(
  providerName: string,
  id: string
): Promise<Episode[]> {
  return providerRegistry.getEpisodes(providerName, id);
}

/**
 * Get servers for an episode
 */
export async function getServers(
  providerName: string,
  episode: Episode
): Promise<ServerResult[]> {
  return providerRegistry.getServers(providerName, episode);
}

/**
 * Get best server with fallback
 */
export async function getBestServer(
  episode: Episode,
  preferredServer?: string
): Promise<ServerResult> {
  return providerRegistry.getBestServer(episode, preferredServer);
}

/**
 * Get video with automatic provider fallback
 */
export async function getVideoWithFallback(
  episode: Episode,
  preferredServer?: string
): Promise<ServerResult> {
  return providerRegistry.getVideoWithFallback(episode, preferredServer);
}

/**
 * Get all available providers and their capabilities
 */
export function getProviderCapabilities(): ProviderCapabilities[] {
  return providerRegistry.getCapabilities();
}

/**
 * Get provider by name
 */
export function getProvider(name: string) {
  return providerRegistry.get(name);
}

/**
 * Get all providers sorted by priority
 */
export function getAllProviders() {
  return providerRegistry.getAll();
}

// ============ Legacy API (for backward compatibility) ============

export type { SubDubMode as ProviderName };

// Legacy search function
export async function searchAllProviders(
  query: string,
  mode: SubDubMode = 'sub',
  malId?: number
): Promise<SearchResult[]> {
  return searchAnime(query, mode, { malId });
}

// Legacy getVideoServer function
export async function getVideoServer(
  _providerName: string,
  episode: Episode,
  server: string = 'Server 1'
): Promise<ServerResult> {
  return getBestServer(episode, server);
}

// Export proxy URL helper
export { getProxiedUrl } from './fetch-helper';
