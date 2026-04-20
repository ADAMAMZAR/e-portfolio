import { useState, useEffect } from "react";
import "./NavBar.css";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" }
];

export function NavBar() {
  const [activeItem, setActiveItem] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Simple implementation to detect which section is currently viewed
      const sections = navItems.map(item => ({
        name: item.name,
        element: document.getElementById(item.href.substring(1))
      }));

      // Find the furthest section that has been scrolled to
      let currentActive = "Home";
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          // If the top of the section is somewhat near or passing the middle of screen
          if (rect.top <= window.innerHeight / 3) {
            currentActive = section.name;
          }
        }
      }
      setActiveItem(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e, href, name) => {
    e.preventDefault();
    setActiveItem(name);
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <div className={`navbar-container ${isScrolled ? "scrolled" : ""}`}>
      <nav className="floating-navbar">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => handleClick(e, item.href, item.name)}
            className={`nav-item ${activeItem === item.name ? "active" : ""}`}
          >
            {item.name}
            {activeItem === item.name && (
              <span className="nav-item-indicator" />
            )}
          </a>
        ))}
      </nav>
    </div>
  );
}
