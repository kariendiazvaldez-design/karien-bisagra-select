import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PortableText } from "@portabletext/react";
import { sanityClient, urlFor } from "@/lib/sanityClient";
import { CASE_STUDY_BY_SLUG_QUERY } from "@/lib/sanityQueries";

const CaseStudy = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityClient
      .fetch(CASE_STUDY_BY_SLUG_QUERY, { slug })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="lado-a font-lexend min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-[#D4CFC5]" style={{ borderBottomWidth: "0.5px" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">
          <Link to="/" className="font-medium">← Karien.xyz</Link>
          <Link to="/lado-b" className="text-sm text-a-accent-soft hover:text-a-accent">Lado B →</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 md:px-20 pt-32 pb-24">
        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : !data ? (
          <p className="text-muted-foreground">No se encontró el proyecto.</p>
        ) : (
          <>
            {data.tag && (
              <p className="text-[11px] uppercase tracking-[0.25em] text-a-accent-mid font-medium mb-4">
                {data.tag}
              </p>
            )}
            <h1 className="font-extralight text-4xl md:text-6xl mb-6" style={{ letterSpacing: "-0.02em" }}>
              {data.title}
            </h1>
            {data.excerpt && (
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{data.excerpt}</p>
            )}
            {data.mainImage && (
              <img
                src={urlFor(data.mainImage).width(1200).url()}
                alt={data.title}
                className="w-full mb-10"
              />
            )}
            <div className="prose prose-neutral max-w-none">
              {data.body && <PortableText value={data.body} />}
              {!data.body && data.description && <p>{data.description}</p>}
            </div>
            <Link to="/#proyectos" className="inline-block mt-12 text-a-accent">
              ← Ver todos los proyectos
            </Link>
          </>
        )}
      </article>
    </div>
  );
};

export default CaseStudy;
