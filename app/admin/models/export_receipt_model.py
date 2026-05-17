from app import db


class ExportReceipt(db.Model):
    __tablename__ = 'export_receipts'

    id = db.Column(
        db.String(15),
        primary_key=True
    )

    export_type = db.Column(
        db.String(50)
    )  # Xuất bán | Xuất hỏng | Nội bộ

    export_date = db.Column(
        db.String(30)
    )

    created_by = db.Column(
        db.String(120)
    )

    note = db.Column(db.Text)

    details = db.relationship(
        'ExportReceiptDetail',
        backref='receipt',
        lazy=True,
        cascade='all, delete'
    )

    def to_dict(self):

        return {
            'id': self.id,

            'export_type': self.export_type,

            'export_date': self.export_date,

            'created_by': self.created_by,

            'note': self.note,

            'details': [
                d.to_dict()
                for d in self.details
            ]
        }