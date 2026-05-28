from flask import Blueprint, render_template
from app.user.controllers.main_controller import *

user_bp = Blueprint(
    "user",
    __name__,
    template_folder="../../templates/user" 
)

@user_bp.route("/")
def home():
    data = get_home_data() 
    return render_template("index.html", **data)

