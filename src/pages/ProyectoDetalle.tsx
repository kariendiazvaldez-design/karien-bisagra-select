import { useParams } from "react-router-dom";
import NotionProjectDetail from "@/components/NotionProjectDetail";

export default function ProyectoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;
  return <NotionProjectDetail slug={slug} />;
}
