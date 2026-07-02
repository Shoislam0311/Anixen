import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Referer, User-Agent, X-Requested-With, Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { target } = req.query;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Missing target parameter' });
  }

  // Allowed providers - expanded list
  const ALLOWED_DOMAINS = [
    'senshi.live',
    'api.jikan.moe',
    'animeheaven.me',
    'ax.animeheaven.me',
    'api.allanime.day',
    'allanime.day',
    'anikototv.to',
    'anikoto.cz',
    'anikoto.me',
    'anikoto.net',
    'sub.ryuo.to',
    'youtu-chan.com',
    'nekostream.site',
  ];

  try {
    const urlObj = new URL(target);
    const domain = urlObj.hostname;

    const isAllowed = ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
    if (!isAllowed) {
      console.error('Proxy blocked: domain not allowed', domain);
      return res.status(403).json({ error: 'Target domain not allowed', domain });
    }

    // Build headers based on target domain
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    // Set Referer and Origin based on target
    if (domain.includes('senshi')) {
      headers['Referer'] = 'https://senshi.live/';
      headers['Origin'] = 'https://senshi.live';
    } else if (domain.includes('animeheaven')) {
      headers['Referer'] = 'https://animeheaven.me/';
      headers['Origin'] = 'https://animeheaven.me';
    } else if (domain.includes('allanime')) {
      headers['Referer'] = 'https://youtu-chan.com';
      headers['Origin'] = 'https://youtu-chan.com';
    } else if (domain.includes('anikoto')) {
      headers['Referer'] = 'https://anikototv.to/';
      headers['Origin'] = 'https://anikototv.to';
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
      redirect: 'follow',
    };

    // Handle POST/PUT requests with body
    if (req.method === 'POST' || req.method === 'PUT') {
      let body = req.body;

      // If body is a string, try to parse it
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          // Keep as string
        }
      }

      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    console.log(`[Proxy] ${req.method} ${target}`);

    const response = await fetch(target, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    console.log(`[Proxy] Response: ${response.status} ${contentType}`);

    // Handle different content types
    if (contentType.includes('video') || contentType.includes('mpegurl') || contentType.includes('octet-stream')) {
      // Video/streaming content - buffer and forward
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(response.status).send(Buffer.from(buffer));
    }

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // Text/HTML content
    const text = await response.text();
    return res.status(response.status)
      .setHeader('Content-Type', contentType || 'text/plain')
      .send(text);

  } catch (error: any) {
    console.error('[Proxy] Error:', error.message);
    return res.status(502).json({
      error: 'Proxy request failed',
      detail: error.message,
      target,
    });
  }
}
