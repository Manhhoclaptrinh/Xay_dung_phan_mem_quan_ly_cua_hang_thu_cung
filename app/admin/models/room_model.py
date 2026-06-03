from app import db


class Room(db.Model):
    __tablename__ = 'rooms'

    id        = db.Column(db.String(5), primary_key=True)
    room_type = db.Column(db.String(40))
    status    = db.Column(db.String(20), default='available')  # occupied | available | cleaning

    notes        = db.Column(db.Text, nullable=True)
    pet_id       = db.Column(db.String(10), db.ForeignKey('pets.id'), nullable=True) 
    checkin_date = db.Column(db.String(20), nullable=True)

    def to_dict(self):
        return {
            'id': self.id, 
            'room_type': self.room_type, 
            'status': self.status,
            'notes': self.notes,
            'pet_id': self.pet_id,
            'checkin_date': self.checkin_date
        }