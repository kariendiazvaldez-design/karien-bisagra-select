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

    const response = await fetch(`${GATEWAY_URL}/databases/${BLOG_DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': NOTION_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'published',
          checkbox: { equals: true },
        },
        sorts: [{ property: 'date', direction: 'descending' }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Notion API call failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    const getPlainText = (rich: any[]) =>
      Array.isArray(rich) && rich.length > 0 ? rich.map((r) => r.plain_text).join('') : '';

    const posts = (data.results || []).map((page: any) => {
      const p = page.properties || {};
      return {
        id: page.id,
        title: getPlainText(p.Title?.title || p.title?.title || []),
        slug: getPlainText(p.slug?.rich_text || []),
        category: p.category?.select?.name || '',
        excerpt: getPlainText(p.excerpt?.rich_text || []),
        date: p.date?.date?.start || '',
      };
    });

    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('get-blog-posts error:', message);
    return new Response(JSON.stringify({ error: message, posts: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
