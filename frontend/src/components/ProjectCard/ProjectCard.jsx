import { useState } from "react";
import { motion } from "framer-motion";
import { useMagneticTilt } from "../../hooks/useMagneticTilt";
import { CardFront } from "./CardFront";
import { SkeletonCard } from "./SkeletonCard";
import "./ProjectCard.css";

export function ProjectCard({ project, onProjectClick }) {
  const [loaded, setLoaded] = useState(false);
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave, prefersReducedMotion } = useMagneticTilt(15);

  return (
    <motion.div
      ref={ref}
      className="card-container"
      style={{
        rotateX: !prefersReducedMotion ? rotateX : 0,
        rotateY: !prefersReducedMotion ? rotateY : 0,
        cursor: "pointer"
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onProjectClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (onProjectClick) onProjectClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details: ${project.title}`}
    >
      {!loaded ? <SkeletonCard color={project.placeholderColor} /> : null}
      <motion.div className="card-inner">
        <CardFront project={project} loaded={loaded} onImageLoad={() => setLoaded(true)} />
      </motion.div>
    </motion.div>
  );
}
