# app/ai/routes.py
"""
Blueprint ai_bp — prefix /api/ai
Không conflict với user_bp, admin_bp, map_bp hiện có.
"""
from flask import Blueprint, request, jsonify

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/api/ai/service-advisor', methods=['POST'])
def api_service_advisor():
    """
    Tư vấn dịch vụ cho thú cưng.
    Body JSON: {species, age, weight, issue}
    """
    data    = request.get_json(force=True) or {}
    species = data.get('species', '').strip()
    age     = data.get('age', '').strip()
    weight  = data.get('weight', '').strip()
    issue   = data.get('issue', '').strip()

    if not species or not issue:
        return jsonify({'ok': False, 'error': 'Thiếu thông tin loài và vấn đề.'}), 400

    from app.ai.ai_service import ask_service_advisor
    result = ask_service_advisor(species, age, weight, issue)

    status = 200 if result['ok'] else 503
    return jsonify(result), status


@ai_bp.route('/api/ai/chatbot', methods=['POST'])
def api_chatbot():
    """
    Chatbot chăm sóc thú cưng.
    Body JSON: {question, history: [{role, content}]}
    """
    data     = request.get_json(force=True) or {}
    question = data.get('question', '').strip()
    history  = data.get('history', [])

    if not question:
        return jsonify({'ok': False, 'error': 'Vui lòng nhập câu hỏi.'}), 400

    from app.ai.ai_service import ask_chatbot
    result = ask_chatbot(question, history)

    status = 200 if result['ok'] else 503
    return jsonify(result), status