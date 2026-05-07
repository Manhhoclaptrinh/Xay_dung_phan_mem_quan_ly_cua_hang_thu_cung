from app.admin.models.khuyenmai_model import *


def get_khuyenmai():
    return get_all_khuyenmai()


def create_khuyenmai(form):
    ten_km = form['ten_km']
    loai_km = form['loai_km']
    giam_gia = form['giam_gia']
    mo_ta = form['mo_ta']
    ngay_bd = form['ngay_bd']
    ngay_kt = form['ngay_kt']

    add_khuyenmai(
        ten_km,
        loai_km,
        giam_gia,
        mo_ta,
        ngay_bd,
        ngay_kt
    )


def remove_khuyenmai(id):
    delete_khuyenmai(id)