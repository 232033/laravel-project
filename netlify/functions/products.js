// Netlify Function: products
// Provides global JSON storage for products using Netlify Blobs (recommended)
// Requires Node 18+ runtime on Netlify
// Set an environment variable ADMIN_TOKEN in Netlify for write access

export default async (req, context) => {
  // Enable CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const { blobs } = await import('@netlify/blobs');
    const store = blobs.createBlobStore({ name: 'trixa-store', siteID: context.site.id });
    const key = 'products.json';

    if (req.method === 'GET') {
      // Read products
      const blob = await store.get(key);
      if (!blob) {
        // If no blob yet, return empty array
        return json([]);
      }
      const text = await blob.text();
      return json(JSON.parse(text));
    }

    if (req.method === 'POST') {
      // Simple token check
      const token = req.headers.get('x-admin-token');
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return json({ error: 'unauthorized' }, 401);
      }
      const body = await req.json();
      if (!Array.isArray(body)) {
        return json({ error: 'invalid body, expected array' }, 400);
      }
      await store.set(key, JSON.stringify(body));
      return json({ ok: true });
    }

    return json({ error: 'method not allowed' }, 405);
  } catch (e) {
    return json({ error: e.message || 'internal error' }, 500);
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders() });
}
