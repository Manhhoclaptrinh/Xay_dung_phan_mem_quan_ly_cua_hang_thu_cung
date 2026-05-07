from app import db


class Vendor(db.Model):
    __tablename__ = 'vendors'

    id           = db.Column(db.String(10), primary_key=True)
    name         = db.Column(db.String(120), nullable=False)
    contact      = db.Column(db.String(80))
    phone        = db.Column(db.String(20))
    category     = db.Column(db.String(60))
    debt         = db.Column(db.BigInteger, default=0)
    total_orders = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id':           self.id,
            'name':         self.name,
            'contact':      self.contact,
            'phone':        self.phone,
            'category':     self.category,
            'debt':         self.debt,
            'total_orders': self.total_orders,
        }