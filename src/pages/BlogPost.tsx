import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PortableText } from "@portabletext/react";
import { sanityClient, urlFor } from "@/lib/sanityClient";
import { BLOG_POST_BY_SLUG_QUERY } from "@/lib/sanityQueries";

const BlogPost = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityClient
      .fetch(BLOG_POST_BY_SLUG_QUERY, { slug })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]" style={{ borderBottomWidth: "0.5px" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/lado-a" className="font-medium">← Karien.xyz</Link>
          <Link to="/lado-b" className="text-sm text-a-accent-soft hover:text-a-accent">Lado B →</Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 md:px-20 pt-32 pb-24">
        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : !data ? (
          <p className="text-muted-foreground">No se encontró la entrada.</p>
        ) : (
          <>
            {data.category && (
              <p className="text-[11px] uppercase tracking-[0.25em] text-a-accent-mid font-medium mb-4">
                {data.category}
              </p>
            )}
            <h1 className="font-extralight text-3xl md:text-5xl mb-6" style={{ letterSpacing: "-0.02em" }}>
              {data.title}
            </h1>
            {data.publishedAt && (
              <p className="text-xs text-a-accent-soft mb-10">
                {new Date(data.publishedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
              </p>
            )}
            {data.mainImage && (
              <img src={urlFor(data.mainImage).width(1000).url()} alt={data.title} className="w-full mb-10" />
            )}
            <div className="prose prose-neutral max-w-none">
              {data.body && <PortableText value={data.body} />}
              {!data.body && data.excerpt && <p>{data.excerpt}</p>}
            </div>
            <Link to="/lado-a#blog" className="inline-block mt-12 text-a-accent">
              ← Ver todas las entradas
            </Link>
          </>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
