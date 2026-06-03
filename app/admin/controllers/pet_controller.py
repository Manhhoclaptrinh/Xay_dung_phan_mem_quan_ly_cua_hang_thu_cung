from flask import Blueprint, jsonify, request
from app import db
from app.user.models.pet_model import Pet
from app.admin.models.customer_model import Customer
import random

pet_bp = Blueprint('pet_api', __name__)

# GET ALL
@pet_bp.route('/api/pets', methods=['GET'])
def get_pets():

    pets = Pet.query.all()

    result = []

    for p in pets:

        owner = Customer.query.get(p.owner_id) if p.owner_id else None

        result.append({
            'id': p.id,
            'name': p.name,
            'species': p.species,
            'breed': p.breed,
            'age': p.age,
            'gender': p.gender,
            'owner_id': p.owner_id,
            'owner_name': owner.name if owner else 'N/A',
            'chip': p.chip,
            'vaccines': p.vaccines,
            'allergies': p.allergies,
            'status': p.status,
            'is_for_adoption': p.is_for_adoption,
            'adoption_status': p.adoption_status
        })

    return jsonify(result)


# CREATE
@pet_bp.route('/api/pets', methods=['POST'])
def create_pet():

    data = request.get_json()

    last_pet = Pet.query.order_by(Pet.id.desc()).first()

    try:
        num = int(last_pet.id.replace('PET', '')) + 1 if last_pet else 1
    except:
        num = 1

    new_id = f'PET{num:03d}'

    pet = Pet(
        id=new_id,
        name=data.get('name'),
        species=data.get('species'),
        breed=data.get('breed'),
        age=data.get('age'),
        gender=data.get('gender'),
        owner_id=data.get('owner_id'),
        chip=data.get('chip'),
        vaccines=','.join(data.get('vaccines', [])),
        allergies=data.get('allergies'),
        status=data.get('status'),
        is_for_adoption=data.get('is_for_adoption', False),
        adoption_status='Chờ nhận nuôi'
        if data.get('is_for_adoption')
        else 'Không'
    )

    db.session.add(pet)
    db.session.commit()

    return jsonify({
        'message': 'Đã thêm thú cưng!',
        'id': new_id
    })

# UPDATE
@pet_bp.route('/api/pets/<string:pet_id>', methods=['PUT'])
def update_pet(pet_id):

    pet = Pet.query.get_or_404(pet_id)

    data = request.get_json()

    pet.name = data.get('name', pet.name)
    pet.species = data.get('species', pet.species)
    pet.breed = data.get('breed', pet.breed)
    pet.age = data.get('age', pet.age)

    db.session.commit()

    return jsonify({
        'message': 'Cập nhật thành công!'
    })


# DELETE
@pet_bp.route('/api/pets/<string:pet_id>', methods=['DELETE'])
def delete_pet(pet_id):

    pet = Pet.query.get_or_404(pet_id)

    db.session.delete(pet)

    db.session.commit()

    return jsonify({
        'message': 'Đã xoá thú cưng!'
    })