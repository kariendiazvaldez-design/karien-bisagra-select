import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/notion/v1";
const DATABASE_ID = "360433d6-8c6e-80f7-944c-ff4408ac0a12";

// Map Notion title keywords -> internal project slug (for routing + images)
function slugFromTitle(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("innova")) return "innova-plus";
  if (t.includes("washma")) return "washma";
  if (t.includes("command z")) return "command-z";
  if (t.includes("patria")) return "patria-c";
  if (t.includes("huaca")) return "la-huaca";
  return null;
}

function richTextToPlain(rt: any[] | undefined): string {
  if (!rt || !Array.isArray(rt)) return "";
  return rt.map((r) => r?.plain_text ?? "").join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
  if (!LOVABLE_API_KEY || !NOTION_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing credentials" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": NOTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });

    if (!res.ok) {
      const body = await res.text();
      return new Response(JSON.stringify({ error: "Notion API error", status: res.status, body }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const projects = (data.results ?? []).map((page: any) => {
      const p = page.properties ?? {};
      const title = richTextToPlain(p["Nombre del Proyecto"]?.title);
      const description = richTextToPlain(p["Descripción"]?.rich_text);
      const tipo = (p["Tipo de proyecto"]?.multi_select ?? []).map((o: any) => o.name);
      const rol = (p["Rol"]?.multi_select ?? []).map((o: any) => o.name);
      const cliente = (p["Cliente"]?.multi_select ?? []).map((o: any) => o.name);
      const herramientas = (p["Herramientas"]?.multi_select ?? []).map((o: any) => o.name);
      const estado = p["Estado"]?.status?.name ?? null;
      const destacado = !!p["Destacado"]?.checkbox;
      const fecha = p["Fecha de Finalización"]?.date?.start ?? null;
      return {
        id: page.id,
        slug: slugFromTitle(title),
        title,
        description,
        tipo,
        rol,
        cliente,
        herramientas,
        estado,
        destacado,
        fecha,
      };
    });

    // Featured first, then by date desc
    projects.sort((a: any, b: any) => {
      if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
      const ad = a.fecha ? Date.parse(a.fecha) : 0;
      const bd = b.fecha ? Date.parse(b.fecha) : 0;
      return bd - ad;
    });

    return new Response(JSON.stringify({ projects }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
