# Cost Management for AI Portfolios: Engineering for Sustainability

As an AI Engineer, showing that you can build features is 50% of the job; showing that you can **manage their costs and performance** is the other 50%. Here are four ways to limit costs while impressing recruiters.

---

## 1. The "Energy" System (Top Tier UX)
Instead of a hidden limit, gamify it. Show an "AI Power" bar in the Command Bar.
- **Recruiter Perspective:** It shows you've thought about **system constraints**. It makes the AI feel like a finite resource you are managing responsibly.

## 2. IP-Based Rate Limiting (Backend)
Standard engineering practice. Limit each visitor to ~10 queries per day.
- **Recruiter Perspective:** Demonstrates your ability to handle **production-level security and abuse prevention**.

## 3. Semantic Caching (The "Genius" Move)
Store every question/answer pair in your database. Before calling Gemini, check if a similar question has been asked before.
- **Recruiter Perspective:** This is a **massive green flag**. It shows you understand **AI Infra/DevEx** and "RAG" best practices.

## 4. Input Validation & Token Caps
Technically simple but necessary. 
- **Recruiter Perspective:** Shows attention to **input sanitization**.

---

## Our Implementation (Hybrid)
1.  **Backend:** IP-based daily limits (stored in-memory for simplicity).
2.  **Frontend:** A visible "Energy Counter" (e.g., 5/5) to inform the user.
