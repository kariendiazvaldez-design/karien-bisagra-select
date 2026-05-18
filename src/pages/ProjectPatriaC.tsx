import ProjectDetail from "@/components/ProjectDetail";
import { projects } from "@/data/projects";

export default function ProjectPatriaC() {
  const project = projects.find((p) => p.id === "patria-c");
  if (!project) return null;
  return <ProjectDetail {...project} />;
}
