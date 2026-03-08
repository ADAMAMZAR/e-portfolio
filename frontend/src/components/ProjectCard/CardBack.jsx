import { TechPill } from "../TechPill/TechPill";

export function CardBack({ project }) {
  return (
    <div className="card-face card-back">
      <h3>{project.title}</h3>
      <p>{project.shortDescription}</p>

      <div className="card-tech-list" aria-label="Technology stack">
        {project.techStack.map((tech) => (
          <TechPill key={`${project.id}-${tech}`} label={tech} />
        ))}
      </div>

      {project.isConfidential ? (
        <div className="card-lock">Confidential project. Links are restricted.</div>
      ) : (
        <div className="card-actions">
          {project.demoLink ? (
            <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="action-btn">
              Demo
            </a>
          ) : null}
          {project.repoLink ? (
            <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="action-btn">
              View Repo
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
