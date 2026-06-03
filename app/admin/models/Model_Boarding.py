from app import db

class Boarding(db.Model):
    __tablename__ = "boardings"

    id = db.Column(db.String(10), primary_key=True)

    room_id = db.Column(
        db.String(5),
        db.ForeignKey('rooms.id')
    )

    pet_id = db.Column(
        db.String(10),
        db.ForeignKey('pets.id')
    )

    checkin_date = db.Column(db.DateTime)
    checkout_date = db.Column(db.DateTime)

    price_per_day = db.Column(db.Float)

    status = db.Column(
        db.String(20),
        default='active'
    )