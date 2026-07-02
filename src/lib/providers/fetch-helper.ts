/**
 * Fetch helper that routes through the Vercel proxy in production
 * and uses a CORS proxy service in development.
 */

const isProduction = import.meta.env.PROD;
const PROXY_URL = '/api/proxy';

// CORS proxy for development (free service)
const CORS_PROXY = 'https://corsproxy.io/?';

export async function proxyFetch(url: string, options?: RequestInit): Promise<any> {
  const fetchUrl = isProduction
    ? `${PROXY_URL}?target=${encodeURIComponent(url)}`
    : `${CORS_PROXY}${encodeURIComponent(url)}`;

  const res = await fetch(fetchUrl, {
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

/**
 * Fetch HTML content through proxy
 */
export async function proxyFetchHtml(url: string, options?: RequestInit): Promise<string> {
  const fetchUrl = isProduction
    ? `${PROXY_URL}?target=${encodeURIComponent(url)}`
    : `${CORS_PROXY}${encodeURIComponent(url)}`;

  const res = await fetch(fetchUrl, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

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
  // In development, use CORS proxy for video URLs too
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}
