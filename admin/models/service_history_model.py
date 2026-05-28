from app import db

class ServiceHistory(db.Model):

    __tablename__ = 'service_history'

    id = db.Column(db.Integer, primary_key=True)

    pet_id = db.Column(
        db.String(20),
        db.ForeignKey('pets.id')
    )

    service_name = db.Column(db.String(100))

    service_date = db.Column(db.String(50))

    status = db.Column(db.String(50))

    price = db.Column(db.Integer)

    note = db.Column(db.String(255))

    def to_dict(self):

        return {

            'id': self.id,

            'pet_id': self.pet_id,

            'service_name': self.service_name,

            'service_date': self.service_date,

            'status': self.status,

            'price': self.price,

            'note': self.note,
        }