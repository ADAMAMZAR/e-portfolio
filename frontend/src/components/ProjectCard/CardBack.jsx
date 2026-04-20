import { TechPill } from "../TechPill/TechPill";

const MAX_PILLS = 6;

export function CardBack({ project }) {
  const stack = project.techStack ?? [];
  const visibleStack = stack.slice(0, MAX_PILLS);
  const overflow = stack.length - MAX_PILLS;

  const hasDemo = Boolean(project.demoLink);
  const hasRepo = Boolean(project.repoLink);
  const hasLinks = hasDemo || hasRepo;

  return (
    <div className="card-face card-back">
      {/* Top: title + description */}
      <div className="card-back-top">
        <h3>{project.title}</h3>
        <p>{project.shortDescription}</p>
      </div>

      {/* Middle: tech stack */}
      <div className="card-tech-list" aria-label="Technology stack">
        {visibleStack.map((tech) => (
          <TechPill key={`${project.id}-${tech}`} label={tech} />
        ))}
        {overflow > 0 && (
          <span className="tech-pill-overflow" title={stack.slice(MAX_PILLS).join(", ")}>
            +{overflow} more
          </span>
        )}
      </div>

      {/* Bottom: links, lock notice, or wip */}
      {project.isConfidential ? (
        <div className="card-lock">🔒 Confidential — links are restricted.</div>
      ) : hasLinks ? (
        <div className="card-actions">
          {hasDemo && (
            <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-primary">
              ↗ Demo
            </a>
          )}
          {hasRepo && (
            <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-secondary">
              View Repo
            </a>
          )}
        </div>
      ) : (
        <div className="card-wip">🚧 Work in progress — check back soon.</div>
      )}
    </div>
  );
}
