// Provider Registry - manages all streaming providers
// Simple registry without extension complexity

import type {
  StreamingProvider,
  SearchOptions,
  SearchResult,
  Episode,
  ServerResult,
  ProviderCapabilities,
} from '@/types/streaming';

class ProviderRegistry {
  private providers: Map<string, StreamingProvider> = new Map();

  // Register a new provider
  register(provider: StreamingProvider): void {
    this.providers.set(provider.name, provider);
    console.log(`[ProviderRegistry] Registered: ${provider.name}`);
  }

  // Unregister a provider
  unregister(name: string): boolean {
    const deleted = this.providers.delete(name);
    if (deleted) {
      console.log(`[ProviderRegistry] Unregistered: ${name}`);
    }
    return deleted;
  }

  // Get a specific provider
  get(name: string): StreamingProvider | undefined {
    return this.providers.get(name);
  }

  // Get all providers sorted by priority
  getAll(): StreamingProvider[] {
    return Array.from(this.providers.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  // Get provider capabilities for UI
  getCapabilities(): ProviderCapabilities[] {
    return this.getAll().map((p) => ({
      name: p.name,
      supportsSub: p.supportsSub,
      supportsDub: p.supportsDub,
      supportsMultiServer: true, // All providers support multi-server via getServers
      supportsSubtitles: true, // Handled at VideoSource level
      supportsQualitySelection: true, // Handled at VideoSource level
    }));
  }

  // Search across all providers (parallel)
  async searchAll(options: SearchOptions): Promise<SearchResult[]> {
    const providers = this.getAll();
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        // Skip provider if it doesn't support the requested mode
        if (options.mode === 'dub' && !provider.supportsDub) return [];
        if (options.mode === 'sub' && !provider.supportsSub) return [];

        try {
          return await provider.search(options);
        } catch (error) {
          console.error(`[ProviderRegistry] Search failed for ${provider.name}:`, error);
          return [];
        }
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<SearchResult[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);
  }

  // Get episodes from specific provider
  async getEpisodes(providerName: string, id: string): Promise<Episode[]> {
    const provider = this.get(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }
    return provider.getEpisodes(id);
  }

  // Get servers from specific provider
  async getServers(providerName: string, episode: Episode): Promise<ServerResult[]> {
    const provider = this.get(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }
    return provider.getServers(episode);
  }

  // Get best server with fallback
  async getBestServer(
    episode: Episode,
    preferredServer?: string
  ): Promise<ServerResult> {
    const servers = await this.getServers(episode.provider, episode);

    if (servers.length === 0) {
      throw new Error('No servers available');
    }

    // Try preferred server first
    if (preferredServer) {
      const preferred = servers.find(
        (s) => s.server.toLowerCase() === preferredServer.toLowerCase()
      );
      if (preferred) return preferred;
    }

    // Return first server (highest priority)
    return servers[0];
  }

  // Get video with automatic fallback across providers
  async getVideoWithFallback(
    episode: Episode,
    preferredServer?: string
  ): Promise<ServerResult> {
    // Try the episode's provider first
    try {
      return await this.getBestServer(episode, preferredServer);
    } catch (error) {
      console.error(`[ProviderRegistry] Primary provider ${episode.provider} failed:`, error);
    }

    // Try other providers as fallback
    const otherProviders = this.getAll().filter((p) => p.name !== episode.provider);

    for (const provider of otherProviders) {
      try {
        // Search for the same anime on this provider
        const results = await provider.search({
          query: episode.title,
          mode: 'sub', // Default to sub for fallback
        });

        if (results.length > 0) {
          const episodes = await provider.getEpisodes(results[0].id);
          const matchingEpisode = episodes.find((e) => e.number === episode.number);

          if (matchingEpisode) {
            return await this.getBestServer(matchingEpisode, preferredServer);
          }
        }
      } catch (error) {
        console.error(`[ProviderRegistry] Fallback provider ${provider.name} failed:`, error);
      }
    }

    throw new Error('All providers failed');
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
