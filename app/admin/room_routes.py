from flask import Blueprint, jsonify, request
from app import db

from app.user.models.room_model import Room
from app.user.models.boarding_model import Boarding
from app.user.models.pet_model import Pet
from app.admin.models.customer_model import Customer

room_bp = Blueprint(
    'room_api',
    __name__
)


# ==========================
# GET ALL ROOMS
# ==========================
@room_bp.route('/api/rooms', methods=['GET'])
def get_rooms():

    rooms = Room.query.all()

    result = []

    for room in rooms:

        active_boarding = Boarding.query.filter_by(
            room_id=room.id,
            status='active'
        ).first()

        pet_name = None
        owner_name = None

        if active_boarding:

            pet = Pet.query.get(
                active_boarding.pet_id
            )

            if pet:

                pet_name = pet.name

                owner = Customer.query.get(
                    pet.owner_id
                )

                if owner:
                    owner_name = owner.name

        result.append({
            'id': room.id,
            'room_type': room.room_type,
            'status': room.status,

            'pet_name': pet_name,
            'owner_name': owner_name,

            'boarding_id':
                active_boarding.id
                if active_boarding
                else None
        })

    return jsonify(result)


# ==========================
# GET ONE ROOM
# ==========================
@room_bp.route('/api/rooms/<string:room_id>', methods=['GET'])
def get_room(room_id):

    room = Room.query.get_or_404(room_id)

    return jsonify({
        'id': room.id,
        'room_type': room.room_type,
        'status': room.status
    })


# ==========================
# UPDATE ROOM STATUS
# ==========================
@room_bp.route('/api/rooms/<string:room_id>', methods=['PATCH'])
def update_room(room_id):

    room = Room.query.get_or_404(room_id)

    data = request.get_json()

    room.status = data.get(
        'status',
        room.status
    )

    db.session.commit()

    return jsonify({
        'message': 'Cập nhật phòng thành công'
    })


# ==========================
# CREATE ROOM
# ==========================
@room_bp.route('/api/rooms', methods=['POST'])
def create_room():

    data = request.get_json()

    room = Room(
        id=data.get('id'),
        room_type=data.get('room_type'),
        status='available'
    )

    db.session.add(room)
    db.session.commit()

    return jsonify({
        'message': 'Đã thêm phòng'
    })


# ==========================
# DELETE ROOM
# ==========================
@room_bp.route('/api/rooms/<string:room_id>', methods=['DELETE'])
def delete_room(room_id):

    room = Room.query.get_or_404(room_id)

    db.session.delete(room)

    db.session.commit()

    return jsonify({
        'message': 'Đã xoá phòng'
    })