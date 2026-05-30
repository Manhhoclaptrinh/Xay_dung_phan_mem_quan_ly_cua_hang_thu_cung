from flask import jsonify, request
from app import db
from app.admin.models.staff_model import Staff
from sqlalchemy.exc import IntegrityError
import random
import string


# ── Danh sách ca làm + khung giờ ──────────────────────────────────────────────
SHIFT_HOURS = {
    'Ca sáng (7h-12h)':    (7, 12),
    'Ca chiều (13h-18h)':  (13, 18),
    'Ca tối (18h-22h)':    (18, 22),
    'Hành chính (8h-17h)': (8, 17),
    'Cả ngày (7h-22h)':    (7, 22),
}


def _gen_id():
    """Tạo ID nhân viên dạng S### chưa tồn tại."""
    existing = {s.id for s in Staff.query.all()}
    for _ in range(200):
        new_id = 'S' + ''.join(random.choices(string.digits, k=3))
        if new_id not in existing:
            return new_id
    raise RuntimeError("Không thể tạo ID nhân viên mới")


def _color_for_name(name):
    colors = ['#e8521a', '#2a7de1', '#27ae60', '#8e44ad',
              '#f39c12', '#16a085', '#c0392b', '#2980b9']
    return colors[sum(ord(c) for c in name) % len(colors)]


# ── CRUD ────────────────────────────────────────────────────────────────────────

def get_all_staff():
    staff = Staff.query.all()
    return jsonify([s.to_dict() for s in staff])


def get_staff(staff_id):
    staff = Staff.query.get(staff_id)
    if not staff:
        return jsonify({"success": False, "message": "Không tìm thấy nhân viên"}), 404
    return jsonify(staff.to_dict())


def create_staff():
    data = request.json or {}

    # Validate bắt buộc
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({"success": False, "message": "Họ tên không được để trống"}), 400

    shift = data.get('shift', 'Hành chính (8h-17h)')

    # Kiểm tra trùng ca
    conflict = _check_shift_conflict(None, shift)
    if conflict:
        return jsonify({"success": False, "message": conflict}), 409

    try:
        staff_id = _gen_id()
    except RuntimeError as e:
        return jsonify({"success": False, "message": str(e)}), 500

    new_staff = Staff(
        id=staff_id,
        name=name,
        role=data.get('role', '').strip() or 'Nhân viên',
        phone=data.get('phone', '').strip(),
        email=data.get('email', '').strip(),
        shift=shift,
        work_days=data.get('work_days', 0),
        sales=data.get('sales', 0),
        color=data.get('color') or _color_for_name(name),
    )

    try:
        db.session.add(new_staff)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"success": False, "message": "Lỗi khi thêm nhân viên"}), 400

    return jsonify({"success": True, "message": "Thêm nhân viên thành công", "id": staff_id})


def update_staff(staff_id):
    staff = Staff.query.get(staff_id)
    if not staff:
        return jsonify({"success": False, "message": "Không tìm thấy nhân viên"}), 404

    data = request.json or {}

    new_shift = data.get('shift', staff.shift)

    # Kiểm tra trùng ca (bỏ qua bản thân)
    conflict = _check_shift_conflict(staff_id, new_shift)
    if conflict:
        return jsonify({"success": False, "message": conflict}), 409

    staff.name  = (data.get('name') or staff.name).strip()
    staff.role  = (data.get('role') or staff.role).strip()
    staff.phone = data.get('phone', staff.phone)
    staff.email = data.get('email', staff.email)
    staff.shift = new_shift
    staff.work_days = data.get('work_days', staff.work_days)
    staff.sales     = data.get('sales', staff.sales)
    staff.color     = data.get('color', staff.color)

    db.session.commit()
    return jsonify({"success": True, "message": "Cập nhật thành công"})


def delete_staff(staff_id):
    staff = Staff.query.get(staff_id)
    if not staff:
        return jsonify({"success": False, "message": "Không tìm thấy nhân viên"}), 404

    db.session.delete(staff)
    db.session.commit()
    return jsonify({"success": True, "message": "Xóa thành công"})


# ── Sắp xếp lịch ───────────────────────────────────────────────────────────────

def _check_shift_conflict(exclude_id, new_shift):
    """
    Trả về thông báo lỗi nếu ca bị trùng giờ với nhân viên khác,
    ngược lại trả về None (không có conflict).
    """
    if new_shift not in SHIFT_HOURS:
        return None  # Ca không chuẩn → bỏ qua kiểm tra

    new_start, new_end = SHIFT_HOURS[new_shift]

    others = Staff.query.all()
    for s in others:
        if exclude_id and s.id == exclude_id:
            continue
        if s.shift not in SHIFT_HOURS:
            continue
        s_start, s_end = SHIFT_HOURS[s.shift]
        # Kiểm tra overlap: hai khoảng [a,b] và [c,d] trùng khi a<d và c<b
        if new_start < s_end and s_start < new_end:
            return (
                f"Ca '{new_shift}' trùng giờ với nhân viên {s.name} "
                f"({s.shift}). Vui lòng chọn ca khác."
            )
    return None


def get_available_shifts():
    """
    Trả về danh sách ca kèm trạng thái còn trống / đã có người.
    Frontend dùng để gợi ý ca cho nhân viên mới.
    """
    occupied = {}
    for s in Staff.query.all():
        if s.shift in SHIFT_HOURS:
            occupied[s.shift] = s.name

    result = []
    for shift_name, (start, end) in SHIFT_HOURS.items():
        result.append({
            'shift':    shift_name,
            'start':    start,
            'end':      end,
            'occupied': shift_name in occupied,
            'by':       occupied.get(shift_name),
        })
    return jsonify(result)