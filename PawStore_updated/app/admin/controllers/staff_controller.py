from flask import jsonify, request
from app import db
from app.admin.models.staff_model import Staff


def get_all_staff():
    staff = Staff.query.all()
    return jsonify([s.to_dict() for s in staff])


def get_staff(staff_id):
    staff = Staff.query.get(staff_id)

    if not staff:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy nhân viên"
        }), 404

    return jsonify(staff.to_dict())


from sqlalchemy.exc import IntegrityError

def create_staff():
    data = request.json

    # check trước (nhanh, thân thiện)
    if Staff.query.get(data['id']):
        return jsonify({
            "success": False,
            "message": "ID đã tồn tại"
        }), 400

    new_staff = Staff(
        id=data['id'],
        name=data['name'],
        role=data.get('role'),
        phone=data.get('phone'),
        shift=data.get('shift'),
        work_days=data.get('work_days', 0),
        sales=data.get('sales', 0),
        color=data.get('color')
    )

    try:
        db.session.add(new_staff)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "ID đã tồn tại (trùng khóa chính)"
        }), 400

    return jsonify({
        "success": True,
        "message": "Thêm nhân viên thành công"
    })


def update_staff(staff_id):
    staff = Staff.query.get(staff_id)

    if not staff:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy nhân viên"
        }), 404

    data = request.json

    staff.name = data.get('name', staff.name)
    staff.role = data.get('role', staff.role)
    staff.phone = data.get('phone', staff.phone)
    staff.shift = data.get('shift', staff.shift)
    staff.work_days = data.get('work_days', staff.work_days)
    staff.sales = data.get('sales', staff.sales)
    staff.color = data.get('color', staff.color)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Cập nhật thành công"
    })


def delete_staff(staff_id):
    staff = Staff.query.get(staff_id)

    if not staff:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy nhân viên"
        }), 404

    db.session.delete(staff)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Xóa thành công"
    })