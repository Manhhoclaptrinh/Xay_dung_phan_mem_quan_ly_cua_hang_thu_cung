from app import db

class Pet(db.Model):
    __tablename__ = 'pets'

    id         = db.Column(db.String(10), primary_key=True)
    name       = db.Column(db.String(80), nullable=False)
    species    = db.Column(db.String(40))
    breed      = db.Column(db.String(80))
    age        = db.Column(db.Integer)
    gender     = db.Column(db.String(10))
    owner_id   = db.Column(db.String(10), db.ForeignKey('customers.id'))
    chip       = db.Column(db.String(40))
    vaccines = db.Column(db.String(200), default='')    
    allergies = db.Column(db.String(200), default='Không')    
    status     = db.Column(db.String(40), default='Khỏe mạnh')

    # Adoption listing fields
    is_for_adoption = db.Column(db.Boolean, default=False)
    adoption_status = db.Column(db.String(20), default='available')

    # Relationship
    owner = db.relationship('Customer', backref='pets', foreign_keys=[owner_id])

    def vaccine_list(self):
        return [v.strip() for v in self.vaccines.split(',') if v.strip()] if self.vaccines else []

    def to_dict(self):
     return {
        'id': self.id,
        'name': self.name,
        'species': self.species,
        'breed': self.breed,
        'age': self.age,
        'gender': self.gender,
        'owner_id': self.owner_id,
        'chip': self.chip,
        'vaccines': self.vaccine_list(),
        'allergies': self.allergies,
        'status': self.status,
        'is_for_adoption': self.is_for_adoption,
        'adoption_status': self.adoption_status
    }