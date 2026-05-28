from app import db
from datetime import datetime


class TransportBooking(db.Model):

    __tablename__ = 'transport_bookings'

    id = db.Column(db.Integer, primary_key=True)

    booking_code = db.Column(
        db.String(30),
        unique=True,
        nullable=False
    )

    # owner

    owner_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))

    # pet

    pet_name = db.Column(db.String(120))

    health_notes = db.Column(db.Text)

    # address

    pickup_address = db.Column(db.Text)
    dropoff_address = db.Column(db.Text)

    # transport

    transport_date = db.Column(db.String(30))
    transport_time = db.Column(db.String(30))

    vehicle_type = db.Column(db.String(50))

    # payment

    payment_method = db.Column(db.String(50))

    total_price = db.Column(db.Float, default=0)

    # features

    insurance_enabled = db.Column(
        db.Boolean,
        default=False
    )

    recurring = db.Column(
        db.Boolean,
        default=False
    )

    # tracking

    status = db.Column(
        db.String(50),
        default='pending'
    )

    tracking_status = db.Column(
        db.String(50),
        default='waiting_driver'
    )

    estimated_minutes = db.Column(
        db.Integer,
        default=15
    )

    # driver

    driver_name = db.Column(db.String(120))
    driver_phone = db.Column(db.String(20))

    vehicle_plate = db.Column(db.String(50))

    # realtime map

    current_lat = db.Column(
        db.Float,
        default=21.0285
    )

    current_lng = db.Column(
        db.Float,
        default=105.8542
    )

    # livestream

    camera_stream_url = db.Column(db.Text)

    # created

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):

        return {

            'id': self.id,

            'booking_code': self.booking_code,

            'owner_name': self.owner_name,

            'phone': self.phone,

            'pet_name': self.pet_name,

            'pickup_address': self.pickup_address,

            'dropoff_address': self.dropoff_address,

            'transport_date': self.transport_date,

            'transport_time': self.transport_time,

            'vehicle_type': self.vehicle_type,

            'payment_method': self.payment_method,

            'total_price': self.total_price,

            'status': self.status,

            'tracking_status': self.tracking_status,

            'driver_name': self.driver_name,

            'driver_phone': self.driver_phone,

            'vehicle_plate': self.vehicle_plate,

            'estimated_minutes': self.estimated_minutes,

            'camera_stream_url': self.camera_stream_url,

            'created_at': self.created_at.isoformat()

        }