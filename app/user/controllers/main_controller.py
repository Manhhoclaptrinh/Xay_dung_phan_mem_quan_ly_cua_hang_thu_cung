from flask import Blueprint, render_template, request, jsonify
from app.user.models.product_model import Product
from app.user.models.pet_model import Pet
from app.user.models.booking_model import Booking
from app.admin.models.customer_model import Customer
from app.user.models.transport_model import TransportBooking
from datetime import datetime
from app import db
import uuid

user_bp = Blueprint('user', __name__)


# HOME / STOREFRONT
@user_bp.route('/')
def index():
    products = Product.query.all()
    pets_for_adoption = Pet.query.filter_by(is_for_adoption=True).all()
    return render_template(
        'user/index.html',
        products=products,
        pets=pets_for_adoption,
    )


# PRODUCTS API
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


# BOOKING 
@user_bp.route('/api/booking', methods=['POST'])
def api_booking():
    """Submit a service booking."""
    data = request.get_json(force=True)

    full_name = data.get('full_name', '').strip()
    phone     = data.get('phone', '').strip()

    if not full_name or not phone:
        return jsonify({'ok': False, 'message': 'Vui lòng nhập tên và số điện thoại!'}), 400

    booking = Booking(
        full_name = full_name,
        phone     = phone,
        pet_name  = data.get('pet_name', ''),
        breed     = data.get('breed', ''),
        service   = data.get('service', ''),
        date      = data.get('date', ''),
        time_slot = data.get('time_slot', ''),
        notes     = data.get('notes', ''),
    )
    db.session.add(booking)
    db.session.commit()

# ── Tạo lịch nhắc (THÊM MỚI) ──
    try:
        from app.admin.controllers.reminder_service import create_reminders_for_booking
        create_reminders_for_booking(booking)
    except Exception as _re:
        print(f"[Reminder] Bỏ qua lỗi: {_re}")
    # ── end reminder ──

    return jsonify({
        'ok': True,
        'message': f'Đặt lịch thành công cho {full_name}! Chúng tôi sẽ gọi {phone} để xác nhận. 📅',
    })


# ADOPTION INQUIRY 
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

# PET TRANSPORT API
@user_bp.route('/api/transport-booking', methods=['POST'])
def api_transport_booking():

    data = request.get_json(force=True)

    owner_name = data.get('owner_name', '').strip()
    phone = data.get('phone', '').strip()

    pet_name = data.get('pet_name', '').strip()

    pickup_address = data.get('pickup_address', '').strip()
    dropoff_address = data.get('dropoff_address', '').strip()

    transport_date = data.get('transport_date')
    transport_time = data.get('transport_time')

    vehicle_type = data.get('vehicle_type', 'Pet Bike')

    payment_method = data.get('payment_method', 'COD')

    health_notes = data.get('health_notes', '')

    insurance_enabled = data.get('insurance_enabled', False)

    recurring = data.get('recurring', False)

    total_price = data.get('total_price', 0)

    # validate

    if (
        not owner_name or
        not phone or
        not pet_name or
        not pickup_address or
        not dropoff_address
    ):

        return jsonify({
            'ok': False,
            'message': 'Vui lòng nhập đầy đủ thông tin!'
        }), 400

    booking_code = 'PTR-' + uuid.uuid4().hex[:8].upper()

    booking = TransportBooking(

        booking_code=booking_code,

        owner_name=owner_name,
        phone=phone,

        pet_name=pet_name,

        pickup_address=pickup_address,
        dropoff_address=dropoff_address,

        transport_date=transport_date,
        transport_time=transport_time,

        vehicle_type=vehicle_type,
        payment_method=payment_method,

        health_notes=health_notes,

        insurance_enabled=insurance_enabled,
        recurring=recurring,

        total_price=total_price,

        status='pending',

        driver_name='Nguyễn Văn Huy',
        driver_phone='0909123123',

        vehicle_plate='51A-12345',

        tracking_status='driver_assigned',

        estimated_minutes=12
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({

        'ok': True,

        'message': 'Đặt xe thành công! 🚚',

        'booking': booking.to_dict()

    })

@user_bp.route('/api/transport-tracking/<booking_code>')
def api_transport_tracking(booking_code):

    booking = TransportBooking.query.filter_by(
        booking_code=booking_code
    ).first()

    if not booking:

        return jsonify({
            'ok': False,
            'message': 'Không tìm thấy chuyến xe!'
        }), 404

    return jsonify({

        'ok': True,

        'tracking': {

            'booking_code': booking.booking_code,

            'status': booking.status,

            'tracking_status': booking.tracking_status,

            'driver_name': booking.driver_name,

            'driver_phone': booking.driver_phone,

            'vehicle_plate': booking.vehicle_plate,

            'estimated_minutes': booking.estimated_minutes,

            'vehicle_type': booking.vehicle_type,

            'pickup_address': booking.pickup_address,

            'dropoff_address': booking.dropoff_address,

            'pet_name': booking.pet_name,

            'camera_stream_url': booking.camera_stream_url,

            'current_lat': booking.current_lat,

            'current_lng': booking.current_lng

        }

    })

