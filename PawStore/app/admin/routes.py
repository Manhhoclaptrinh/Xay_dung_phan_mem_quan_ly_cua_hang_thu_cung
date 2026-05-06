from flask import Blueprint, render_template
from app.admin.controllers.dashboard_controller import *

admin_bp = Blueprint(
    "admin",
    __name__,
    template_folder="../../templates/admin"
)

@admin_bp.route("/")
def dashboard():
    data = get_dashboard_data()
    return render_template("index.html", **data)