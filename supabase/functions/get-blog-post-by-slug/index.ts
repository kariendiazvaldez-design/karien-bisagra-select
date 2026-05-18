import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/notion/v1';
const BLOG_DB_ID = '360433d68c6e80a3be0efcdfb125636d';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');
    if (!NOTION_API_KEY) throw new Error('NOTION_API_KEY is not configured');

    const url = new URL(req.url);
    let slug = url.searchParams.get('slug') || '';
    if (!slug && (req.method === 'POST')) {
      try {
        const body = await req.json();
        slug = body?.slug || '';
      } catch { /* ignore */ }
    }
    if (!slug) throw new Error('Missing slug');

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': NOTION_API_KEY,
      'Content-Type': 'application/json',
    };

    const getPlain = (rich: any[]) =>
      Array.isArray(rich) && rich.length > 0 ? rich.map((r) => r.plain_text).join('') : '';

    // The blog database exposes the property as `Slug`.
    // Only fall back to `slug` if `Slug` itself is not a valid property.
    const tryFilter = async (prop: string) =>
      fetch(`${GATEWAY_URL}/databases/${BLOG_DB_ID}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: { property: prop, rich_text: { equals: slug } },
        }),
      });

    let qRes = await tryFilter('Slug');
    let qData = await qRes.json();
    if (!qRes.ok) {
      qRes = await tryFilter('slug');
      qData = await qRes.json();
    }
    if (!qRes.ok) throw new Error(`Query failed [${qRes.status}]: ${JSON.stringify(qData)}`);

    const page = (qData.results || [])[0];
    if (!page) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const p = page.properties || {};

    // Fetch all blocks (paginated)
    const blocks: any[] = [];
    let cursor: string | undefined;
    do {
      const qs = new URLSearchParams({ page_size: '100' });
      if (cursor) qs.set('start_cursor', cursor);
      const bRes = await fetch(`${GATEWAY_URL}/blocks/${page.id}/children?${qs}`, { headers });
      const bData = await bRes.json();
      if (!bRes.ok) throw new Error(`Blocks failed [${bRes.status}]: ${JSON.stringify(bData)}`);
      blocks.push(...(bData.results || []));
      cursor = bData.has_more ? bData.next_cursor : undefined;
    } while (cursor);

    const post = {
      id: page.id,
      title: getPlain(p.Title?.title || p.Name?.title || []),
      category: p.Category?.select?.name || '',
      date: page.created_time || '',
      excerpt: getPlain(p.Excerpt?.rich_text || []),
      tipo: p.Tipo?.select?.name || '',
      blocks,
    };

    return new Response(JSON.stringify({ post }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('get-blog-post-by-slug error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
