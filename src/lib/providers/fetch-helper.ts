/**
 * Fetch helper that routes through the Vercel proxy in production
 * and makes direct requests in local development.
 */

const isProduction = import.meta.env.PROD;
const PROXY_URL = '/api/proxy';

export async function proxyFetch(url: string, options?: RequestInit): Promise<any> {
  if (isProduction) {
    const proxyUrl = `${PROXY_URL}?target=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || err.detail || `Request failed (${res.status})`);
    }
    return res.json();
  }
  // Local development: direct fetch
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch HTML content through proxy
 */
export async function proxyFetchHtml(url: string, options?: RequestInit): Promise<string> {
  if (isProduction) {
    const proxyUrl = `${PROXY_URL}?target=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Build a proxied URL for video/HLS streams
 */
export function getProxiedUrl(url: string): string {
  if (!url) return url;
  if (isProduction) {
    return `${PROXY_URL}?target=${encodeURIComponent(url)}`;
  }
  return url;
}
