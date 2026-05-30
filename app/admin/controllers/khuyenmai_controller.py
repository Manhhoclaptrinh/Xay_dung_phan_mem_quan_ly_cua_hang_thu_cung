from app import db
from app.admin.models.khuyenmai_model import KhuyenMai


def get_khuyenmai():
    return KhuyenMai.query.all()


def create_khuyenmai(form):

    km = KhuyenMai(
        ten_km=form['ten_km'],
        loai_km=form['loai_km'],
        giam_gia=form['giam_gia'],
        mo_ta=form['mo_ta'],
        ngay_bat_dau=form['ngay_bd'],
        ngay_ket_thuc=form['ngay_kt']
    )

    db.session.add(km)
    db.session.commit()


def remove_khuyenmai(id):

    km = KhuyenMai.query.get(id)

    if km:
        db.session.delete(km)
        db.session.commit()