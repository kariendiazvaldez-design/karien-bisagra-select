import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/notion/v1";
const DATABASE_ID = "360433d6-8c6e-80f7-944c-ff4408ac0a12";

function knownSlugFromTitle(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("innova")) return "innova-plus";
  if (t.includes("washma")) return "washma";
  if (t.includes("command z")) return "command-z";
  if (t.includes("patria")) return "patria-c";
  if (t.includes("huaca")) return "la-huaca";
  return null;
}

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const getPlain = (rich: any[] | undefined) =>
  Array.isArray(rich) ? rich.map((r) => r?.plain_text ?? "").join("") : "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    if (!LOVABLE_API_KEY || !NOTION_API_KEY) throw new Error("Missing credentials");

    const url = new URL(req.url);
    let slug = url.searchParams.get("slug") || "";
    if (!slug && req.method === "POST") {
      try { slug = (await req.json())?.slug || ""; } catch { /* ignore */ }
    }
    if (!slug) throw new Error("Missing slug");

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": NOTION_API_KEY,
      "Content-Type": "application/json",
    };

    const qRes = await fetch(`${GATEWAY_URL}/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({ page_size: 100 }),
    });
    const qData = await qRes.json();
    if (!qRes.ok) throw new Error(`Query failed [${qRes.status}]: ${JSON.stringify(qData)}`);

    const wanted = slug.toLowerCase();
    const page = (qData.results || []).find((pg: any) => {
      const p = pg.properties || {};
      const title = getPlain(p["Nombre del Proyecto"]?.title);
      const notionSlug = getPlain(p["Slug"]?.rich_text) || p["Slug"]?.select?.name || null;
      const candidates = [
        notionSlug ? slugify(notionSlug) : null,
        knownSlugFromTitle(title),
        slugify(title),
      ].filter(Boolean) as string[];
      return candidates.some((c) => c === wanted);
    });
    if (!page) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const p = page.properties || {};
    const cover = page.cover?.type === "external"
      ? page.cover.external?.url
      : page.cover?.type === "file" ? page.cover.file?.url : null;

    async function fetchChildren(blockId: string): Promise<any[]> {
      const all: any[] = [];
      let cursor: string | undefined;
      do {
        const qs = new URLSearchParams({ page_size: "100" });
        if (cursor) qs.set("start_cursor", cursor);
        const bRes = await fetch(`${GATEWAY_URL}/blocks/${blockId}/children?${qs}`, { headers });
        const bData = await bRes.json();
        if (!bRes.ok) throw new Error(`Blocks failed [${bRes.status}]: ${JSON.stringify(bData)}`);
        all.push(...(bData.results || []));
        cursor = bData.has_more ? bData.next_cursor : undefined;
      } while (cursor);
      for (const b of all) {
        if (b.has_children) {
          b.children = await fetchChildren(b.id);
        }
      }
      return all;
    }

    const blocks = await fetchChildren(page.id);

    const project = {
      id: page.id,
      slug,
      title: getPlain(p["Nombre del Proyecto"]?.title),
      description: getPlain(p["Descripción"]?.rich_text),
      cliente: (p["Cliente"]?.multi_select ?? []).map((o: any) => o.name),
      rol: (p["Rol"]?.multi_select ?? []).map((o: any) => o.name),
      tipo: (p["Tipo de proyecto"]?.multi_select ?? []).map((o: any) => o.name),
      herramientas: (p["Herramientas"]?.multi_select ?? []).map((o: any) => o.name),
      estado: p["Estado"]?.status?.name ?? p["Estado"]?.select?.name ?? null,
      fecha: p["Fecha de Finalización"]?.date?.start ?? p["Fecha de inicio"]?.date?.start ?? null,
      destacado: !!p["Destacado"]?.checkbox,
      cover,
      blocks,
    };

    return new Response(JSON.stringify({ project }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
