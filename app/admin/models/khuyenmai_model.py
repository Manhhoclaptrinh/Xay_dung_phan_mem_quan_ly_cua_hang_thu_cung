from app import db

class KhuyenMai(db.Model):
    __tablename__ = 'khuyenmai'

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    ten_km = db.Column(
        db.String(100),
        nullable=False
    )

    loai_km = db.Column(
        db.String(50)
    )

    giam_gia = db.Column(
        db.Float
    )

    mo_ta = db.Column(
        db.Text
    )

    ngay_bat_dau = db.Column(
        db.String(20)
    )

    ngay_ket_thuc = db.Column(
        db.String(20)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ten_km": self.ten_km,
            "loai_km": self.loai_km,
            "giam_gia": self.giam_gia,
            "mo_ta": self.mo_ta,
            "ngay_bat_dau": self.ngay_bat_dau,
            "ngay_ket_thuc": self.ngay_ket_thuc
        }