from app import db
from datetime import datetime


class BookingReminder(db.Model):

    __tablename__ = 'booking_reminders'

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_id  = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    remind_type = db.Column(db.String(20), nullable=False)   # '1_day' | '1_hour'
    remind_at   = db.Column(db.DateTime, nullable=False)     # thời điểm cần nhắc
    status      = db.Column(db.String(20), default='Pending')  # Pending | Sent | Cancelled
    message     = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship('Booking', backref='reminders', foreign_keys=[booking_id])

    def to_dict(self):
        return {
            'id':          self.id,
            'booking_id':  self.booking_id,
            'remind_type': self.remind_type,
            'remind_at':   self.remind_at.strftime('%Y-%m-%d %H:%M') if self.remind_at else None,
            'status':      self.status,
            'message':     self.message,
            'created_at':  self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            # Thông tin booking kèm theo (nếu đã load)
            'full_name':   self.booking.full_name if self.booking else None,
            'phone':       self.booking.phone if self.booking else None,
            'service':     self.booking.service if self.booking else None,
            'date':        self.booking.date if self.booking else None,
            'time_slot':   self.booking.time_slot if self.booking else None,
        }