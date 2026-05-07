from app import db


class Inventory(db.Model):
    __tablename__ = 'inventory'

    id       = db.Column(db.String(10), primary_key=True)
    name     = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(60))
    unit     = db.Column(db.String(40))
    quantity = db.Column(db.Integer, default=0)
    min_qty  = db.Column(db.Integer, default=5)
    price    = db.Column(db.Integer, default=0)
    expiry   = db.Column(db.String(20))
    status   = db.Column(db.String(30), default='OK')  # OK | Sắp hết | Sắp hết hạn

    def to_dict(self):
        return {
            'id':       self.id,
            'name':     self.name,
            'category': self.category,
            'unit':     self.unit,
            'quantity': self.quantity,
            'min_qty':  self.min_qty,
            'price':    self.price,
            'expiry':   self.expiry,
            'status':   self.status,
        }