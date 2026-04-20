import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AboutMe.css";

const bentoVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { staggerChildren: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function AboutMe({ profile }) {
  const nameParts = (profile?.name || "ADAM AMZAR").split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const title = profile?.title || "FULLSTACK AI ENGINEER";

  const imageUrls = profile?.image_url 
    ? profile.image_url.split(",").map(s => s.trim()).filter(Boolean)
    : [];
    
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIdx(prev => (prev + 1) % imageUrls.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [imageUrls.length]);

  return (
    <section className="about-bento-section" id="about">
      <motion.div 
        className="bento-grid"
        variants={bentoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        
        <motion.div className="bento-card name-card" variants={cardVariants}>
          <div className="name-wrapper">
            <h2 className="bento-name">{firstName.toUpperCase()}</h2>
            <h2 className="bento-name last-name">{lastName.toUpperCase()}</h2>
          </div>
          <p className="bento-role">{title.toUpperCase()}</p>
        </motion.div>

        <motion.div className="bento-card edu-card" variants={cardVariants}>
          <span className="hover-hint">HOVER TO READ MORE</span>
          <div className="edu-carousel">
            <div className="edu-item">
              <h4>EXPERIENCE</h4>
              <p>Leveraged rigorous Manual App Testing protocols to identify critical UX bottlenecks and ensure high-standard software delivery.</p>
            </div>
            <div className="edu-item active-edu">
              <h4>EDUCATION</h4>
              <p>Specializing in Computer Science at UiTM Shah Alam with a technical focus on integrating AI-driven solutions into modern architectures.</p>
            </div>
            <div className="edu-item">
              <h4>COMPETITION</h4>
              <p>Rapidly prototyping full-stack applications through intensive hackathons to solve complex problems under high-pressure constraints.</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="bento-card mindset-card" variants={cardVariants}>
          <h3 className="bento-card-title">Mindset</h3>
          <p className="bento-text">
            <strong>Building more than software.</strong> My passions provide the <strong>discipline and focus</strong> I need to grow.
          </p>
          
          <div className="passion-stack">
            <div className="passion-item passion-hiking">
               <div className="passion-label">HIKING</div>
            </div>
            <div className="passion-item passion-badminton">
               <div className="passion-label">BADMINTON</div>
            </div>
            <div className="passion-item passion-fashion">
               <div className="passion-label">FASHION</div>
            </div>
          </div>

          <p className="bento-text mindset-footer">
            <strong>Mastering body and mind</strong> is my path to <strong>excellence.</strong>
          </p>
        </motion.div>

        <motion.div className="bento-card profile-img-card" variants={cardVariants}>
          {imageUrls.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImgIdx}
                src={imageUrls[currentImgIdx]} 
                alt={profile.name} 
                className="bento-profile-pic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: "absolute",
                  objectPosition: `${profile.image_x ?? 50}% ${profile.image_y ?? 50}%`,
                  transform: `scale(${profile.image_zoom ?? 1})`
                }}
              />
            </AnimatePresence>
          ) : (
            <div className="bento-profile-placeholder"></div>
          )}
        </motion.div>

        <motion.div className="bento-card craft-card" variants={cardVariants}>
          <h3 className="bento-card-title">Craft</h3>
          
          <p className="bento-text intro">
            Building scalable <strong>apps, AI systems, and automations.</strong>
          </p>
          <p className="bento-text desc">
            {profile?.subtitle || "I understand what advantages modern tech can provide, helping me advise on the solutions a business actually needs."}
          </p>

          <div className="tech-marquee-wrapper">
             <div className="tech-marquee">
               <span className="tech-tag">REACT.JS</span>
               <span className="tech-tag">·</span>
               <span className="tech-tag">FASTAPI</span>
               <span className="tech-tag">·</span>
               <span className="tech-tag">AI/LLM</span>
               <span className="tech-tag">·</span>
               <span className="tech-tag">N8N</span>
               <span className="tech-tag">·</span>
               {/* We render the same items twice so the scrolling animation loops seamlessly forever */}
               <span className="tech-tag">REACT.JS</span>
               <span className="tech-tag">·</span>
               <span className="tech-tag">FASTAPI</span>
               <span className="tech-tag">·</span>
               <span className="tech-tag">AI/LLM</span>
               <span className="tech-tag">·</span>
               <span className="tech-tag">N8N</span>
               <span className="tech-tag">·</span>
             </div>
          </div>

          <div className="craft-footer">
            <div className="status-badge">
              <div className="status-dot"></div>
              <span>Open to collaboration & freelance</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="bento-card location-card" variants={cardVariants}>
          <div className="location-info">
            <h3>SELANGOR, MY</h3>
            <p className="coordinates">3.0738° N, 101.5183° E</p>
            <p className="timezone"><span className="pulse-dot"></span> GMT+8</p>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
