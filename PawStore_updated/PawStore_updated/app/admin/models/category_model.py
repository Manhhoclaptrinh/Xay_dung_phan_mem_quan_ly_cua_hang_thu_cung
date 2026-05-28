from app import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(
        db.String(10),
        primary_key=True
    )

    name = db.Column(
        db.String(120),
        nullable=False,
        unique=True
    )

    description = db.Column(db.Text)

    products = db.relationship(
        'Inventory',
        backref='category_info',
        lazy=True
    )

    def to_dict(self):

        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'products_count': len(self.products)
        }