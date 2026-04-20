import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ProjectCard } from "../ProjectCard/ProjectCard";
import { ProjectModal } from "../ProjectModal/ProjectModal";

export function ProjectGrid({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <>
      <div className="project-grid" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(index * 0.06, 0.3),
              }}
            >
              <ProjectCard 
                project={project} 
                onProjectClick={() => setSelectedProject(project)} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

