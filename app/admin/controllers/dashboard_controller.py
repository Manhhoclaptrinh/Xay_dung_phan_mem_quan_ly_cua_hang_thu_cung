from flask import Blueprint, render_template, request, jsonify
from app.admin.models.customer_model import Customer
from app.admin.models.inventory_model import Inventory
from app.admin.models.appointment_model import Appointment
from app.admin.models.room_model import Room
from app.admin.models.staff_model import Staff
from app.admin.models.vendor_model import Vendor
from app.admin.models.promotion_model import Promotion
from app.admin.models.order_model import Order
from app.user.models.product_model import Product
from app.user.models.pet_model import Pet
from app.user.models.booking_model import Booking
from app import db

admin_bp = Blueprint('admin', __name__)

MONTHLY_REVENUE = [18.5, 21, 19.8, 25.6, 28, 31, 29.5, 34, 38, 41.5, 45, 48]


# MAIN ADMIN PAGE
@admin_bp.route('/')
@admin_bp.route('/dashboard')
def dashboard():
    return render_template('admin/index.html')


# DASHBOARD DATA
@admin_bp.route('/api/dashboard')
def api_dashboard():
    today_apts = Appointment.query.filter_by(date='2024-11-25').all()
    inventory_alerts = Inventory.query.filter(Inventory.status != 'OK').count()
    rooms = Room.query.all()
    top_customers = Customer.query.order_by(Customer.total_spent.desc()).limit(4).all()
    rooms_data = [r.to_dict() for r in rooms]

    return jsonify({
        'monthly_revenue':    MONTHLY_REVENUE,
        'pets_count':         Pet.query.count(),
        'today_appointments': [a.to_dict() for a in today_apts],
        'inventory_alerts':   inventory_alerts,
        'rooms':              rooms_data,
        'top_customers':      [c.to_dict() for c in top_customers],
        'rooms_occupied':     sum(1 for r in rooms_data if r['status'] == 'occupied'),
        'rooms_available':    sum(1 for r in rooms_data if r['status'] == 'available'),
        'rooms_cleaning':     sum(1 for r in rooms_data if r['status'] == 'cleaning'),
    })

#Thêm
# PETS 

# GET ALL + SEARCH
@admin_bp.route('/api/pets')
def api_pets():

    search = request.args.get('search', '').strip()

    query = Pet.query

    # SEARCH
    if search:
        query = query.filter(
            (Pet.name.ilike(f'%{search}%')) |
            (Pet.species.ilike(f'%{search}%')) |
            (Pet.breed.ilike(f'%{search}%')) |
            (Pet.id.ilike(f'%{search}%'))
        )

    pets = query.all()

    result = []

    for p in pets:

        d = p.to_dict()

        if p.owner:
            d['owner_name'] = p.owner.name
            d['owner_phone'] = p.owner.phone

        result.append(d)

    return jsonify(result)


# GET DETAIL
@admin_bp.route('/api/pets/<string:pet_id>')
def api_pet_detail(pet_id):

    pet = Pet.query.get_or_404(pet_id)

    data = pet.to_dict()

    if pet.owner:
        data['owner_name'] = pet.owner.name
        data['owner_phone'] = pet.owner.phone
        data['owner_email'] = pet.owner.email

    return jsonify(data)


# CREATE
@admin_bp.route('/api/pets', methods=['POST'])
def api_add_pet():

    data = request.get_json(force=True)

    import uuid

    pet = Pet(
        id='PET' + str(uuid.uuid4())[:5].upper(),
        name=data.get('name', ''),
        species=data.get('species', ''),
        breed=data.get('breed', ''),
        age=int(data.get('age', 0)),
        gender=data.get('gender', ''),
        owner_id=data.get('owner_id'),
        chip=data.get('chip', ''),
        vaccines=','.join(data.get('vaccines', [])),
        allergies=data.get('allergies', 'Không'),
        status=data.get('status', 'Khỏe mạnh'),
        is_for_adoption=data.get('is_for_adoption', False),
        adoption_status='Chờ nhận nuôi'
        if data.get('is_for_adoption')
        else 'Không'
    )

    db.session.add(pet)
    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã thêm hồ sơ thú cưng!'
    })


# UPDATE
@admin_bp.route('/api/pets/<string:pet_id>', methods=['PUT'])
def api_update_pet(pet_id):

    pet = Pet.query.get_or_404(pet_id)

    data = request.get_json(force=True)

    pet.name = data.get('name', pet.name)
    pet.species = data.get('species', pet.species)
    pet.breed = data.get('breed', pet.breed)

    if 'age' in data:
        pet.age = int(data.get('age', pet.age))

    pet.gender = data.get('gender', pet.gender)
    pet.owner_id = data.get('owner_id', pet.owner_id)
    pet.chip = data.get('chip', pet.chip)

    if 'vaccines' in data:
        pet.vaccines = ','.join(data.get('vaccines', []))

    pet.allergies = data.get('allergies', pet.allergies)
    pet.status = data.get('status', pet.status)

    pet.is_for_adoption = data.get(
        'is_for_adoption',
        pet.is_for_adoption
    )

    if pet.is_for_adoption:
        pet.adoption_status = 'Chờ nhận nuôi'
    else:
        pet.adoption_status = 'Không'

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã cập nhật thú cưng!'
    })


# DELETE
@admin_bp.route('/api/pets/<string:pet_id>', methods=['DELETE'])
def api_delete_pet(pet_id):

    pet = Pet.query.get_or_404(pet_id)

    db.session.delete(pet)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã xóa thú cưng!'
    })

# CUSTOMERS 
@admin_bp.route('/api/customers')
def api_customers():
    customers = Customer.query.all()
    result = []
    for c in customers:
        d = c.to_dict()
        d['pets_count'] = len(c.pets)
        result.append(d)
    return jsonify(result)


@admin_bp.route('/api/customers', methods=['POST'])
def api_add_customer():
    data = request.get_json(force=True)
    import uuid
    customer = Customer(
        id    = 'C' + str(uuid.uuid4())[:6].upper(),
        name  = data.get('name', ''),
        phone = data.get('phone', ''),
        email = data.get('email', ''),
        level = 'Bronze',
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã thêm khách hàng!'})


# INVENTORY
@admin_bp.route('/api/inventory')
def api_inventory():
    items = Inventory.query.all()
    return jsonify([i.to_dict() for i in items])


@admin_bp.route('/api/inventory/<item_id>', methods=['PATCH'])
def api_update_inventory(item_id):
    item = Inventory.query.get_or_404(item_id)
    data = request.get_json(force=True)
    if 'quantity' in data:
        item.quantity = int(data['quantity'])
        item.status = 'OK' if item.quantity >= item.min_qty else 'Sắp hết'
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã cập nhật kho hàng!'})


# APPOINTMENTS
@admin_bp.route('/api/appointments')
def api_appointments():
    apts = Appointment.query.all()
    return jsonify([a.to_dict() for a in apts])


@admin_bp.route('/api/appointments/<apt_id>/confirm', methods=['PATCH'])
def api_confirm_appointment(apt_id):
    apt = Appointment.query.get_or_404(apt_id)
    apt.status = 'Xác nhận'
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã xác nhận lịch hẹn!'})


@admin_bp.route('/api/appointments/<apt_id>', methods=['DELETE'])
def api_cancel_appointment(apt_id):
    apt = Appointment.query.get_or_404(apt_id)
    db.session.delete(apt)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã hủy lịch hẹn!'})


@admin_bp.route('/api/appointments', methods=['POST'])
def api_add_appointment():
    data = request.get_json(force=True)
    import uuid
    apt = Appointment(
        id          = 'APT' + str(uuid.uuid4())[:5].upper(),
        pet_id      = data.get('pet_id'),
        customer_id = data.get('customer_id'),
        service     = data.get('service', ''),
        staff       = data.get('staff', ''),
        date        = data.get('date', ''),
        time        = data.get('time', ''),
        duration    = int(data.get('duration', 60)),
        price       = int(data.get('price', 0)),
        status      = 'Chờ',
    )
    db.session.add(apt)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã đặt lịch thành công!'})


# ROOMS / BOARDING
@admin_bp.route('/api/rooms')
def api_rooms():
    rooms = Room.query.all()
    return jsonify([r.to_dict() for r in rooms])


# STAFF
@admin_bp.route('/api/staff')
def api_staff():
    staff = Staff.query.all()
    return jsonify([s.to_dict() for s in staff])


# VENDORS
@admin_bp.route('/api/vendors')
def api_vendors():
    vendors = Vendor.query.all()
    return jsonify([v.to_dict() for v in vendors])


# PROMOTIONS
@admin_bp.route('/api/promotions')
def api_promotions():
    promos = Promotion.query.all()
    return jsonify([p.to_dict() for p in promos])


@admin_bp.route('/api/promotions', methods=['POST'])
def api_add_promotion():
    data = request.get_json(force=True)
    import uuid
    promo = Promotion(
        id         = 'PR' + str(uuid.uuid4())[:4].upper(),
        name       = data.get('name', ''),
        promo_type = data.get('promo_type', 'Giảm giá %'),
        value      = int(data.get('value', 0)),
        code       = data.get('code', '').upper(),
        valid_from = data.get('valid_from', ''),
        valid_to   = data.get('valid_to', ''),
        status     = 'Sắp diễn ra',
        used       = 0,
    )
    db.session.add(promo)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã tạo khuyến mãi!'})


@admin_bp.route('/api/promotions/<promo_id>', methods=['DELETE'])
def api_delete_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    db.session.delete(promo)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã xóa khuyến mãi!'})


# ORDERS
@admin_bp.route('/api/orders')
def api_orders():
    orders = Order.query.order_by(Order.date.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@admin_bp.route('/api/orders/<order_id>/confirm', methods=['PATCH'])
def api_confirm_order(order_id):
    order = Order.query.get_or_404(order_id)
    order.status = 'Đang giao'
    db.session.commit()
    return jsonify({'ok': True, 'message': f'Đã xác nhận đơn {order_id}!'})


# BOOKINGS (admin view)
@admin_bp.route('/api/bookings')
def api_bookings():
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings])