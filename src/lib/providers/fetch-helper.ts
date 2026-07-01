/**
 * Fetch helper that routes through the Vercel proxy in production
 * and makes direct requests in local development.
 */

const isProduction = import.meta.env.PROD;

export async function proxyFetch(url: string, options?: RequestInit): Promise<any> {
  if (isProduction) {
    const proxyUrl = `/api/proxy?target=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, options);
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
