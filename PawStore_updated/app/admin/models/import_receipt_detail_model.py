from app import db


class ImportReceiptDetail(db.Model):
    __tablename__ = 'import_receipt_details'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    receipt_id = db.Column(
        db.String(15),
        db.ForeignKey('import_receipts.id')
    )

    product_id = db.Column(
        db.String(10),
        db.ForeignKey('inventory.id')
    )

    quantity = db.Column(db.Integer)

    import_price = db.Column(db.Integer)

    subtotal = db.Column(db.Integer)

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

            'quantity': self.quantity,

            'import_price': self.import_price,

            'subtotal': self.subtotal,
        }