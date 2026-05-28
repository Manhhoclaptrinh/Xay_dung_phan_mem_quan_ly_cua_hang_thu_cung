from app import db


class ExportReceiptDetail(db.Model):
    __tablename__ = 'export_receipt_details'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    receipt_id = db.Column(
        db.String(15),
        db.ForeignKey('export_receipts.id')
    )

    product_id = db.Column(
        db.String(10),
        db.ForeignKey('inventory.id')
    )

    quantity = db.Column(db.Integer)

    product = db.relationship(
        'Inventory'
    )

    def to_dict(self):

        return {
            'id': self.id,

            'product_id': self.product_id,

            'product_name':
                self.product.name
                if self.product else '',

            'quantity': self.quantity
        }