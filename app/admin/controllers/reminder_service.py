"""
reminder_service.py
-------------------
Tạo lịch nhắc khi booking được tạo.
Chạy background thread check định kỳ mỗi 5 phút.
"""
import threading
import time
from datetime import datetime, timedelta


def _parse_appt_dt(date_str, time_slot):
    """Parse ngày giờ hẹn, thử nhiều format."""
    time_slot = (time_slot or '').strip()
    date_str   = (date_str  or '').strip()

    # Thêm :00 nếu chỉ có giờ không có phút (vd: "9:00" → OK, "9" → "9:00")
    if ':' not in time_slot:
        time_slot = time_slot + ':00'

    # Chuẩn hoá giờ 1 chữ số: "9:00" → "09:00"
    parts = time_slot.split(':')
    time_slot = parts[0].zfill(2) + ':' + parts[1]

    for fmt in ('%Y-%m-%d %H:%M', '%d/%m/%Y %H:%M'):
        try:
            return datetime.strptime(f"{date_str} {time_slot}", fmt)
        except ValueError:
            continue
    return None


def create_reminders_for_booking(booking):
    """Tạo 2 reminder: trước 1 ngày và trước 1 giờ."""
    from app import db
    from app.user.models.booking_reminder_model import BookingReminder

    appt_dt = _parse_appt_dt(booking.date, booking.time_slot)
    if not appt_dt:
        print(f"[Reminder] Không parse được ngày giờ booking #{booking.id}: "
              f"date={booking.date!r} time={booking.time_slot!r}")
        return

    now = datetime.now()  # giờ local
    remind_1day  = appt_dt - timedelta(days=1)
    remind_1hour = appt_dt - timedelta(hours=1)

    to_add = []

    if remind_1day > now:
        to_add.append(BookingReminder(
            booking_id  = booking.id,
            remind_type = '1_day',
            remind_at   = remind_1day,
            status      = 'Pending',
            message     = (
                f"Nhắc lịch hẹn ngày mai: {booking.full_name} ({booking.phone}) "
                f"- {booking.service} lúc {booking.time_slot} ngày {booking.date}"
            ),
        ))

    if remind_1hour > now:
        to_add.append(BookingReminder(
            booking_id  = booking.id,
            remind_type = '1_hour',
            remind_at   = remind_1hour,
            status      = 'Pending',
            message     = (
                f"Nhắc lịch hẹn 1 giờ nữa: {booking.full_name} ({booking.phone}) "
                f"- {booking.service} lúc {booking.time_slot} ngày {booking.date}"
            ),
        ))

    if not to_add:
        print(f"[Reminder] Booking #{booking.id}: lịch hẹn quá gần, không tạo reminder")
        return

    try:
        db.session.add_all(to_add)
        db.session.commit()
        print(f"[Reminder] Đã tạo {len(to_add)} reminder cho booking #{booking.id} "
              f"({booking.full_name} - {booking.date} {booking.time_slot})")
    except Exception as e:
        db.session.rollback()
        print(f"[Reminder] Lỗi tạo reminder: {e}")


def cancel_reminders_for_booking(booking_id):
    """Huỷ toàn bộ reminder Pending khi booking bị huỷ."""
    from app import db
    from app.user.models.booking_reminder_model import BookingReminder
    try:
        BookingReminder.query.filter_by(
            booking_id=booking_id, status='Pending'
        ).update({'status': 'Cancelled'})
        db.session.commit()
        print(f"[Reminder] Đã huỷ reminders cho booking #{booking_id}")
    except Exception as e:
        db.session.rollback()
        print(f"[Reminder] Lỗi huỷ reminder: {e}")


# ── Background scheduler ─────────────────────────────────────────

_scheduler_started = False
_scheduler_lock    = threading.Lock()


def _check_and_send_reminders(app):
    with app.app_context():
        from app import db
        from app.user.models.booking_reminder_model import BookingReminder
        now = datetime.now()
        try:
            due = BookingReminder.query.filter(
                BookingReminder.status    == 'Pending',
                BookingReminder.remind_at <= now,
            ).all()
            for r in due:
                # Mở rộng sau: gửi email/SMS tại đây
                r.status = 'Sent'
                print(f"[Reminder] ✅ Đã gửi nhắc #{r.id}: {r.message}")
            if due:
                db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"[Reminder] Lỗi scheduler: {e}")


def _scheduler_loop(app, interval=300):
    while True:
        time.sleep(interval)
        try:
            _check_and_send_reminders(app)
        except Exception as e:
            print(f"[Reminder] Scheduler exception: {e}")


def start_reminder_scheduler(app):
    global _scheduler_started
    with _scheduler_lock:
        if _scheduler_started:
            return
        _scheduler_started = True
    t = threading.Thread(
        target=_scheduler_loop,
        args=(app,),
        daemon=True,
        name='ReminderScheduler',
    )
    t.start()
    print("[Reminder] Scheduler đã khởi động (kiểm tra mỗi 5 phút)")