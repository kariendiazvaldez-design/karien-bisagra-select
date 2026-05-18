import ProjectDetail from "@/components/ProjectDetail";
import { projects } from "@/data/projects";

export default function ProjectWASHMA() {
  const project = projects.find((p) => p.id === "washma");
  if (!project) return null;
  return <ProjectDetail {...project} />;
}
