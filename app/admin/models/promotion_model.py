from app import db


class Promotion(db.Model):
    __tablename__ = 'promotions'

    id         = db.Column(db.String(10), primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    promo_type = db.Column(db.String(40))   # Giảm giá % | Combo | Tặng quà
    value      = db.Column(db.Integer, default=0)
    code       = db.Column(db.String(20), unique=True)
    valid_from = db.Column(db.String(20))
    valid_to   = db.Column(db.String(20))
    status     = db.Column(db.String(30), default='Sắp diễn ra')
    used       = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'promo_type': self.promo_type,
            'value':      self.value,
            'code':       self.code,
            'valid_from': self.valid_from,
            'valid_to':   self.valid_to,
            'status':     self.status,
            'used':       self.used,
        }