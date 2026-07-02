export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Referer, User-Agent, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { target } = req.query;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Missing target parameter' });
  }

  // Allowed providers
  const ALLOWED = [
    'https://senshi.live',
    'https://api.jikan.moe',
    'https://animeheaven.me',
    'https://ax.animeheaven.me',
    'https://api.allanime.day',
    'https://allanime.day',
    'https://anikototv.to',
    'https://anikoto.cz',
    'https://anikoto.me',
    'https://anikoto.net',
    'https://sub.ryuo.to',
  ];

  const isAllowed = ALLOWED.some(o => target.startsWith(o));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Target not allowed', target });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
    };

    // Set Referer based on target domain
    if (target.includes('senshi.live')) {
      headers['Referer'] = 'https://senshi.live/';
    } else if (target.includes('animeheaven.me')) {
      headers['Referer'] = 'https://animeheaven.me/';
    } else if (target.includes('allanime')) {
      headers['Referer'] = 'https://youtu-chan.com';
      headers['Origin'] = 'https://youtu-chan.com';
    } else if (target.includes('anikoto')) {
      headers['Referer'] = 'https://anikototv.to/';
    }

    // Forward client headers if provided
    if (req.headers['x-custom-referer']) {
      headers['Referer'] = req.headers['x-custom-referer'];
    }
    if (req.headers['x-custom-origin']) {
      headers['Origin'] = req.headers['x-custom-origin'];
    }

    const fetchOpts: any = {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers,
    };

    if (req.method === 'POST' && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(target, fetchOpts);
    const ct = response.headers.get('content-type') || '';

    // Handle video/m3u8 responses - stream directly
    if (ct.includes('video') || ct.includes('mpegurl') || ct.includes('octet-stream') || target.includes('.m3u8')) {
      res.setHeader('Content-Type', ct || 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
      const buffer = await response.arrayBuffer();
      return res.status(response.status).send(Buffer.from(buffer));
    }

    // Handle JSON responses
    if (ct.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // Handle text/HTML responses
    const text = await response.text();
    return res.status(response.status).setHeader('Content-Type', ct || 'text/plain').send(text);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return res.status(502).json({ error: 'Proxy request failed', detail: error.message });
  }
}
