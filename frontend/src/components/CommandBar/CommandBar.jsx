import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./CommandBar.css";

const FIRST_VISIT_KEY = "portfolio_ai_fab_seen";

/**
 * CommandBar component provides an AI-powered search and assistant overlay.
 * Triggered by Ctrl+K or the floating action button.
 */
export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [energy, setEnergy] = useState({ remaining: 5, total: 5 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const inputRef = useRef(null);
  /** @type {React.MutableRefObject<ReturnType<typeof setTimeout> | null>} */
  const tooltipTimer = useRef(null);

  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // First-visit: pulse + tooltip
  useEffect(() => {
    const hasSeen = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasSeen) {
      // Delay until after hero animation finishes (~0.9s of stagger + buffer)
      const delay = setTimeout(() => {
        setIsPulsing(true);
        setShowTooltip(true);
        localStorage.setItem(FIRST_VISIT_KEY, "1");
        // Auto-dismiss tooltip after 6 s
        tooltipTimer.current = setTimeout(() => setShowTooltip(false), 6000);
        // Remove pulse class after animation completes (1.1s keyframe)
        setTimeout(() => setIsPulsing(false), 1200);
      }, 1200);
      return () => clearTimeout(delay);
    }
  }, []);

  // Dismiss tooltip immediately when FAB is clicked
  const handleFabClick = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setShowTooltip(false);
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) inputRef.current.focus();
      fetchLimit();
    }
  }, [isOpen]);

  const fetchLimit = async () => {
    try {
      const res = await fetch("/api/ai/limit");
      if (res.ok) {
        const data = await res.json();
        setEnergy({ remaining: data.remaining, total: data.limit });
      }
    } catch (err) {
      console.error("Failed to fetch AI limit:", err);
    }
  };

  /** @param {React.FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || energy.remaining <= 0) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (res.status === 429) {
        setResponse("Daily limit reached. Please come back tomorrow!");
        setEnergy((prev) => ({ ...prev, remaining: 0 }));
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch AI response");

      const data = await res.json();
      setResponse(data.response);
      setEnergy((prev) => ({ ...prev, remaining: data.remaining }));
    } catch (err) {
      setResponse("Error: Could not reach the AI service. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="ai-fab-wrapper">
          {showTooltip && (
            <div className="ai-fab-tooltip" role="tooltip">
              Ask me anything about Adam's work!
              <span className="ai-fab-tooltip-kbd">Ctrl + K</span>
              <button
                className="ai-fab-tooltip-close"
                onClick={() => setShowTooltip(false)}
                aria-label="Dismiss tooltip"
              >✕</button>
            </div>
          )}
          <button
            className={`ai-fab${isPulsing ? " ai-fab--pulse" : ""}`}
            onClick={handleFabClick}
            aria-label="Open AI Assistant"
          >
            <span className="ai-fab-sparkle">✨</span>
            <span className="ai-fab-text">Ask AI</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="command-bar-overlay" onClick={() => setIsOpen(false)}>
          <div className="command-bar-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="command-bar-form">
              <div className="command-bar-input-wrapper">
                <span className="command-bar-icon">🪄</span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={energy.remaining > 0 ? "Ask anything about Adam's projects..." : "Daily limit reached. Browse manually!"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={energy.remaining <= 0}
                  maxLength={300}
                  className="command-bar-input"
                />
                <div className="char-counter">{query.length}/300</div>
                <div className="command-bar-energy" title="Remaining AI Energy">
                  <div className="energy-dots">
                    {[...Array(energy.total)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`energy-dot ${i < energy.remaining ? 'active' : 'empty'}`} 
                      />
                    ))}
                  </div>
                  <span>{energy.remaining}/{energy.total}</span>
                </div>
                <div className="command-bar-kbd">ESC</div>
              </div>
            </form>

            {(loading || response) && (
              <div className="command-bar-results">
                {loading ? (
                  <div className="command-bar-loading">
                    <span className="sparkle">✨</span> Gathering intelligence...
                  </div>
                ) : (
                  <div className="command-bar-response">
                    <p className="ai-label">AI ASSISTANT</p>
                    <div className="ai-text">
                      <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="command-bar-footer">
              <span>Search Adam's Portfolio</span>
              <div className="footer-keys">
                <span>Enter to ask</span>
                <span>ESC to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
