from app import db


class ImportReceipt(db.Model):
    __tablename__ = 'import_receipts'

    id = db.Column(
        db.String(15),
        primary_key=True
    )

    supplier_id = db.Column(
        db.String(10),
        db.ForeignKey('vendors.id')
    )

    import_date = db.Column(db.String(30))

    created_by = db.Column(db.String(120))

    total_amount = db.Column(
        db.Integer,
        default=0
    )

    note = db.Column(db.Text)

    details = db.relationship(
        'ImportReceiptDetail',
        backref='receipt',
        lazy=True,
        cascade='all, delete'
    )

    def to_dict(self):

        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'supplier_name':
                self.vendor.name
                if self.vendor else '',

            'import_date': self.import_date,

            'created_by': self.created_by,

            'total_amount': self.total_amount,

            'note': self.note,

            'details': [
                d.to_dict()
                for d in self.details
            ]
        }