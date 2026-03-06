import type { Project } from "../types/project";

export function sortProjects(items: Project[]): Project[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return b.year - a.year;
  });
}
