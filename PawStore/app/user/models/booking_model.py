from app import db
from datetime import datetime


class Booking(db.Model):
    __tablename__ = 'bookings'

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name   = db.Column(db.String(120), nullable=False)
    phone       = db.Column(db.String(20), nullable=False)
    pet_name    = db.Column(db.String(80))
    breed       = db.Column(db.String(80))
    service     = db.Column(db.String(80))
    date        = db.Column(db.String(20))
    time_slot   = db.Column(db.String(10))
    notes       = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    status      = db.Column(db.String(20), default='Chờ xác nhận')

    def to_dict(self):
        return {
            'id':        self.id,
            'full_name': self.full_name,
            'phone':     self.phone,
            'pet_name':  self.pet_name,
            'breed':     self.breed,
            'service':   self.service,
            'date':      self.date,
            'time_slot': self.time_slot,
            'notes':     self.notes,
            'status':    self.status,
        }