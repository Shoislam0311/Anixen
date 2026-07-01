export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { target } = req.query;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Missing target parameter' });
  }

  const ALLOWED = ['https://senshi.live', 'https://api.jikan.moe', 'https://animeheaven.me', 'https://ax.animeheaven.me'];
  if (!ALLOWED.some(o => target.startsWith(o))) {
    return res.status(403).json({ error: 'Target not allowed' });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    };

    if (req.method === 'POST') {
      const body = req.body;
      if (body && typeof body === 'object') {
        headers['Content-Type'] = 'application/json';
      }
    }

    const fetchOpts: any = {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers,
    };

    if (req.method === 'POST' && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(target, fetchOpts);
    const ct = response.headers.get('content-type') || '';

    if (ct.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    const text = await response.text();
    return res.status(response.status).setHeader('Content-Type', ct || 'text/plain').send(text);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return res.status(502).json({ error: 'Proxy request failed', detail: error.message });
  }
}
