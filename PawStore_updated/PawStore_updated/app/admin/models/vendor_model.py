from app import db


class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(
        db.String(10),
        primary_key=True
    )

    name = db.Column(
        db.String(120)
    )

    phone = db.Column(
        db.String(30)
    )

    email = db.Column(
        db.String(120)
    )

    address = db.Column(db.Text)

    company = db.Column(
        db.String(120)
    )

    total_import = db.Column(
        db.Integer,
        default=0
    )

    def to_dict(self):

        return {

            'id': self.id,

            'name': self.name,

            'phone': self.phone,

            'email': self.email,

            'address': self.address,

            'company': self.company,

            'total_import': self.total_import,
        }