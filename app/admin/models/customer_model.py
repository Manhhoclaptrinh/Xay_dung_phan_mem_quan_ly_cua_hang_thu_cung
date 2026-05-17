from app import db
from flask_login import UserMixin  

class Customer(UserMixin, db.Model):   
    __tablename__ = 'customers'

    id          = db.Column(db.String(10), primary_key=True)
    name        = db.Column(db.String(120), nullable=False)
    phone       = db.Column(db.String(20))
    email       = db.Column(db.String(120))
    points      = db.Column(db.Integer, default=0)
    level       = db.Column(db.String(20), default='Bronze')
    total_spent = db.Column(db.BigInteger, default=0)
    join_date   = db.Column(db.String(20))
    address = db.Column(db.String(255), default='')

    def get_id(self):
        return str(self.id)

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'phone':       self.phone,
            'email':       self.email,
            'points':      self.points,
            'level':       self.level,
            'total_spent': self.total_spent,
            'join_date':   self.join_date,
        }