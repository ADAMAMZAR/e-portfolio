import "../../styles/globals.css";

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card-img" />
      <div className="skeleton skeleton-text" style={{ width: "40%", height: "0.8rem" }} />
      <div className="skeleton skeleton-text" style={{ width: "80%", height: "1.5rem", marginBottom: "0.5rem" }} />
      <div className="skeleton skeleton-text" style={{ width: "95%" }} />
      <div className="skeleton skeleton-text" style={{ width: "90%" }} />
      <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
        <div className="skeleton" style={{ width: "60px", height: "24px", borderRadius: "12px" }} />
        <div className="skeleton" style={{ width: "60px", height: "24px", borderRadius: "12px" }} />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="header-container" style={{ pointerEvents: "none" }}>
      <div className="header-content">
        <div className="brand-section">
          <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "12px" }} />
          <div className="skeleton skeleton-text" style={{ width: "200px" }} />
        </div>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" style={{ width: "60%" }} />
        <div className="skeleton skeleton-text" style={{ width: "55%" }} />
        <div className="social-actions">
           <div className="skeleton" style={{ width: "120px", height: "40px", borderRadius: "10px" }} />
           <div className="skeleton" style={{ width: "120px", height: "40px", borderRadius: "10px" }} />
        </div>
      </div>
      <div className="header-image-wrapper">
        <div className="image-border-glow" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="skeleton skeleton-circle" style={{ width: "100%", height: "100%", borderRadius: "24px" }} />
        </div>
      </div>
    </div>
  );
}
