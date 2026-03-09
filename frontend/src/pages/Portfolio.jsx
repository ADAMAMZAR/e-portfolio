import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar/FilterBar";
import { ProjectGrid } from "../components/ProjectGrid/ProjectGrid";
import { LoginModal } from "../components/LoginModal/LoginModal";
import { useProjectFilter } from "../hooks/useProjectFilter";
import { useAuth } from "../context/AuthContext";
import { projectsSchema } from "../types/project";
import { sortProjects } from "../utils/sortProjects";

export function Portfolio() {
  /** @type {[ { status: string, projects: any[], message: string }, React.Dispatch<React.SetStateAction<{ status: string, projects: any[], message: string }>> ]} */
  const [state, setState] = useState({ status: "loading", projects: [], message: "" });
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
        setState({ status: "ready", projects: sortProjects(parsed), message: "" });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ status: "error", projects: [], message });
      }
    }

    fetchProjects();
    return () => controller.abort();
  }, []);

  // Hidden admin shortcut: Alt + Shift + L
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && e.key === "L") {
        setShowLogin(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        ) : null}
      </div>

      <header className="portfolio-header">
        <div className="header-container">
          <div className="header-content">
            <div className="brand-section">
              <img src="/icon.png" alt="Adam Amzar" className="brand-logo" />
              <p className="eyebrow">Adam Amzar | Full Stack AI Engineer</p>
            </div>
            <h1>Building intelligent, <span className="text-gradient">scalable AI</span> solutions.</h1>
            <p className="subtitle">From LLM-powered applications to high-performance backends, I engineer systems that bridge the gap between AI research and production-ready products.</p>
            
            <div className="social-actions">
              <a href="https://www.linkedin.com/in/adamamzar/" target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
              <a href="https://wa.me/+60197920048" target="_blank" rel="noopener noreferrer" className="social-btn whatsapp">
                <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.407 3.481 2.242 2.242 3.48 5.23 3.481 8.411-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.301 1.664zm6.29-4.103c1.733.917 3.676 1.4 5.653 1.401 5.452 0 9.891-4.438 9.893-9.891 0-2.646-1.03-5.128-2.902-6.999-1.871-1.872-4.354-2.901-7.001-2.902-5.454 0-9.894 4.438-9.896 9.892-.001 2.016.521 3.98 1.515 5.703l-.999 3.646 3.733-.951zm11.332-6.859c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.199.299-.775.979-.95 1.178-.175.199-.35.224-.65.075-.3-.15-1.265-.467-2.41-1.488-.891-.795-1.492-1.777-1.667-2.076-.175-.299-.019-.462.13-.611.134-.133.301-.35.451-.524.15-.174.201-.299.301-.498.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.594-.511-.513-.7-.523-.179-.01-.383-.012-.588-.012-.204 0-.535.077-.815.38-.28.303-1.069 1.045-1.069 2.548 0 1.503 1.092 2.955 1.242 3.155.15.2 2.149 3.282 5.205 4.602.727.314 1.294.502 1.735.642.73.232 1.393.199 1.918.121.585-.087 1.78-.728 2.03-1.43.25-.701.25-1.302.175-1.43-.075-.125-.275-.199-.575-.349z"/>
                </svg>
                WhatsApp
              </a>
              <a href="mailto:adamnajmin15@gmail.com" className="social-btn gmail">
                <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z"/>
                </svg>
                Email
              </a>
            </div>
          </div>
          
          <div className="header-image-wrapper">
            <div className="image-border-glow">
              <img src="/profile.jpg" alt="Adam Amzar Profile" className="profile-image" />
            </div>
          </div>
        </div>
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
