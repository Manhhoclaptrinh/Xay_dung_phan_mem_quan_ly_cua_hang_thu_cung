from app import db


class Product(db.Model):
    __tablename__ = 'products'

    id          = db.Column(db.String(10), primary_key=True)
    name        = db.Column(db.String(120), nullable=False)
    brand       = db.Column(db.String(80))
    category    = db.Column(db.String(60))
    icon        = db.Column(db.String(10))
    description = db.Column(db.Text)
    price       = db.Column(db.Integer, nullable=False)
    old_price   = db.Column(db.Integer)
    rating      = db.Column(db.Float, default=0)
    reviews     = db.Column(db.Integer, default=0)
    badge       = db.Column(db.String(20), default='')  # hot | new | sale | ''

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'brand':       self.brand,
            'category':    self.category,
            'icon':        self.icon,
            'description': self.description,
            'price':       self.price,
            'old_price':   self.old_price,
            'rating':      self.rating,
            'reviews':     self.reviews,
            'badge':       self.badge,
        }