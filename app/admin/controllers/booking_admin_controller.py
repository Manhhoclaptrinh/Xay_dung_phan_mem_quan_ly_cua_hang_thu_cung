from flask import render_template, request, jsonify
from app.user.models.booking_model import Booking
from app import db


def get_bookings_list():
    """Lấy danh sách tất cả bookings"""
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '', type=str)
    
    query = Booking.query
    
    if status:
        query = query.filter_by(status=status)
    
    # Sort by date mới nhất trước
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    return {
        'bookings': bookings,
        'total': len(bookings),
        'statuses': ['Chờ xác nhận', 'Xác nhận', 'Hoàn thành', 'Hủy']
    }


def confirm_booking(booking_id):
    """Xác nhận booking"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'ok': False, 'message': 'Booking không tồn tại!'}), 404
        
        booking.status = 'Xác nhận'
        db.session.commit()
        # ── Tạo lịch nhắc khi xác nhận (THÊM MỚI) ──
        try:
            from app.admin.controllers.reminder_service import create_reminders_for_booking
            create_reminders_for_booking(booking)
        except Exception as _re:
            print(f'[Reminder] Bỏ qua lỗi: {_re}')
        # ── end reminder ──
        
        return jsonify({
            'ok': True,
            'message': f'✅ Đã xác nhận lịch hẹn cho {booking.full_name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'message': str(e)}), 500


def reject_booking(booking_id):
    """Hủy booking"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'ok': False, 'message': 'Booking không tồn tại!'}), 404
        
        booking.status = 'Hủy'
        db.session.commit()
        # ── Huỷ reminders khi từ chối (THÊM MỚI) ──
        try:
            from app.admin.controllers.reminder_service import cancel_reminders_for_booking
            cancel_reminders_for_booking(booking.id)
        except Exception as _re:
            print(f'[Reminder] Bỏ qua lỗi: {_re}')
        # ── end reminder ──
        
        return jsonify({
            'ok': True,
            'message': f'❌ Đã hủy lịch hẹn cho {booking.full_name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'message': str(e)}), 500


def complete_booking(booking_id):
    """Đánh dấu hoàn thành"""
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'ok': False, 'message': 'Booking không tồn tại!'}), 404
        
        booking.status = 'Hoàn thành'
        db.session.commit()
        
        return jsonify({
            'ok': True,
            'message': f'✅ Đã hoàn thành lịch hẹn cho {booking.full_name}'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'ok': False, 'message': str(e)}), 500