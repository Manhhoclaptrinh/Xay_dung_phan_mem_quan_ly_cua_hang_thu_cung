from app import db


class Room(db.Model):
    __tablename__ = 'rooms'

    id        = db.Column(db.String(5), primary_key=True)
    room_type = db.Column(db.String(40))
    status    = db.Column(db.String(20), default='available')  # occupied | available | cleaning

    def to_dict(self):
        return {'id': self.id, 'room_type': self.room_type, 'status': self.status}