import { useMemo, useState } from "react";

export function useProjectFilter(projects) {
  const [activeTag, setActiveTag] = useState("All");

  const tags = useMemo(() => {
    const set = new Set();
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
