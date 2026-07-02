/**
 * Fetch helper - routes through Vercel proxy for CORS
 */

const PROXY = '/api/proxy';

export async function proxyFetch(url: string, options?: RequestInit): Promise<any> {
  const proxyUrl = `${PROXY}?target=${encodeURIComponent(url)}`;

  const res = await fetch(proxyUrl, {
    method: options?.method || 'GET',
    headers: options?.headers as Record<string, string>,
    body: options?.body,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`);
  }

  return res.json();
}

export async function proxyFetchHtml(url: string, options?: RequestInit): Promise<string> {
  const proxyUrl = `${PROXY}?target=${encodeURIComponent(url)}`;

  const res = await fetch(proxyUrl, {
    method: options?.method || 'GET',
    headers: options?.headers as Record<string, string>,
    body: options?.body,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export function getProxiedUrl(url: string): string {
  if (!url) return url;
  return `${PROXY}?target=${encodeURIComponent(url)}`;
}
