from app import db


class InventoryHistory(db.Model):
    __tablename__ = 'inventory_history'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    product_id = db.Column(
        db.String(10),
        db.ForeignKey('inventory.id')
    )

    action = db.Column(
        db.String(50)
    )  # Nhập | Xuất | Điều chỉnh

    quantity_change = db.Column(
        db.Integer
    )

    created_at = db.Column(
        db.String(30)
    )

    created_by = db.Column(
        db.String(120)
    )

    note = db.Column(db.Text)

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

            'action': self.action,

            'quantity_change':
                self.quantity_change,

            'created_at': self.created_at,

            'created_by': self.created_by,

            'note': self.note,
        }