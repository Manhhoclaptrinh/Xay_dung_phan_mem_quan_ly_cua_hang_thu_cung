from app import db


class Staff(db.Model):
    __tablename__ = 'staff'

    id        = db.Column(db.String(10), primary_key=True)
    name      = db.Column(db.String(120), nullable=False)
    role      = db.Column(db.String(80))
    phone     = db.Column(db.String(20))
    shift     = db.Column(db.String(60))
    work_days = db.Column(db.Integer, default=0)
    sales     = db.Column(db.BigInteger, default=0)
    color     = db.Column(db.String(10))

    def to_dict(self):
        return {
            'id':        self.id,
            'name':      self.name,
            'role':      self.role,
            'phone':     self.phone,
            'shift':     self.shift,
            'work_days': self.work_days,
            'sales':     self.sales,
            'color':     self.color,
        }