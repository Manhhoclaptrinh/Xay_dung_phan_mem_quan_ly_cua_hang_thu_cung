from app import db

class Reminder(db.Model):

    __tablename__ = 'reminders'

    id = db.Column(db.Integer, primary_key=True)

    pet_id = db.Column(
        db.String(20),
        db.ForeignKey('pets.id')
    )

    reminder_type = db.Column(db.String(100))

    reminder_date = db.Column(db.String(50))

    status = db.Column(db.String(50), default='Sắp tới')

    note = db.Column(db.String(255))

    def to_dict(self):

        return {

            'id': self.id,

            'pet_id': self.pet_id,

            'reminder_type': self.reminder_type,

            'reminder_date': self.reminder_date,

            'status': self.status,

            'note': self.note,
        }