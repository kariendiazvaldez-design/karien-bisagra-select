import ProjectDetail from "@/components/ProjectDetail";
import { projects } from "@/data/projects";

export default function ProjectLaHuaca() {
  const project = projects.find((p) => p.id === "la-huaca");
  if (!project) return null;
  return <ProjectDetail {...project} />;
}
