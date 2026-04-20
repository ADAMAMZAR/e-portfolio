import "./Footer.css";

export function Footer({ profile }) {
  const year = new Date().getFullYear();
  const name = profile?.name || "Adam Amzar";

  return (
    <footer className="portfolio-footer">
      <div className="footer-inner">
        <p className="footer-copy">
          © {year} <span className="footer-name">{name}</span>
          <span className="footer-dot">·</span>
          Built with FastAPI &amp; React
          <span className="footer-dot">·</span>
          Powered by AI ✦
        </p>

        <div className="footer-links">
          {profile?.socials?.linkedin?.enabled && profile?.socials?.linkedin?.url && (
            <a
              href={profile.socials.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-btn"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
          {profile?.socials?.whatsapp?.enabled && profile?.socials?.whatsapp?.url && (
            <a
              href={profile.socials.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-btn"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.407 3.481 2.242 2.242 3.48 5.23 3.481 8.411-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.301 1.664zm6.29-4.103c1.733.917 3.676 1.4 5.653 1.401 5.452 0 9.891-4.438 9.893-9.891 0-2.646-1.03-5.128-2.902-6.999-1.871-1.872-4.354-2.901-7.001-2.902-5.454 0-9.894 4.438-9.896 9.892-.001 2.016.521 3.98 1.515 5.703l-.999 3.646 3.733-.951zm11.332-6.859c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.199.299-.775.979-.95 1.178-.175.199-.35.224-.65.075-.3-.15-1.265-.467-2.41-1.488-.891-.795-1.492-1.777-1.667-2.076-.175-.299-.019-.462.13-.611.134-.133.301-.35.451-.524.15-.174.201-.299.301-.498.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.594-.511-.513-.7-.523-.179-.01-.383-.012-.588-.012-.204 0-.535.077-.815.38-.28.303-1.069 1.045-1.069 2.548 0 1.503 1.092 2.955 1.242 3.155.15.2 2.149 3.282 5.205 4.602.727.314 1.294.502 1.735.642.73.232 1.393.199 1.918.121.585-.087 1.78-.728 2.03-1.43.25-.701.25-1.302.175-1.43-.075-.125-.275-.199-.575-.349z"/>
              </svg>
            </a>
          )}
          {profile?.socials?.gmail?.enabled && profile?.socials?.gmail?.url && (
            <a
              href={`mailto:${profile.socials.gmail.url}`}
              className="footer-icon-btn"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
