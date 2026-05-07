from flask import Blueprint, render_template, request, jsonify
from app.user.models.product_model import Product
from app.user.models.pet_model import Pet
from app.admin.models.customer_model import Customer
from app import db

user_bp = Blueprint('user', __name__)


# ── HOME / STOREFRONT ────────────────────────────────────────────────────────
@user_bp.route('/')
def index():
    products = Product.query.all()
    pets_for_adoption = Pet.query.filter_by(is_for_adoption=True).all()
    return render_template(
        'user/index.html',
        products=products,
        pets=pets_for_adoption,
    )


# ── PRODUCTS API ─────────────────────────────────────────────────────────────
@user_bp.route('/api/products')
def api_products():
    """Return all products (optionally filtered by category or search query)."""
    category = request.args.get('category', '')
    q = request.args.get('q', '').lower().strip()

    query = Product.query
    if category:
        query = query.filter_by(category=category)
    if q:
        query = query.filter(
            (Product.name.ilike(f'%{q}%')) |
            (Product.brand.ilike(f'%{q}%')) |
            (Product.category.ilike(f'%{q}%'))
        )

    products = query.all()
    return jsonify([p.to_dict() for p in products])


# ── ADOPTION INQUIRY ─────────────────────────────────────────────────────────
@user_bp.route('/api/adoption/<pet_id>', methods=['POST'])
def api_adoption(pet_id):
    """Register interest in adopting a pet."""
    pet = Pet.query.get_or_404(pet_id)
    if pet.adoption_status != 'available':
        return jsonify({'ok': False, 'message': 'Bé này đã có chủ rồi!'}), 400

    return jsonify({
        'ok': True,
        'message': f'Đã gửi yêu cầu nhận nuôi {pet.name}! Chúng tôi sẽ liên hệ bạn sớm 🐾',
    })