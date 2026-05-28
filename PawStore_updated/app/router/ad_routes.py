from flask import Blueprint, render_template
from app.admin.controllers.dashboard_controller import *
from app.admin.controllers.staff_controller import *
from app.admin.controllers.dashboard_controller import *
from flask import request

admin_bp = Blueprint(
    "admin",
    __name__,
    template_folder="../../templates/admin"
)

@admin_bp.route("/")
def dashboard():
    data = get_dashboard_data()
    return render_template("index.html", **data)

from flask import render_template, request, redirect
from app import app

from app.admin.controllers.khuyenmai_controller import *
from app.admin.controllers.nhacungcap_controller import *


# ==========================
# KHUYEN MAI
# ==========================

@app.route('/admin/khuyenmai')
def khuyenmai():
    data = get_khuyenmai()
    return render_template(
        'admin/khuyenmai.html',
        khuyenmais=data
    )


@app.route('/admin/add-khuyenmai', methods=['POST'])
def add_km():
    create_khuyenmai(request.form)
    return redirect('/admin/khuyenmai')


@app.route('/admin/delete-khuyenmai/<int:id>')
def delete_km(id):
    remove_khuyenmai(id)
    return redirect('/admin/khuyenmai')


# ==========================
# NHA CUNG CAP
# ==========================

@app.route('/admin/nhacungcap')
def nhacungcap():
    data = get_ncc()

    return render_template(
        'admin/nhacungcap.html',
        nhacungcaps=data
    )


@app.route('/admin/add-ncc', methods=['POST'])
def add_ncc_route():
    create_ncc(request.form)
    return redirect('/admin/nhacungcap')


@app.route('/admin/delete-ncc/<int:id>')
def delete_ncc_route(id):
    remove_ncc(id)
    return redirect('/admin/nhacungcap')