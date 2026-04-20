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

      <header className="portfolio-header">
        {state.status === "loading" ? (
          <SkeletonHero />
        ) : (
          <div className="header-container">
          <motion.div
            className="header-content"
            variants={heroContainer}
            initial="hidden"
            animate="visible"
          >
              <motion.div className="brand-section" variants={heroItem}>
                <img src="/icon.png" alt={profile.name || "Adam Amzar"} className="brand-logo" />
                <p className="eyebrow">{profile.eyebrow || "Adam Amzar | Full Stack AI Engineer"}</p>
              </motion.div>
              <motion.h1 variants={heroItem}>
                {profile.title ? (
                  profile.title.split(/(intelligent, |scalable AI)/).map((part, i) => 
                    part === "scalable AI" ? <span key={i} className="text-gradient">{part}</span> : part
                  )
                ) : (
                  <>Building intelligent, <span className="text-gradient">scalable AI</span> solutions.</>
                )}
              </motion.h1>
              <motion.p className="subtitle" variants={heroItem}>{profile.subtitle || "From LLM-powered applications to high-performance backends, I engineer systems that bridge the gap between AI research and production-ready products."}</motion.p>

              {/* ── Stats strip ── */}
              {/* <motion.div className="hero-stats" variants={heroItem}>
                {stats.map((stat) => (
                  <AnimatedStat key={stat.label} {...stat} />
                ))}
              </motion.div> */}
              
              <motion.div className="social-actions" variants={heroItem}>
                {profile.socials?.linkedin?.enabled && profile.socials?.linkedin?.url && (
                  <a href={profile.socials?.linkedin?.url} target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
                {profile.socials?.whatsapp?.enabled && profile.socials?.whatsapp?.url && (
                  <a href={profile.socials?.whatsapp?.url} target="_blank" rel="noopener noreferrer" className="social-btn whatsapp">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.407 3.481 2.242 2.242 3.48 5.23 3.481 8.411-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.301 1.664zm6.29-4.103c1.733.917 3.676 1.4 5.653 1.401 5.452 0 9.891-4.438 9.893-9.891 0-2.646-1.03-5.128-2.902-6.999-1.871-1.872-4.354-2.901-7.001-2.902-5.454 0-9.894 4.438-9.896 9.892-.001 2.016.521 3.98 1.515 5.703l-.999 3.646 3.733-.951zm11.332-6.859c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.199.299-.775.979-.95 1.178-.175.199-.35.224-.65.075-.3-.15-1.265-.467-2.41-1.488-.891-.795-1.492-1.777-1.667-2.076-.175-.299-.019-.462.13-.611.134-.133.301-.35.451-.524.15-.174.201-.299.301-.498.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.594-.511-.513-.7-.523-.179-.01-.383-.012-.588-.012-.204 0-.535.077-.815.38-.28.303-1.069 1.045-1.069 2.548 0 1.503 1.092 2.955 1.242 3.155.15.2 2.149 3.282 5.205 4.602.727.314 1.294.502 1.735.642.73.232 1.393.199 1.918.121.585-.087 1.78-.728 2.03-1.43.25-.701.25-1.302.175-1.43-.075-.125-.275-.199-.575-.349z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {profile.socials?.gmail?.enabled && profile.socials?.gmail?.url && (
                  <a href={`mailto:${profile.socials?.gmail?.url}`} className="social-btn gmail">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z"/>
                    </svg>
                    Gmail
                  </a>
                )}
                {profile.resume_url && (
                  <a href="/api/resume" target="_blank" rel="noopener noreferrer" className="social-btn resume">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                    Resume
                  </a>
                )}
              </motion.div>
            </motion.div>
            
            <motion.div
              className="header-image-wrapper"
              variants={heroImage}
              initial="hidden"
              animate="visible"
            >
              <div className="image-border-glow">
                {profile.image_url && (
                  <img 
                    src={profile.image_url} 
                    alt={profile.name || "Adam Amzar Profile"} 
                    className="profile-image" 
                    style={{
                      objectPosition: `${profile.image_x ?? 50}% ${profile.image_y ?? 50}%`,
                      transform: `scale(${profile.image_zoom ?? 1})`
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </header>

      {state.status === "error" ? <p className="error-banner">Failed to load projects: {state.message}</p> : null}

      <div className="section-label-row">
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

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <CommandBar />
      <Footer profile={profile} />
    </main>
  );
}

