/**
 * Fetch helper - uses corsproxy.io for all environments
 * This avoids needing a custom Vercel proxy function
 */

// Use corsproxy.io as CORS proxy for all requests
const CORS_PROXY = 'https://corsproxy.io/?url=';

export async function proxyFetch(url: string, options?: RequestInit): Promise<any> {
  const fetchUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;

  const res = await fetch(fetchUrl, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
  }

  return res.json();
}

/**
 * Fetch HTML content through CORS proxy
 */
export async function proxyFetchHtml(url: string, options?: RequestInit): Promise<string> {
  const fetchUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;

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
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}
