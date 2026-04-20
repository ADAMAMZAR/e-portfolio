import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import "./HeroChat.css";

const boxVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export function HeroChat({ profile }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [energy, setEnergy] = useState({ remaining: 5, total: 5 });
  const chatContentRef = useRef(null);
  
  const name = profile?.name || "Adam Amzar";
  const firstName = name.split(" ")[0];
  const MAX_CHARS = 300;

  const suggestions = [
    "What is your tech stack?",
    "Can you build an AI app?",
    "How do you optimize backends?",
    "Let's chat about a project"
  ];

  const handleSend = async (text) => {
    if (!text.trim() || isTyping || energy.remaining <= 0) return;
    setEnergy(prev => ({ ...prev, remaining: prev.remaining - 1 }));

    setMessages(prev => [...prev, { role: "user", text }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (res.status === 429) {
        setMessages(prev => [...prev, { role: "ai", text: "Daily limit reached. Please come back tomorrow!" }]);
        setEnergy(prev => ({ ...prev, remaining: 0 }));
        return;
      }
      
      if (!res.ok) throw new Error("Failed to fetch AI response");

      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.response }]);
      if (data.remaining !== undefined) {
        setEnergy(prev => ({ ...prev, remaining: data.remaining }));
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: Could not reach the AI service." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend(inputValue);
    }
  };

  useEffect(() => {
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
    fetchLimit();
  }, []);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="hero-chat-section">
      <motion.h1 
        className="hero-chat-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Hi, I'm <span className="text-gradient">{name}</span>
      </motion.h1>

      <motion.div 
        className="hero-chat-box"
        variants={boxVariants}
        initial="hidden"
        animate="visible"
        style={{ marginTop: "2rem" }}
      >
        {messages.length === 0 ? (
          <div className="hero-empty-state">
            <p className="hero-empty-text">Ask me anything about {firstName}...</p>
            <div className="chat-pills">
              {suggestions.map((pill) => (
                <button 
                  key={pill} 
                  className="chat-pill"
                  onClick={() => handleSend(pill)}
                  disabled={energy.remaining <= 0}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-content-area" ref={chatContentRef}>
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  className={`chat-row ${msg.role === "user" ? "user-row" : "ai-row"}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                    {msg.role === "user" ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  className="chat-row ai-row"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="chat-bubble ai-bubble typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="chat-input-wrapper">
          <input 
            type="text" 
            className="chat-input" 
            placeholder={energy.remaining <= 0 ? "Daily limit reached." : `Ask anything about ${firstName}...`}
            value={inputValue}
            maxLength={MAX_CHARS}
            disabled={energy.remaining <= 0}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="chat-limits-info" style={{ 
            position: 'absolute', 
            right: inputValue.trim() ? "65px" : "38px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            display: "flex", 
            alignItems: "center",
            gap: "1rem", 
            fontSize: "0.75rem", 
            color: "var(--muted)", 
            pointerEvents: "auto",
            transition: "all 0.3s ease",
            fontWeight: 500,
            letterSpacing: "0.05em"
          }}>
            <div title="Remaining daily AI queries" style={{ cursor: "help", display: "flex", alignItems: "center", gap: "0.6rem", paddingRight: "0.8rem", borderRight: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[...Array(energy.total)].map((_, i) => (
                  <div 
                    key={i} 
                    style={{
                      width: "6px", 
                      height: "6px", 
                      borderRadius: "50%", 
                      transition: "all 0.3s ease",
                      background: i < energy.remaining ? "var(--primary)" : "rgba(255, 255, 255, 0.1)",
                      boxShadow: i < energy.remaining ? "0 0 5px var(--primary)" : "none"
                    }}
                  />
                ))}
              </div>
              <span>{energy.remaining}/{energy.total}</span>
            </div>
            <span title="Maximum character length per message" style={{ cursor: "help" }}>{inputValue.length}/{MAX_CHARS}</span>
          </div>

          {inputValue.trim() && energy.remaining > 0 && (
            <button 
              className="chat-send-btn outline-none"
              onClick={() => handleSend(inputValue)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
