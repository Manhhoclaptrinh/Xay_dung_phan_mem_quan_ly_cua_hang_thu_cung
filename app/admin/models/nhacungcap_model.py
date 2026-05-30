from app import db

class NhaCungCap(db.Model):

    __tablename__ = 'nhacungcap'

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    ten_ncc = db.Column(
        db.String(100)
    )

    dia_chi = db.Column(
        db.Text
    )

    so_dien_thoai = db.Column(
        db.String(20)
    )

    email = db.Column(
        db.String(100)
    )

    def to_dict(self):

        return {

            "id": self.id,

            "ten_ncc": self.ten_ncc,

            "dia_chi": self.dia_chi,

            "so_dien_thoai": self.so_dien_thoai,

            "email": self.email
        }