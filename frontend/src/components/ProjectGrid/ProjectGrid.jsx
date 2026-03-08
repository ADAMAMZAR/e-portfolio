import { AnimatePresence, motion } from "framer-motion";
import { ProjectCard } from "../ProjectCard/ProjectCard";

export function ProjectGrid({ projects }) {
  return (
    <div className="project-grid" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
