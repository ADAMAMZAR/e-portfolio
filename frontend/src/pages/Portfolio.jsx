import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FilterBar } from "../components/FilterBar/FilterBar";
import { ProjectGrid } from "../components/ProjectGrid/ProjectGrid";
import { LoginModal } from "../components/LoginModal/LoginModal";
import { CommandBar } from "../components/CommandBar/CommandBar";
import { SkeletonCard, SkeletonHero } from "../components/Skeleton/SkeletonCard";
import { Footer } from "../components/Footer/Footer";
import { useProjectFilter } from "../hooks/useProjectFilter";
import { useAuth } from "../context/AuthContext";
import { HeroChat } from "../components/HeroChat/HeroChat";
import { AboutMe } from "../components/AboutMe/AboutMe";

// ── Hero entrance animation variants ─────────────────────
const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroImage = {
  hidden: { opacity: 0, x: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

/** Count-up stat that animates when scrolled into view (fires once). */
function AnimatedStat({ value, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200; // slightly longer for premium feel
          const startTime = performance.now();

          const tick = (now) => {
            const t = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * value));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="hero-stat" ref={ref}>
      <span className="hero-stat-value">
        {count}{suffix}
      </span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

export function Portfolio() {
  const [state, setState] = useState({ status: "loading", projects: [], message: "" });
  const [profile, setProfile] = useState({
    name: "", eyebrow: "", title: "", subtitle: "", image_url: "", 
    image_zoom: 1, image_x: 50, image_y: 50, socials: {}
  });
  const [showLogin, setShowLogin] = useState(false);
  
  const { isAdmin, logout } = useAuth();
  const { activeTag, setActiveTag, tags, filteredProjects } = useProjectFilter(state.projects);

  // ── Hero stats data calculation (Dynamic) ─────────────────
  // const stats = useMemo(() => {
  //   const activeProjects = state.projects.filter(p => p.isActive === 1);
    
  //   const projectsCount = activeProjects.length;
    
  //   const aiKeywords = ["AI", "LLM", "ML", "Machine Learning", "OpenAI", "Llama", "Deep Learning", "Neural Network", "NLP"];
  //   const aiSystemsCount = activeProjects.filter(p => 
  //     p.category === "ml" || 
  //     p.techStack?.some(tech => aiKeywords.some(kw => tech.toUpperCase().includes(kw.toUpperCase())))
  //   ).length;

  //   const productionAppsCount = activeProjects.filter(p => p.demoLink && p.demoLink.trim() !== "").length;

  //   return [
  //     { value: projectsCount, suffix: "+", label: "Projects Built" },
  //     { value: aiSystemsCount, suffix: "",  label: "AI Systems" },
  //     { value: productionAppsCount, suffix: "",  label: "Production Apps" },
  //   ];
  // }, [state.projects]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, profRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/profile")
        ]);
        
        if (!projRes.ok) throw new Error("Failed to fetch projects");
        if (!profRes.ok) throw new Error("Failed to fetch profile");

        const [projData, profData] = await Promise.all([
          projRes.json(),
          profRes.json()
        ]);

        setState({ status: "ready", projects: projData, message: "" });
        setProfile(profData);
      } catch (err) {
        setState({ status: "error", message: err instanceof Error ? err.message : "Network error", projects: [] });
      }
    }
    fetchData();
  }, []);

  // Hidden admin shortcut: Alt + Shift + L
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Trigger login modal
      if (e.altKey && e.shiftKey && (e.key === "L" || e.key === "l")) {
        setShowLogin(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="portfolio-page">
      <div className="portfolio-admin-bar">
        {isAdmin ? (
          <>
            <a href="/admin" className="admin-link">⚙ Admin Panel</a>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : null}
      </div>

      <header className="portfolio-header" id="home">
        {state.status === "loading" ? (
          <SkeletonHero />
        ) : (
          <HeroChat profile={profile} />
        )}
      </header>

      {state.status === "error" ? <p className="error-banner">Failed to load projects: {state.message}</p> : null}

      {state.status !== "loading" && state.status !== "error" && (
        <>
          <div className="section-label-row" style={{ marginTop: "2rem" }}>
            <span className="section-eyebrow">✦ About Me</span>
            <span className="section-rule" aria-hidden="true" />
          </div>
          <AboutMe profile={profile} />
        </>
      )}

      <div className="section-label-row" id="projects">
        <span className="section-eyebrow">✦ Selected Works</span>
        <span className="section-rule" aria-hidden="true" />
      </div>

      <FilterBar tags={tags} activeTag={activeTag} onChange={setActiveTag} />

      {state.status === "loading" ? (
        <div className="project-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <ProjectGrid projects={filteredProjects} />
      )}

      <div className="section-label-row" id="skills" style={{ marginTop: "4rem" }}>
        <span className="section-eyebrow">✦ Skills & Expertise</span>
        <span className="section-rule" aria-hidden="true" />
      </div>
      <div className="skills-overview" style={{ margin: "1.5rem 0 5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem" }}>
          {tags.map(t => (
            <span key={t} style={{
              background: "linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.02))",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              padding: "0.6rem 1.2rem",
              borderRadius: "12px",
              color: "#e2e8f0",
              fontSize: "0.85rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div id="contact">
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        <CommandBar />
        <Footer profile={profile} />
      </div>
    </main>
  );
}

