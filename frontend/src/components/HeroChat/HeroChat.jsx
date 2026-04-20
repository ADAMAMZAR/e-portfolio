import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [messageCount, setMessageCount] = useState(0);
  const endOfMessagesRef = useRef(null);
  
  const name = profile?.name || "Adam Amzar";
  const firstName = name.split(" ")[0];
  const MAX_CHARS = 300;
  const MAX_MESSAGES = 5;

  const suggestions = [
    "What is your tech stack?",
    "Can you build an AI app?",
    "How do you optimize backends?",
    "Let's chat about a project"
  ];

  const handleSend = (text) => {
    if (!text.trim() || isTyping || messageCount >= MAX_MESSAGES) return;
    setMessageCount(prev => prev + 1);

    setMessages(prev => [...prev, { role: "user", text }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "I'm an AI assistant for Adam. He's currently focused on building high-performance backends and intelligent AI applications. I can assure you he has the skills to bring your ideas to reality! Reach out via the Contact section to discuss your project in detail.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("tech stack")) {
        aiResponse = "Adam's core stack includes Python, Node.js, React, and modern databases. He specializes in integrating LLM APIs and building scalable cloud-native architectures.";
      } else if (lowerText.includes("ai app")) {
        aiResponse = "Absolutely! From prompt engineering and RAG systems to agent orchestration, Adam builds robust AI pipelines ready for production.";
      } else if (lowerText.includes("backend")) {
        aiResponse = "Performance is key. He ensures efficient database design, utilizes fast frameworks like FastAPI, and leverages caching to handle massive scale.";
      }

      setMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend(inputValue);
    }
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
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
                  disabled={messageCount >= MAX_MESSAGES}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-content-area">
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
                    {msg.text}
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
            <div ref={endOfMessagesRef} />
          </div>
        )}

        <div className="chat-input-wrapper">
          <input 
            type="text" 
            className="chat-input" 
            placeholder={messageCount >= MAX_MESSAGES ? "Chat limit reached." : `Ask anything about ${firstName}...`}
            value={inputValue}
            maxLength={MAX_CHARS}
            disabled={messageCount >= MAX_MESSAGES}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="chat-limits-info" style={{ 
            position: 'absolute', 
            right: inputValue.trim() ? "65px" : "38px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            display: "flex", 
            gap: "1rem", 
            fontSize: "0.75rem", 
            color: "var(--muted)", 
            pointerEvents: "none",
            transition: "all 0.3s ease"
          }}>
            <span>{inputValue.length}/{MAX_CHARS}</span>
            <span>{messageCount}/{MAX_MESSAGES}</span>
          </div>

          {inputValue.trim() && messageCount < MAX_MESSAGES && (
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
