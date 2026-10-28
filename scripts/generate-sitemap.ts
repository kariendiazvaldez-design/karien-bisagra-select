import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://karien.xyz";

const SUPABASE_URL = "https://aopsophqctgfldthfazl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvcHNvcGhxY3RnZmxkdGhmYXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTc2MjQsImV4cCI6MjA5Mzc3MzYyNH0.Lht8IBP8_q4H0LNhXzHz-nN9kq4yyQ3ovduFmUowqXE";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

async function fetchEdgeFunction(name: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Edge function ${name} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const staticEntries: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/lado-b", changefreq: "weekly", priority: "0.9" },
    { path: "/blog", changefreq: "weekly", priority: "0.8" },
    { path: "/portafolio/innova-plus", changefreq: "monthly", priority: "0.7" },
    { path: "/portafolio/washma", changefreq: "monthly", priority: "0.7" },
    { path: "/portafolio/command-z", changefreq: "monthly", priority: "0.7" },
    { path: "/portafolio/patria-c", changefreq: "monthly", priority: "0.7" },
    { path: "/portafolio/la-huaca", changefreq: "monthly", priority: "0.7" },
  ];

  let blogPosts: { slug: string; date?: string }[] = [];
  let gardenPosts: { slug: string; date?: string }[] = [];

  try {
    const blogData = await fetchEdgeFunction("get-blog-posts");
    blogPosts = (blogData?.posts || []).filter((p: any) => p.slug);
  } catch (e) {
    console.warn("Failed to fetch blog posts:", e);
  }

  try {
    const gardenData = await fetchEdgeFunction("get-garden-posts");
    gardenPosts = (gardenData?.posts || []).filter((p: any) => p.slug);
  } catch (e) {
    console.warn("Failed to fetch garden posts:", e);
  }

  const dynamicEntries: SitemapEntry[] = [
    ...blogPosts.map((p) => ({
      path: `/blog/${p.slug}`,
      lastmod: p.date ? new Date(p.date).toISOString().split("T")[0] : undefined,
      changefreq: "monthly" as const,
      priority: "0.6",
    })),
    ...gardenPosts.map((p) => ({
      path: `/jardin/${p.slug}`,
      lastmod: p.date ? new Date(p.date).toISOString().split("T")[0] : undefined,
      changefreq: "monthly" as const,
      priority: "0.6",
    })),
  ];

  const entries = [...staticEntries, ...dynamicEntries];

  function generateSitemap(entries: SitemapEntry[]) {
    const urls = entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n")
    );

    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls,
      `</urlset>`,
    ].join("\n");
  }

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
