import os
import hashlib
import google.generativeai as genai
from dotenv import load_dotenv
from .database import get_cached_response, save_cache_response

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are "Adam's AI Assistant", a specialist sitting inside Adam Amzar's Portfolio website.
Adam is a Full Stack AI Engineer. Your goal is to answer questions about Adam, his projects, and his skills based on the context provided.

Guidelines:
1. Be professional, concise, and helpful. 
2. Use the provided project data to answer specific questions.
3. If you don't know the answer or it's not in the context, say you're not sure but suggest contacting Adam via his social links.
4. Highlight Adam's strengths in AI, Full Stack development, and scalable systems.
5. Format your response in clean Markdown.
"""

def get_query_hash(query: str) -> str:
    """Generate a SHA-256 hash for the normalized user query."""
    return hashlib.sha256(query.strip().lower().encode()).hexdigest()

def get_ai_response(user_query: str, projects_context: str) -> str:
    if not GEMINI_API_KEY:
        return "AI Feature is currently offline. Please configure GEMINI_API_KEY in the backend."

    # 1. Check Cache
    query_hash = get_query_hash(user_query)
    cached = get_cached_response(query_hash)
    if cached:
        return cached

    # 2. Generate new response
    try:
        # Token capping for cost management
        generation_config = {
            "max_output_tokens": 500,
            "temperature": 0.7,
        }
        
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config=generation_config)
        
        full_prompt = f"{SYSTEM_PROMPT}\n\n### CONTEXT (Adam's Projects):\n{projects_context}\n\n### USER QUESTION:\n{user_query}"
        
        response = model.generate_content(full_prompt)
        ai_text = response.text

        # 3. Save to Cache
        save_cache_response(user_query, query_hash, ai_text)
        
        return ai_text
    except Exception as e:
        print(f"AI Service Error: {e}")
        return "Sorry, I encountered an error while processing your request. Please try again later."
