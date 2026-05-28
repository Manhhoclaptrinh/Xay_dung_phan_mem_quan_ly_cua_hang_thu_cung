from flask import request, jsonify
from datetime import datetime
from app.user.models.booking_model import Booking
from app import db


def submit_booking():
    """
    Xử lý đặt lịch hẹn từ form.
    Validate dữ liệu, check ngày giờ không quá khứ, lưu vào DB.
    """
    try:
        # Lấy dữ liệu từ request
        data = request.get_json(force=True)
        
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()
        pet_name = data.get('pet_name', '').strip()
        breed = data.get('breed', '').strip()
        service = data.get('service', '').strip()
        date_str = data.get('date', '').strip()
        time_slot = data.get('time_slot', '').strip()
        notes = data.get('notes', '').strip()

        # Validate dữ liệu cơ bản
        if not full_name or not phone:
            return jsonify({
                'ok': False,
                'message': 'Vui lòng nhập họ tên và số điện thoại!'
            }), 400

        if not service or not date_str or not time_slot:
            return jsonify({
                'ok': False,
                'message': 'Vui lòng chọn dịch vụ, ngày và giờ hẹn!'
            }), 400

        # Validate số điện thoại (đơn giản)
        if not phone.startswith('0') or len(phone) < 10 or len(phone) > 11:
            return jsonify({
                'ok': False,
                'message': 'Số điện thoại không hợp lệ!'
            }), 400

        # Validate ngày (không được là quá khứ)
        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            today = datetime.now().date()
            
            if booking_date < today:
                return jsonify({
                    'ok': False,
                    'message': 'Không thể đặt lịch cho ngày quá khứ!'
                }), 400
        except ValueError:
            return jsonify({
                'ok': False,
                'message': 'Định dạng ngày không hợp lệ! Sử dụng YYYY-MM-DD'
            }), 400

        # Validate giờ (hợp lệ: 9:00 - 18:00)
        valid_times = ['9:00', '10:00', '13:00', '14:00', '15:00', '17:00', '18:00']
        if time_slot not in valid_times:
            return jsonify({
                'ok': False,
                'message': 'Giờ hẹn không hợp lệ!'
            }), 400

        # Tạo booking mới
        booking = Booking(
            full_name=full_name,
            phone=phone,
            pet_name=pet_name,
            breed=breed,
            service=service,
            date=date_str,
            time_slot=time_slot,
            notes=notes,
            status='Chờ xác nhận'
        )

        # Lưu vào database
        db.session.add(booking)
        db.session.commit()

        return jsonify({
            'ok': True,
            'message': f'✅ Đặt lịch thành công! Chúng tôi sẽ gọi {phone} để xác nhận trong 30 phút. 📅',
            'booking_id': booking.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error in submit_booking: {str(e)}")
        return jsonify({
            'ok': False,
            'message': 'Có lỗi xảy ra, vui lòng thử lại!'
        }), 500