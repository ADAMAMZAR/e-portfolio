import { useEffect, useState } from "react";
import "./ProjectModal.css";

export function ProjectModal({ project, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle body scroll locking
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!project) return null;

  const hasDemo = Boolean(project.demoLink);
  const hasRepo = Boolean(project.repoLink);
  const showIframe = hasDemo && !project.isConfidential;
  
  // Combine iframe and images into a single media array for the gallery
  const mediaList = [];
  if (showIframe) {
    mediaList.push({ type: 'iframe', url: project.demoLink });
  }
  if (project.imageUrls && project.imageUrls.length > 0) {
    project.imageUrls.forEach(url => {
      mediaList.push({ type: 'image', url });
    });
  }

  const currentMedia = mediaList[currentImageIndex];

  return (
    <div className="project-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="project-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <h2>{project.title}</h2>
          <button className="project-modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="project-modal-content">
          <div className="project-modal-media">
            {mediaList.length > 0 ? (
              <div className="modal-image-carousel">
                {currentMedia.type === 'iframe' ? (
                  <iframe 
                    key={`iframe-${currentImageIndex}`}
                    src={currentMedia.url} 
                    className="modal-iframe" 
                    title={`${project.title} Demo`}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                ) : (
                  <img 
                    key={`img-${currentImageIndex}`} 
                    src={currentMedia.url} 
                    alt={`${project.title} media ${currentImageIndex + 1}`} 
                  />
                )}

                {mediaList.length > 1 && (
                  <>
                    <div className="carousel-controls">
                      <button onClick={() => setCurrentImageIndex((p) => p === 0 ? mediaList.length - 1 : p - 1)}>&lt;</button>
                      <button onClick={() => setCurrentImageIndex((p) => (p + 1) % mediaList.length)}>&gt;</button>
                    </div>
                    <div className="modal-carousel-dots">
                      {mediaList.map((_, idx) => (
                        <button 
                          key={idx} 
                          className={`modal-dot ${idx === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ color: "var(--muted)" }}>No media available</div>
            )}
          </div>

          <div className="project-modal-details">
            <span className="project-modal-category">{project.category}</span>
            <p className="project-modal-desc">{project.description}</p>
            
            <div className="project-modal-section-title">Tech Stack</div>
            <div className="project-modal-tech">
              {(project.techStack || []).map(tech => (
                <span key={tech} className="modal-tech-pill">{tech}</span>
              ))}
            </div>

            {project.isConfidential ? (
              <div className="modal-nda-notice">
                <span className="modal-nda-icon">🔒</span>
                <div className="modal-nda-text">
                  <strong>NDA Restricted Project</strong>
                  <span>Links and source code are withheld to protect proprietary information. Technical overview and challenges can be discussed upon request.</span>
                </div>
              </div>
            ) : (
              <div className="project-modal-footer">
                {hasDemo && (
                  <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="modal-btn modal-btn-primary">
                    ↗ Open Live Demo
                  </a>
                )}
                {hasRepo && (
                  <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="modal-btn modal-btn-secondary">
                    View Source Code
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
