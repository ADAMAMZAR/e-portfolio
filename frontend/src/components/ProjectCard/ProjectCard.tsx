import { useState } from "react";
import { motion } from "framer-motion";

import type { Project } from "../../types/project";
import { useMagneticTilt } from "../../hooks/useMagneticTilt";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";
import { SkeletonCard } from "./SkeletonCard";
import "./ProjectCard.css";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave, prefersReducedMotion } = useMagneticTilt(15);

  const handleToggle = () => setIsFlipped((prev) => !prev);

  return (
    <motion.div
      ref={ref}
      className="card-container"
      style={{
        rotateX: !isFlipped && !prefersReducedMotion ? rotateX : 0,
        rotateY: !isFlipped && !prefersReducedMotion ? rotateY : 0
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {!loaded ? <SkeletonCard color={project.placeholderColor} /> : null}
      <motion.div
        className="card-inner"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Flip card: ${project.title}`}
        aria-pressed={isFlipped}
      >
        <CardFront project={project} loaded={loaded} onImageLoad={() => setLoaded(true)} />
        <CardBack project={project} />
      </motion.div>
    </motion.div>
  );
}
