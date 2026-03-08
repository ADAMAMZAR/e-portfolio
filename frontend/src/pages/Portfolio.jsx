import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar/FilterBar";
import { ProjectGrid } from "../components/ProjectGrid/ProjectGrid";
import { LoginModal } from "../components/LoginModal/LoginModal";
import { useProjectFilter } from "../hooks/useProjectFilter";
import { useAuth } from "../context/AuthContext";
import { projectsSchema } from "../types/project";
import { sortProjects } from "../utils/sortProjects";

export function Portfolio() {
  const [state, setState] = useState({ status: "loading" });
  const [showLogin, setShowLogin] = useState(false);
  const { isAdmin, logout } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const json = await response.json();
        const parsed = projectsSchema.parse(json);
        setState({ status: "ready", projects: sortProjects(parsed) });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ status: "error", message });
      }
    }

    fetchProjects();
    return () => controller.abort();
  }, []);

  const projects = useMemo(() => (state.status === "ready" ? state.projects : []), [state]);
  const { tags, activeTag, setActiveTag, filteredProjects } = useProjectFilter(projects);

  return (
    <main className="portfolio-page">
      {/* Admin controls */}
      <div className="portfolio-admin-bar">
        {isAdmin ? (
          <>
            <a href="/admin" className="admin-link">⚙ Admin Panel</a>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="login-btn" onClick={() => setShowLogin(true)}>🔐 Login</button>
        )}
      </div>

      <header className="portfolio-header">
        <img src="/icon.png" alt="Adam Amzar" className="brand-logo" />
        <p className="eyebrow">Adam Amzar | Full Stack AI Engineer</p>
        <h1>Building intelligent, scalable AI solutions.</h1>
        <p className="subtitle">From LLM-powered applications to high-performance backends, I engineer systems that bridge the gap between AI research and production-ready products.</p>
      </header>

      {state.status === "error" ? <p className="error-banner">Failed to load projects: {state.message}</p> : null}

      <FilterBar tags={tags} activeTag={activeTag} onChange={setActiveTag} />

      {state.status === "loading" ? (
        <p className="loading-copy">Loading portfolio data...</p>
      ) : (
        <ProjectGrid projects={filteredProjects} />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}
