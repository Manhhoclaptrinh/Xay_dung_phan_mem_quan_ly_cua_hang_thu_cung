from app import db


class Order(db.Model):
    __tablename__ = 'orders'

    id       = db.Column(db.String(10), primary_key=True)
    customer = db.Column(db.String(120))
    product  = db.Column(db.String(200))
    total    = db.Column(db.Integer, default=0)
    status   = db.Column(db.String(30), default='Chờ xác nhận')
    date     = db.Column(db.String(20))

    def to_dict(self):
        return {
            'id':       self.id,
            'customer': self.customer,
            'product':  self.product,
            'total':    self.total,
            'status':   self.status,
            'date':     self.date,
        }