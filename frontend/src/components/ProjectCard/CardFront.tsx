import type { Project } from "../../types/project";
import { ImageCarousel } from "./ImageCarousel";

type CardFrontProps = {
  project: Project;
  loaded: boolean;
  onImageLoad: () => void;
};

export function CardFront({ project, loaded, onImageLoad }: CardFrontProps) {
  return (
    <div className="card-face card-front">
      {!loaded ? null : project.featured ? (
        <span className="badge badge-featured">✦ Featured</span>
      ) : null}

      <ImageCarousel
        images={project.imageUrls || []}
        alt={project.title}
        loaded={loaded}
        onImageLoad={onImageLoad}
      />

      <div className="card-front-overlay">
        <h3>{project.title}</h3>
      </div>
    </div>
  );
}
