from app import db


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id          = db.Column(db.String(10), primary_key=True)
    pet_id      = db.Column(db.String(10), db.ForeignKey('pets.id'))
    customer_id = db.Column(db.String(10), db.ForeignKey('customers.id'))
    service     = db.Column(db.String(80))
    staff       = db.Column(db.String(80))
    date        = db.Column(db.String(20))
    time        = db.Column(db.String(10))
    duration    = db.Column(db.Integer)   # minutes
    status      = db.Column(db.String(20), default='Chờ')  # Chờ | Xác nhận | Hoàn thành | Hủy
    price       = db.Column(db.Integer, default=0)

    pet      = db.relationship('Pet',      backref='appointments', foreign_keys=[pet_id])
    customer = db.relationship('Customer', backref='appointments', foreign_keys=[customer_id])

    def to_dict(self):
        return {
            'id':          self.id,
            'pet_id':      self.pet_id,
            'customer_id': self.customer_id,
            'service':     self.service,
            'staff':       self.staff,
            'date':        self.date,
            'time':        self.time,
            'duration':    self.duration,
            'status':      self.status,
            'price':       self.price,
            'pet_name':    self.pet.name if self.pet else '',
            'owner_name':  self.customer.name if self.customer else '',
        }