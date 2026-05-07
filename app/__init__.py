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
    from app.admin.controllers.pet_controller import pet_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    app.register_blueprint(pet_bp)

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
    from app.admin.models.appointment_model import Appointment
    from app.admin.models.room_model import Room
    from app.admin.models.vendor_model import Vendor
    from app.admin.models.promotion_model import Promotion
    from app.admin.models.order_model import Order

    if Product.query.first():
        return  

    products = [
        Product(id='P01', name='Hạt Royal Canin Adult', brand='Royal Canin',
                category='Thức ăn', icon='🎁', price=320000, old_price=360000,
                rating=4.9, reviews=142, badge='hot',
                description='Thức ăn hạt cao cấp dành cho chó trưởng thành.'),
        Product(id='P02', name='Pate Whiskas Cá', brand='Whiskas',
                category='Thức ăn', icon='🐟', price=25000, rating=4.7,
                reviews=89, badge='',
                description='Pate cá ngừ bổ sung đạm tự nhiên cho mèo.'),
        Product(id='P03', name='Sữa tắm Bio-groom', brand='Bio-groom',
                category='Grooming', icon='🛁', price=180000, old_price=210000,
                rating=4.8, reviews=67, badge='sale',
                description='Sữa tắm dịu nhẹ, giữ ẩm và khử mùi lâu dài.'),
        Product(id='P04', name='Đồ chơi cào mèo', brand='PetCraft',
                category='Đồ chơi', icon='🧸', price=250000, rating=4.6,
                reviews=54, badge='new',
                description='Trụ cào lông sisal kết hợp nhà leo nhiều tầng.'),
        Product(id='P05', name='Chuồng thú cưng size M', brand='PetHome',
                category='Chuồng', icon='🏠', price=850000, rating=4.5,
                reviews=31, badge='',
                description='Chuồng sắt sơn tĩnh điện, tháo lắp dễ dàng.'),
        Product(id='P06', name='Vaccine Dại Rabisin', brand='Merial',
                category='Thuốc', icon='💉', price=150000, rating=5.0,
                reviews=28, badge='',
                description='Vaccine phòng bệnh dại cho chó mèo.'),
        Product(id='P07', name='Vòng cổ GPS định vị', brand='PetTrack',
                category='Phụ kiện', icon='📡', price=550000, old_price=690000,
                rating=4.7, reviews=43, badge='hot',
                description='Theo dõi vị trí thú cưng thời gian thực qua app.'),
        Product(id='P08', name='Thảm nệm êm ái', brand='CozzyPet',
                category='Chuồng', icon='🛏️', price=195000, rating=4.8,
                reviews=76, badge='new',
                description='Nệm lót chuồng mềm mại, chống thấm.'),
    ]

    customers = [
        Customer(id='C001', name='Nguyễn Thị Lan', phone='0912345678',
                 email='lan@email.com', points=580, level='Gold',
                 total_spent=12500000, join_date='2023-01-15'),
        Customer(id='C002', name='Trần Văn Minh', phone='0987654321',
                 email='minh@email.com', points=220, level='Silver',
                 total_spent=5200000, join_date='2023-06-10'),
        Customer(id='C003', name='Lê Thu Hằng', phone='0901234567',
                 email='hang@email.com', points=90, level='Bronze',
                 total_spent=1800000, join_date='2024-02-20'),
        Customer(id='C004', name='Phạm Đức Anh', phone='0934567890',
                 email='anh@email.com', points=1200, level='Diamond',
                 total_spent=28000000, join_date='2022-08-05'),
    ]

    pets = [
        Pet(id='PET001', name='Bông', species='Chó', breed='Poodle', age=2,
            gender='Cái', owner_id='C001', chip='CHIP-0012',
            vaccines='Dại,Parvovirus', allergies='Lông mèo',
            status='Khỏe mạnh'),
        Pet(id='PET002', name='Milo', species='Mèo', breed='Scottish Fold',
            age=3, gender='Đực', owner_id='C002', chip='CHIP-0034',
            vaccines='Dại,Calicivirus', allergies='Không',
            status='Khỏe mạnh'),
        Pet(id='PET003', name='Tuti', species='Chó', breed='Corgi', age=1,
            gender='Cái', owner_id='C003', chip='CHIP-0056',
            vaccines='Dại', allergies='Thức ăn gà',
            status='Đang điều trị'),
        Pet(id='PET004', name='Luna', species='Thỏ', breed='Holland Lop',
            age=1, gender='Cái', owner_id='C001', chip='',
            vaccines='', allergies='Không', status='Khỏe mạnh'),
        Pet(id='PET005', name='Simba', species='Mèo', breed='Maine Coon',
            age=4, gender='Đực', owner_id='C004', chip='CHIP-0078',
            vaccines='Dại,Calicivirus,Herpesvirus', allergies='Không',
            status='Khỏe mạnh'),
    ]

    inventory = [
        Inventory(id='INV001', name='Hạt Royal Canin Adult', category='Thức ăn',
                  unit='Túi 2kg', quantity=45, min_qty=10, price=320000,
                  expiry='2025-12-01', status='OK'),
        Inventory(id='INV002', name='Sữa tắm Bio-groom', category='Grooming',
                  unit='Chai 250ml', quantity=8, min_qty=10, price=180000,
                  expiry='2025-08-15', status='Sắp hết'),
        Inventory(id='INV003', name='Đồ chơi cào mèo', category='Đồ chơi',
                  unit='Cái', quantity=22, min_qty=5, price=250000,
                  expiry=None, status='OK'),
        Inventory(id='INV004', name='Vaccine Dại Rabisin', category='Thuốc',
                  unit='Lọ', quantity=3, min_qty=5, price=150000,
                  expiry='2024-11-30', status='Sắp hết hạn'),
        Inventory(id='INV005', name='Chuồng thú cưng size M', category='Chuồng',
                  unit='Cái', quantity=6, min_qty=2, price=850000,
                  expiry=None, status='OK'),
        Inventory(id='INV006', name='Pate Whiskas', category='Thức ăn',
                  unit='Hộp 85g', quantity=120, min_qty=30, price=25000,
                  expiry='2025-05-20', status='OK'),
    ]

    appointments = [
        Appointment(id='APT001', pet_id='PET001', customer_id='C001',
                    service='Spa & Tắm', staff='Trần Thị Bình',
                    date='2024-11-25', time='09:00', duration=90,
                    status='Xác nhận', price=280000),
        Appointment(id='APT002', pet_id='PET003', customer_id='C003',
                    service='Cắt tỉa lông', staff='Trần Thị Bình',
                    date='2024-11-25', time='14:00', duration=60,
                    status='Chờ', price=200000),
        Appointment(id='APT003', pet_id='PET002', customer_id='C002',
                    service='Khám bệnh', staff='Lê Văn Cường',
                    date='2024-11-26', time='10:30', duration=45,
                    status='Xác nhận', price=150000),
    ]

    rooms = [
        Room(id='R01', room_type='Phòng VIP', status='occupied'),
        Room(id='R02', room_type='Phòng Standard', status='available'),
        Room(id='R03', room_type='Phòng Standard', status='occupied'),
        Room(id='R04', room_type='Phòng Nhỏ', status='available'),
        Room(id='R05', room_type='Phòng VIP', status='cleaning'),
        Room(id='R06', room_type='Phòng Nhỏ', status='available'),
        Room(id='R07', room_type='Phòng Standard', status='available'),
        Room(id='R08', room_type='Phòng Nhỏ', status='cleaning'),
    ]

    staff_list = [
        Staff(id='S001', name='Nguyễn Văn An', role='Quản trị viên',
              phone='0911111111', shift='Hành chính', work_days=22,
              sales=45000000, color='#e8521a'),
        Staff(id='S002', name='Trần Thị Bình', role='Nhân viên Grooming',
              phone='0922222222', shift='Sáng 8–13h', work_days=20,
              sales=12000000, color='#0d9e76'),
        Staff(id='S003', name='Lê Văn Cường', role='Bác sĩ thú y',
              phone='0933333333', shift='Chiều 13–18h', work_days=21,
              sales=18000000, color='#2563eb'),
        Staff(id='S004', name='Phạm Thị Dung', role='Nhân viên bán hàng',
              phone='0944444444', shift='Hành chính', work_days=19,
              sales=9500000, color='#7c3aed'),
    ]

    vendors = [
        Vendor(id='V001', name='Royal Pet Foods', contact='Anh Tuấn',
               phone='0244556677', category='Thức ăn',
               debt=15000000, total_orders=45),
        Vendor(id='V002', name='VetPharm Hà Nội', contact='Chị Mai',
               phone='0246688990', category='Thuốc/Vaccine',
               debt=3500000, total_orders=28),
        Vendor(id='V003', name='PetCraft Accessories', contact='Anh Sơn',
               phone='0248800112', category='Phụ kiện',
               debt=0, total_orders=17),
    ]

    promotions = [
        Promotion(id='PR001', name='Mùa đông ấm áp', promo_type='Giảm giá %',
                  value=20, code='WINTER20', valid_from='2024-11-01',
                  valid_to='2024-12-31', status='Đang chạy', used=45),
        Promotion(id='PR002', name='Gói Spa & Cắt', promo_type='Combo',
                  value=15, code='SPACUT15', valid_from='2024-11-15',
                  valid_to='2024-12-15', status='Đang chạy', used=22),
        Promotion(id='PR003', name='Black Friday', promo_type='Giảm giá %',
                  value=30, code='BLACKFRI', valid_from='2024-11-29',
                  valid_to='2024-11-30', status='Sắp diễn ra', used=0),
    ]

    orders = [
        Order(id='ORD001', customer='Nguyễn Thị Lan',
              product='Hạt Royal Canin x2', total=640000,
              status='Đang giao', date='2024-11-24'),
        Order(id='ORD002', customer='Trần Văn Minh',
              product='Sữa tắm Bio-groom x1', total=180000,
              status='Hoàn thành', date='2024-11-23'),
        Order(id='ORD003', customer='Phạm Đức Anh',
              product='Chuồng size M x1 + Nệm x2', total=1240000,
              status='Chờ xác nhận', date='2024-11-25'),
    ]

    from app import db
    for obj_list in [products, customers, pets, inventory, appointments,
                     rooms, staff_list, vendors, promotions, orders]:
        for obj in obj_list:
            db.session.add(obj)
    db.session.commit()