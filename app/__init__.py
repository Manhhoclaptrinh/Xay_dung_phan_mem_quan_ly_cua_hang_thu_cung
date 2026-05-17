from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()


def create_app():
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='../static'
    )

    app.config['SECRET_KEY'] = 'pawstore-secret-key-2024'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pawstore.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'user.login'
    
    from app.admin.models.customer_model import Customer 

    @login_manager.user_loader
    def load_user(user_id):
        return Customer.query.get(user_id)

    from app.user.controllers.main_controller import user_bp
    from app.admin.controllers.dashboard_controller import admin_bp
    from app.router.map_routes import map_bp
    
    app.register_blueprint(map_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    with app.app_context():
        db.create_all()
        _seed_data()

    return app


def _seed_data():
    """Seed initial data if tables are empty."""

    from app.user.models.product_model import Product
    from app.user.models.pet_model import Pet

    from app.admin.models.customer_model import Customer
    from app.admin.models.staff_model import Staff

    from app.admin.models.inventory_model import Inventory
    from app.admin.models.category_model import Category

    from app.admin.models.appointment_model import Appointment
    from app.admin.models.room_model import Room

    from app.admin.models.vendor_model import Vendor
    from app.admin.models.promotion_model import Promotion
    from app.admin.models.order_model import Order

    from app.user.models.transport_model import TransportBooking

    if Product.query.first():
        return

    categories = [

        Category(
            id='CAT001',
            name='Thức ăn chó',
            description='Đồ ăn cho chó'
        ),

        Category(
            id='CAT002',
            name='Thức ăn mèo',
            description='Đồ ăn cho mèo'
        ),

        Category(
            id='CAT003',
            name='Đồ chơi',
            description='Đồ chơi thú cưng'
        ),

        Category(
            id='CAT004',
            name='Thuốc thú y',
            description='Thuốc và vaccine'
        ),

        Category(
            id='CAT005',
            name='Phụ kiện',
            description='Phụ kiện thú cưng'
        ),
    ]

    products = [

        Product(
            id='P01',
            name='Hạt Royal Canin Adult',
            brand='Royal Canin',
            category='Thức ăn',
            icon='🎁',
            price=320000,
            old_price=360000,
            rating=4.9,
            reviews=142,
            badge='hot',
            description='Thức ăn hạt cao cấp dành cho chó trưởng thành.'
        ),

        Product(
            id='P02',
            name='Pate Whiskas Cá',
            brand='Whiskas',
            category='Thức ăn',
            icon='🐟',
            price=25000,
            rating=4.7,
            reviews=89,
            badge='',
            description='Pate cá ngừ bổ sung đạm tự nhiên cho mèo.'
        ),
    ]

    customers = [

        Customer(
            id='C001',
            name='Nguyễn Thị Lan',
            phone='0912345678',
            email='lan@email.com',
            points=580,
            level='Gold',
            total_spent=12500000,
            join_date='2023-01-15'
        ),

        Customer(
            id='C002',
            name='Trần Văn Minh',
            phone='0987654321',
            email='minh@email.com',
            points=220,
            level='Silver',
            total_spent=5200000,
            join_date='2023-06-10'
        ),
    ]

    pets = [

        Pet(
            id='PET001',
            name='Bông',
            species='Chó',
            breed='Poodle',
            age=2,
            gender='Cái',
            owner_id='C001',
            chip='CHIP-0012',
            vaccines='Dại,Parvovirus',
            allergies='Lông mèo',
            status='Khỏe mạnh'
        ),

        Pet(
            id='PET002',
            name='Milo',
            species='Mèo',
            breed='Scottish Fold',
            age=3,
            gender='Đực',
            owner_id='C002',
            chip='CHIP-0034',
            vaccines='Dại,Calicivirus',
            allergies='Không',
            status='Khỏe mạnh'
        ),
    ]

    inventory = [

        Inventory(

            id='INV001',

            name='Hạt Royal Canin Adult',

            category_id='CAT001',

            brand='Royal Canin',

            import_price=250000,

            sell_price=320000,

            quantity=45,

            min_qty=10,

            unit='Túi 2kg',

            expiry='2025-12-01',

            supplier='Royal Pet Foods',

            image='/static/img/products/royal.jpg',

            barcode='893850143222',

            description='Thức ăn hạt cao cấp',

            status='OK'
        ),

        Inventory(

            id='INV002',

            name='Pate Whiskas Cá',

            category_id='CAT002',

            brand='Whiskas',

            import_price=18000,

            sell_price=25000,

            quantity=120,

            min_qty=30,

            unit='Hộp 85g',

            expiry='2025-05-20',

            supplier='Whiskas VN',

            image='/static/img/products/whiskas.jpg',

            barcode='893850155555',

            description='Pate cho mèo',

            status='OK'
        ),

        Inventory(

            id='INV003',

            name='Đồ chơi cào mèo',

            category_id='CAT003',

            brand='PetCraft',

            import_price=180000,

            sell_price=250000,

            quantity=22,

            min_qty=5,

            unit='Cái',

            supplier='PetCraft',

            image='/static/img/products/cat-toy.jpg',

            barcode='893850166666',

            description='Đồ chơi cho mèo',

            status='OK'
        ),

        Inventory(

            id='INV004',

            name='Vaccine Dại Rabisin',

            category_id='CAT004',

            brand='Merial',

            import_price=120000,

            sell_price=150000,

            quantity=3,

            min_qty=5,

            unit='Lọ',

            expiry='2024-11-30',

            supplier='VetPharm',

            image='/static/img/products/vaccine.jpg',

            barcode='893850177777',

            description='Vaccine phòng dại',

            status='Sắp hết'
        ),
    ]

    appointments = [

        Appointment(
            id='APT001',
            pet_id='PET001',
            customer_id='C001',
            service='Spa & Tắm',
            staff='Trần Thị Bình',
            date='2024-11-25',
            time='09:00',
            duration=90,
            status='Xác nhận',
            price=280000
        ),
    ]

    rooms = [

        Room(
            id='R01',
            room_type='Phòng VIP',
            status='occupied'
        ),

        Room(
            id='R02',
            room_type='Phòng Standard',
            status='available'
        ),
    ]

    staff_list = [

        Staff(
            id='S001',
            name='Nguyễn Văn An',
            role='Quản trị viên',
            phone='0911111111',
            shift='Hành chính',
            work_days=22,
            sales=45000000,
            color='#e8521a'
        ),
    ]

    vendors = [

        Vendor(

            id='V001',

            name='Royal Pet Foods',

            phone='0244556677',

            email='royal@pet.com',

            address='Hà Nội',

            company='Royal Pet Foods',

            total_import=15000000
        ),

        Vendor(

            id='V002',

            name='VetPharm Hà Nội',

            phone='0246688990',

            email='vetpharm@email.com',

            address='Hà Nội',

            company='VetPharm',

            total_import=3500000
        ),
    ]

    promotions = [

        Promotion(
            id='PR001',
            name='Mùa đông ấm áp',
            promo_type='Giảm giá %',
            value=20,
            code='WINTER20',
            valid_from='2024-11-01',
            valid_to='2024-12-31',
            status='Đang chạy',
            used=45
        ),
    ]

    orders = [

        Order(
            id='ORD001',
            customer='Nguyễn Thị Lan',
            product='Hạt Royal Canin x2',
            total=640000,
            status='Đang giao',
            date='2024-11-24'
        ),
    ]

    transport_bookings = [

        TransportBooking(

            booking_code='PTR-0001',

            owner_name='Nguyễn Văn Nam',

            phone='0912345678',

            pet_name='Bông',

            pickup_address='Cầu Giấy, Hà Nội',

            dropoff_address='Hai Bà Trưng, Hà Nội',

            transport_date='2026-05-17',

            transport_time='09:00',

            vehicle_type='Pet Car',

            payment_method='MoMo',

            health_notes='Bé hơi nhát người lạ',

            insurance_enabled=True,

            recurring=False,

            total_price=120000,

            status='Đang di chuyển',

            tracking_status='moving',

            estimated_minutes=12,

            driver_name='Nguyễn Văn Huy',

            driver_phone='0909123123',

            vehicle_plate='30A-12345',

            camera_stream_url='https://www.youtube.com/embed/jfKfPfyJRdk'
        )
    ]

    all_data = [

        categories,

        products,

        customers,

        pets,

        inventory,

        appointments,

        rooms,

        staff_list,

        vendors,

        promotions,

        orders,

        transport_bookings
    ]

    for obj_list in all_data:

        for obj in obj_list:

            db.session.add(obj)

    db.session.commit()