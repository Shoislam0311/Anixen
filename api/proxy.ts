export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const target = req.query.target as string;

  if (!target) {
    return res.status(400).json({ error: 'Missing target' });
  }

  // Check domain
  let domain = '';
  try {
    domain = new URL(target).hostname;
  } catch {
    return res.status(400).json({ error: 'Invalid URL', target });
  }

  const ALLOWED = [
    'senshi.live', 'api.jikan.moe', 'animeheaven.me',
    'ax.animeheaven.me', 'api.allanime.day', 'allanime.day',
    'anikototv.to', 'anikoto.cz', 'anikoto.me', 'anikoto.net',
    'sub.ryuo.to', 'youtu-chan.com',
  ];

  if (!ALLOWED.some(d => domain.endsWith(d))) {
    return res.status(403).json({ error: 'Blocked domain', domain });
  }

  // Set headers per domain
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': '*/*',
  };

  if (domain.includes('senshi')) {
    headers['Referer'] = 'https://senshi.live/';
  } else if (domain.includes('animeheaven')) {
    headers['Referer'] = 'https://animeheaven.me/';
  } else if (domain.includes('allanime')) {
    headers['Referer'] = 'https://youtu-chan.com';
  }

  const opts: any = { method: req.method, headers };

  if (req.method === 'POST') {
    // Forward body as-is
    opts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    headers['Content-Type'] = 'application/json';
  }

  try {
    const r = await fetch(target, opts);
    const ct = r.headers.get('content-type') || '';

    if (ct.includes('video') || ct.includes('mpegurl')) {
      const buf = await r.arrayBuffer();
      res.setHeader('Content-Type', ct);
      return res.status(r.status).send(Buffer.from(buf));
    }

    if (ct.includes('json')) {
      return res.status(r.status).json(await r.json());
    }

    return res.status(r.status).setHeader('Content-Type', ct).send(await r.text());
  } catch (e: any) {
    return res.status(502).json({ error: e.message });
  }
}
