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
from app.admin.models.medical_record_model import MedicalRecord
from app.admin.models.reminder_model import Reminder
from app.admin.models.service_history_model import ServiceHistory
from app.admin.models.category_model import Category
from app.admin.models.import_receipt_model import ImportReceipt
from app.admin.models.import_receipt_detail_model import ImportReceiptDetail
from app.admin.models.export_receipt_model import ExportReceipt
from app.admin.models.export_receipt_detail_model import ExportReceiptDetail
from app.admin.models.inventory_history_model import InventoryHistory
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
        d['pets'] = [p.name for p in c.pets]
        result.append(d)
    return jsonify(result)


@admin_bp.route('/api/customers', methods=['POST'])
def api_add_customer():
    data = request.get_json(force=True)
    import uuid
    customer = Customer(
        id='C' + str(uuid.uuid4())[:6].upper(),
        name=data.get('name', ''),
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        address=data.get('address', ''),
        level='Bronze',
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Đã thêm khách hàng!'})


# INVENTORY / PRODUCT MANAGEMENT

# GET ALL + SEARCH + FILTER
@admin_bp.route('/api/inventory')
def api_inventory():

    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    brand = request.args.get('brand', '').strip()
    stock = request.args.get('stock', '').strip()

    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)

    query = Inventory.query

    # SEARCH
    if search:

        query = query.filter(

            (Inventory.name.ilike(f'%{search}%')) |

            (Inventory.id.ilike(f'%{search}%')) |

            (Inventory.barcode.ilike(f'%{search}%'))

        )

    # FILTER CATEGORY
    if category:

        query = query.filter(
            Inventory.category_id == category
        )

    # FILTER BRAND
    if brand:

        query = query.filter(
            Inventory.brand == brand
        )

    # FILTER STOCK
    if stock == 'low':

        query = query.filter(
            Inventory.quantity < Inventory.min_qty
        )

    elif stock == 'out':

        query = query.filter(
            Inventory.quantity <= 0
        )

    elif stock == 'available':

        query = query.filter(
            Inventory.quantity > 0
        )

    # FILTER PRICE
    if min_price is not None:

        query = query.filter(
            Inventory.sell_price >= min_price
        )

    if max_price is not None:

        query = query.filter(
            Inventory.sell_price <= max_price
        )

    items = query.all()

    return jsonify([
        i.to_dict()
        for i in items
    ])


# GET DETAIL
@admin_bp.route('/api/inventory/<string:item_id>')
def api_inventory_detail(item_id):

    item = Inventory.query.get_or_404(item_id)

    return jsonify(item.to_dict())


# CREATE PRODUCT
@admin_bp.route('/api/inventory', methods=['POST'])
def api_add_inventory():

    data = request.get_json(force=True)

    import uuid

    item = Inventory(

        id='SP' + str(uuid.uuid4())[:5].upper(),

        name=data.get('name', ''),

        category_id=data.get('category_id', ''),

        brand=data.get('brand', ''),

        import_price=int(
            data.get('import_price', 0)
        ),

        sell_price=int(
            data.get('sell_price', 0)
        ),

        quantity=int(
            data.get('quantity', 0)
        ),

        min_qty=int(
            data.get('min_qty', 5)
        ),

        expiry=data.get('expiry', ''),

        supplier=data.get('supplier', ''),

        barcode=data.get('barcode', ''),

        description=data.get(
            'description',
            ''
        ),
    )

    item.update_status()

    db.session.add(item)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã thêm sản phẩm!'
    })


# UPDATE PRODUCT
@admin_bp.route(
    '/api/inventory/<string:item_id>',
    methods=['PUT']
)
def api_update_inventory(item_id):

    item = Inventory.query.get_or_404(item_id)

    data = request.get_json(force=True)

    item.name = data.get(
        'name',
        item.name
    )

    item.category_id = data.get(
        'category_id', 
        item.category_id
    )

    item.brand = data.get(
        'brand',
        item.brand
    )

    item.import_price = int(
        data.get(
            'import_price',
            item.import_price
        )
    )

    item.sell_price = int(
        data.get(
            'sell_price',
            item.sell_price
        )
    )

    item.quantity = int(
        data.get(
            'quantity',
            item.quantity
        )
    )

    item.min_qty = int(
        data.get(
            'min_qty',
            item.min_qty
        )
    )

    item.expiry = data.get(
        'expiry',
        item.expiry
    )

    item.supplier = data.get(
        'supplier',
        item.supplier
    )

    item.barcode = data.get(
        'barcode',
        item.barcode
    )

    item.description = data.get(
        'description',
        item.description
    )

    item.update_status()

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã cập nhật sản phẩm!'
    })


# DELETE PRODUCT
@admin_bp.route(
    '/api/inventory/<string:item_id>',
    methods=['DELETE']
)
def api_delete_inventory(item_id):

    item = Inventory.query.get_or_404(item_id)

    db.session.delete(item)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã xóa sản phẩm!'
    })


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


# BOOKINGS
@admin_bp.route('/bookings')
def bookings_page():

    from app.user.models.booking_model import Booking

    bookings = Booking.query.order_by(
        Booking.id.desc()
    ).all()

    total = len(bookings)

    pending = len([
        b for b in bookings
        if b.status == 'Chờ xác nhận'
    ])

    confirmed = len([
        b for b in bookings
        if b.status == 'Đã xác nhận'
    ])

    completed = len([
        b for b in bookings
        if b.status == 'Hoàn thành'
    ])

    cancelled = len([
        b for b in bookings
        if b.status == 'Đã hủy'
    ])

    return render_template(
        'admin/bookings.html',
        bookings=bookings,
        total=total,
        pending=pending,
        confirmed=confirmed,
        completed=completed,
        cancelled=cancelled
    )

@admin_bp.route('/bookings')
def bookings():
    """Xem danh sách bookings"""
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    return render_template('admin/bookings.html', 
                          bookings=bookings,
                          total=len(bookings))


@admin_bp.route('/api/bookings')
def api_get_bookings():
    """API lấy danh sách bookings (JSON)"""
    status = request.args.get('status', '', type=str)
    
    query = Booking.query
    if status:
        query = query.filter_by(status=status)
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings])


@admin_bp.route('/api/booking/<int:booking_id>/confirm', methods=['POST'])
def api_confirm_booking(booking_id):
    """API xác nhận booking"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'ok': False, 'message': 'Booking không tồn tại!'}), 404
        
        booking.status = 'Xác nhận'
        db.session.commit()
        
        return jsonify({
            'ok': True,
            'message': f'✅ Đã xác nhận lịch hẹn cho {booking.full_name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'message': str(e)}), 500


@admin_bp.route('/api/booking/<int:booking_id>/reject', methods=['POST'])
def api_reject_booking(booking_id):
    """API hủy booking"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'ok': False, 'message': 'Booking không tồn tại!'}), 404
        
        booking.status = 'Hủy'
        db.session.commit()
        
        return jsonify({
            'ok': True,
            'message': f'❌ Đã hủy lịch hẹn cho {booking.full_name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'message': str(e)}), 500


@admin_bp.route('/api/booking/<int:booking_id>/complete', methods=['POST'])
def api_complete_booking(booking_id):
    """API đánh dấu hoàn thành"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'ok': False, 'message': 'Booking không tồn tại!'}), 404
        
        booking.status = 'Hoàn thành'
        db.session.commit()
        
        return jsonify({
            'ok': True,
            'message': f'✅ Đã hoàn thành lịch hẹn cho {booking.full_name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'message': str(e)}), 500
    
# MEDICAL RECORDS

@admin_bp.route('/api/medical-records/<pet_id>')
def api_medical_records(pet_id):

    records = MedicalRecord.query.filter_by(
        pet_id=pet_id
    ).all()

    return jsonify([r.to_dict() for r in records])


@admin_bp.route(
    '/api/medical-records',
    methods=['POST']
)
def api_add_medical_record():

    data = request.get_json(force=True)

    record = MedicalRecord(

        pet_id=data.get('pet_id'),

        visit_date=data.get('visit_date'),

        diagnosis=data.get('diagnosis'),

        doctor=data.get('doctor'),

        medicine=data.get('medicine'),

        allergies=data.get('allergies'),

        vaccine=data.get('vaccine'),

        condition=data.get('condition'),

        test_result=data.get('test_result'),
    )

    db.session.add(record)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã lưu hồ sơ y tế!'
    })

@admin_bp.route('/api/reminders')
def api_reminders():

    reminders = Reminder.query.all()

    return jsonify([
        r.to_dict()
        for r in reminders
    ])


@admin_bp.route(
    '/api/reminders',
    methods=['POST']
)
def api_add_reminder():

    data = request.get_json(force=True)

    reminder = Reminder(

        pet_id=data.get('pet_id'),

        reminder_type=data.get('reminder_type'),

        reminder_date=data.get('reminder_date'),

        note=data.get('note'),
    )

    db.session.add(reminder)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã tạo nhắc lịch!'
    })  

@admin_bp.route('/api/service-history/<pet_id>')
def api_service_history(pet_id):

    services = ServiceHistory.query.filter_by(
        pet_id=pet_id
    ).all()

    return jsonify([
        s.to_dict()
        for s in services
    ])


@admin_bp.route(
    '/api/service-history',
    methods=['POST']
)
def api_add_service_history():

    data = request.get_json(force=True)

    service = ServiceHistory(

        pet_id=data.get('pet_id'),

        service_name=data.get('service_name'),

        service_date=data.get('service_date'),

        status=data.get('status'),

        price=int(data.get('price', 0)),

        note=data.get('note'),
    )

    db.session.add(service)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã lưu dịch vụ!'
    })

# GET ALL
@admin_bp.route('/api/categories')
def api_categories():

    categories = Category.query.all()

    return jsonify([
        c.to_dict()
        for c in categories
    ])

# CREATE
@admin_bp.route(
    '/api/categories',
    methods=['POST']
)
def api_add_category():

    data = request.get_json(force=True)

    import uuid

    category = Category(

        id='CAT' + str(uuid.uuid4())[:5].upper(),

        name=data.get('name', ''),

        description=data.get(
            'description',
            ''
        )
    )

    db.session.add(category)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã thêm danh mục!'
    })

# UPDATE
@admin_bp.route(
    '/api/categories/<string:category_id>',
    methods=['PUT']
)
def api_update_category(category_id):

    category = Category.query.get_or_404(
        category_id
    )

    data = request.get_json(force=True)

    category.name = data.get(
        'name',
        category.name
    )

    category.description = data.get(
        'description',
        category.description
    )

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã cập nhật danh mục!'
    })

# DELETE
@admin_bp.route(
    '/api/categories/<string:category_id>',
    methods=['DELETE']
)
def api_delete_category(category_id):

    category = Category.query.get_or_404(
        category_id
    )

    db.session.delete(category)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã xóa danh mục!'
    })

@admin_bp.route(
    '/api/import-receipts',
    methods=['GET']
)
def api_import_receipts():

    receipts = ImportReceipt.query.order_by(
        ImportReceipt.import_date.desc()
    ).all()

    return jsonify([
        r.to_dict()
        for r in receipts
    ])


@admin_bp.route(
    '/api/import-receipts',
    methods=['POST']
)
def api_add_import_receipt():

    data = request.get_json(force=True)

    import uuid

    receipt = ImportReceipt(

        id='IMP' + str(uuid.uuid4())[:6].upper(),

        supplier_id=data.get(
            'supplier_id'
        ),

        import_date=data.get(
            'import_date'
        ),

        created_by=data.get(
            'created_by'
        ),

        note=data.get('note', ''),

        total_amount=0
    )

    db.session.add(receipt)

    total = 0

    for item in data.get('details', []):

        product = Inventory.query.get(
            item.get('product_id')
        )

        if not product:
            continue

        qty = int(item.get('quantity', 0))

        price = int(
            item.get('import_price', 0)
        )

        subtotal = qty * price

        detail = ImportReceiptDetail(

            receipt_id=receipt.id,

            product_id=product.id,

            quantity=qty,

            import_price=price,

            subtotal=subtotal
        )

        db.session.add(detail)

        # AUTO UPDATE STOCK
        product.quantity += qty
        history = InventoryHistory(

            product_id=product.id,

            action='Nhập kho',

            quantity_change=qty,

            created_at=data.get(
                'import_date'
            ),

            created_by=data.get(
                'created_by'
            ),

            note='Nhập hàng'
        )

        db.session.add(history)

        product.import_price = price

        product.update_status()

        total += subtotal

    receipt.total_amount = total

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã nhập kho!'
    })

@admin_bp.route(
    '/api/export-receipts',
    methods=['POST']
)
def api_export_receipt():

    data = request.get_json(force=True)

    import uuid

    receipt = ExportReceipt(

        id='EXP' + str(uuid.uuid4())[:6].upper(),

        export_type=data.get(
            'export_type'
        ),

        export_date=data.get(
            'export_date'
        ),

        created_by=data.get(
            'created_by'
        ),

        note=data.get('note', '')
    )

    db.session.add(receipt)

    for item in data.get('details', []):

        product = Inventory.query.get(
            item.get('product_id')
        )

        if not product:
            continue

        qty = int(item.get('quantity', 0))

        # TRỪ KHO
        product.quantity -= qty
        history = InventoryHistory(

            product_id=product.id,

            action=data.get(
                'export_type',
                'Xuất kho'
            ),

            quantity_change=-qty,

            created_at=data.get(
                'export_date'
            ),

            created_by=data.get(
                'created_by'
            ),

            note=data.get('note', '')
        )

        db.session.add(history)

        if product.quantity < 0:
            product.quantity = 0

        product.update_status()

        detail = ExportReceiptDetail(

            receipt_id=receipt.id,

            product_id=product.id,

            quantity=qty
        )

        db.session.add(detail)

    db.session.commit()

    return jsonify({
        'ok': True,
        'message': 'Đã xuất kho!'
    })

@admin_bp.route('/api/inventory-alerts')
def api_inventory_alerts():

    low_stock = Inventory.query.filter(
        Inventory.quantity < Inventory.min_qty
    ).count()

    out_stock = Inventory.query.filter(
        Inventory.quantity <= 0
    ).count()

    over_stock = Inventory.query.filter(
        Inventory.quantity > 200
    ).count()

    items = Inventory.query.all()

    expiring = 0

    from datetime import datetime

    for item in items:

        if not item.expiry:
            continue

        try:

            expiry_date = datetime.strptime(
                item.expiry,
                '%Y-%m-%d'
            )

            days = (
                expiry_date - datetime.now()
            ).days

            if days < 30:
                expiring += 1

        except:
            pass

    return jsonify({

        'low_stock': low_stock,

        'out_stock': out_stock,

        'over_stock': over_stock,

        'expiring': expiring,
    })

@admin_bp.route('/api/inventory-history')
def api_inventory_history():

    history = InventoryHistory.query.order_by(
        InventoryHistory.id.desc()
    ).all()

    return jsonify([
        h.to_dict()
        for h in history
    ])