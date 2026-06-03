# app/ai/ai_service.py
import requests
import logging
import os

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"  # miễn phí, nhanh
TIMEOUT = 20


def _call_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY chưa được cấu hình")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 600,
    }

    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=TIMEOUT)

        if resp.status_code == 401:
            raise Exception("GROQ_API_KEY không hợp lệ.")
        if resp.status_code == 429:
            raise Exception("AI đã hết quota. Vui lòng thử lại sau.")

        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    except requests.exceptions.Timeout:
        raise Exception("AI đang bận, vui lòng thử lại sau.")
    except requests.exceptions.ConnectionError:
        raise Exception("Không thể kết nối AI. Kiểm tra mạng.")
    except (KeyError, IndexError) as e:
        logger.error(f"[AI] Bad response: {e}")
        raise Exception("AI trả về kết quả không hợp lệ.")


def ask_service_advisor(species, age, weight, issue) -> dict:
    from app.ai.prompt_manager import get_service_advisor_prompt
    if not species.strip() or not issue.strip():
        return {'ok': False, 'error': 'Vui lòng nhập loài thú cưng và mô tả vấn đề.'}
    try:
        answer = _call_groq(get_service_advisor_prompt(species, age, weight, issue))
        return {'ok': True, 'answer': answer}
    except Exception as e:
        logger.error(f"[AI] advisor error: {e}")
        return {'ok': False, 'error': str(e)}


def ask_chatbot(question, history=None) -> dict:
    from app.ai.prompt_manager import get_chatbot_prompt
    if not question or not question.strip():
        return {'ok': False, 'error': 'Vui lòng nhập câu hỏi.'}
    try:
        answer = _call_groq(get_chatbot_prompt(question, history or []))
        return {'ok': True, 'answer': answer}
    except Exception as e:
        logger.error(f"[AI] chatbot error: {e}")
        return {'ok': False, 'error': str(e)}