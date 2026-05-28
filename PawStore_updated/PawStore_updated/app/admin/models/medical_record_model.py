from app import db

class MedicalRecord(db.Model):

    __tablename__ = 'medical_records'

    id = db.Column(db.Integer, primary_key=True)

    pet_id = db.Column(
        db.String(20),
        db.ForeignKey('pets.id')
    )

    visit_date = db.Column(db.String(30))

    diagnosis = db.Column(db.String(255))

    doctor = db.Column(db.String(100))

    medicine = db.Column(db.String(255))

    allergies = db.Column(db.String(255))

    condition = db.Column(db.String(100))

    vaccine = db.Column(db.String(255))

    test_result = db.Column(db.String(255))

    def to_dict(self):

        return {
            'id': self.id,
            'pet_id': self.pet_id,
            'visit_date': self.visit_date,
            'diagnosis': self.diagnosis,
            'doctor': self.doctor,
            'medicine': self.medicine,
            'allergies': self.allergies,
            'condition': self.condition,
            'vaccine': self.vaccine,
            'test_result': self.test_result,
        }