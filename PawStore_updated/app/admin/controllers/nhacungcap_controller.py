from app.admin.models.nhacungcap_model import *


def get_ncc():
    return get_all_ncc()


def create_ncc(form):
    ten = form['ten']
    diachi = form['diachi']
    sdt = form['sdt']
    email = form['email']

    add_ncc(ten, diachi, sdt, email)


def remove_ncc(id):
    delete_ncc(id)