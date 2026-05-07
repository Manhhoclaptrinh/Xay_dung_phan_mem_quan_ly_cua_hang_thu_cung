from flask import Blueprint, render_template
from app.user.controllers.main_controller import *
from flask import Blueprint, render_template
from app.user.controllers.main_controller import user_bp as main_bp
from app.user.controllers.booking_controller import submit_booking

user_bp = Blueprint(
    "user",
    __name__,
    template_folder="../../templates/user" 
)
booking_bp = Blueprint(
    'booking',
    __name__,
    url_prefix='/api'
)

@user_bp.route("/")
def home():
    data = get_home_data() 
    return render_template("index.html", **data)

@booking_bp.route('/booking', methods=['POST'])
def api_booking():
    return submit_booking()


__all__ = ['main_bp', 'booking_bp']