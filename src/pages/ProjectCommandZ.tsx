import ProjectDetail from "@/components/ProjectDetail";
import { projects } from "@/data/projects";

export default function ProjectCommandZ() {
  const project = projects.find((p) => p.id === "command-z");
  if (!project) return null;
  return <ProjectDetail {...project} />;
}
