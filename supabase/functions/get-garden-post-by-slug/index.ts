import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/notion/v1';
const GARDEN_DB_ID = '360433d68c6e809e9da6cdf34897e615';

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
    if (!slug && req.method === 'POST') {
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

    const fetchChildren = async (blockId: string): Promise<any[]> => {
      const children: any[] = [];
      let cursor: string | undefined;
      do {
        const qs = new URLSearchParams({ page_size: '100' });
        if (cursor) qs.set('start_cursor', cursor);
        const response = await fetch(`${GATEWAY_URL}/blocks/${blockId}/children?${qs}`, { headers });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Blocks failed [${response.status}]: ${JSON.stringify(data)}`);
        }
        const batch = await Promise.all(
          (data.results || []).map(async (block: any) => ({
            ...block,
            children: block.has_children ? await fetchChildren(block.id) : [],
          })),
        );
        children.push(...batch);
        cursor = data.has_more ? data.next_cursor : undefined;
      } while (cursor);
      return children;
    };

    const getPlain = (rich: any[]) =>
      Array.isArray(rich) && rich.length > 0 ? rich.map((r) => r.plain_text).join('') : '';

    const tryFilter = async (prop: string) =>
      fetch(`${GATEWAY_URL}/databases/${GARDEN_DB_ID}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: { property: prop, rich_text: { equals: slug } },
        }),
      });

    let qRes = await tryFilter('Slug');
    let qData = await qRes.json();
    if (!qRes.ok || !(qData.results || []).length) {
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

    const blocks = await fetchChildren(page.id);

    const post = {
      id: page.id,
      nombre: getPlain(p.Nombre?.title || p.Name?.title || []),
      category: p.Category?.select?.name || '',
      date: p.Date?.date?.start || page.created_time || '',
      excerpt: getPlain(p.Excerpt?.rich_text || []),
      maturity: p.Maturity?.select?.name || '',
      temas: (p.Temas?.multi_select || []).map((t: any) => t.name),
      tipo: p.Select?.select?.name || p.Tipo?.select?.name || '',
      coverUrl:
        p.URL?.url ||
        (page.cover?.type === 'external' ? page.cover.external?.url : page.cover?.file?.url) ||
        '',
      blocks,
    };

    return new Response(JSON.stringify({ post }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('get-garden-post-by-slug error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
