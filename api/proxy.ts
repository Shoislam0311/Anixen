export default async function handler(req: any, res: any) {
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

  // Allowed domains
  const ALLOWED = [
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
  ];

  try {
    const urlObj = new URL(target);
    const domain = urlObj.hostname;

    const isAllowed = ALLOWED.some(d => domain === d || domain.endsWith('.' + d));
    if (!isAllowed) {
      return res.status(403).json({ error: 'Domain not allowed', domain });
    }

    // Build headers based on domain
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    };

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

    const fetchOptions: any = {
      method: req.method || 'GET',
      headers,
      redirect: 'follow',
    };

    // Handle POST body
    if (req.method === 'POST' || req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(target, fetchOptions);
    const ct = response.headers.get('content-type') || '';

    // Video/streaming content
    if (ct.includes('video') || ct.includes('mpegurl') || ct.includes('octet-stream')) {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', ct);
      return res.status(response.status).send(Buffer.from(buffer));
    }

    // JSON
    if (ct.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // Text/HTML
    const text = await response.text();
    return res.status(response.status).setHeader('Content-Type', ct || 'text/plain').send(text);

  } catch (error: any) {
    return res.status(502).json({ error: 'Proxy failed', detail: error.message });
  }
}
