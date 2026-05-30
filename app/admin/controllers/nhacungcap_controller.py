from app import db
from app.admin.models.nhacungcap_model import NhaCungCap


def get_ncc():
    return NhaCungCap.query.all()


def create_ncc(form):

    ncc = NhaCungCap(
        ten_ncc=form['ten'],
        dia_chi=form['diachi'],
        so_dien_thoai=form['sdt'],
        email=form['email']
    )

    db.session.add(ncc)
    db.session.commit()


def remove_ncc(id):

    ncc = NhaCungCap.query.get(id)

    if ncc:
        db.session.delete(ncc)
        db.session.commit()