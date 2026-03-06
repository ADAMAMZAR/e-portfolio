import type { Project } from "../../types/project";

type CardFrontProps = {
  project: Project;
  loaded: boolean;
  onImageLoad: () => void;
};

export function CardFront({ project, loaded, onImageLoad }: CardFrontProps) {
  return (
    <div className="card-face card-front">
      {!loaded ? null : project.featured ? <span className="badge badge-featured">Featured</span> : null}
      <img
        className={`card-image ${loaded ? "is-visible" : ""}`}
        src={project.imageUrl}
        alt={project.description}
        loading="lazy"
        onLoad={onImageLoad}
      />
      <div className="card-front-overlay">
        <h3>{project.title}</h3>
      </div>
    </div>
  );
}
