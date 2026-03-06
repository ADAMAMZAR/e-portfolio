import { useMemo, useState } from "react";

import type { Project } from "../types/project";

export function useProjectFilter(projects: Project[]) {
  const [activeTag, setActiveTag] = useState<string>("All");

  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => {
      project.techStack.forEach((tech) => set.add(tech));
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeTag === "All") return projects;
    return projects.filter((project) => project.techStack.includes(activeTag));
  }, [activeTag, projects]);

  return { activeTag, setActiveTag, tags, filteredProjects };
}
