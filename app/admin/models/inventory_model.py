from app import db


class Inventory(db.Model):
    __tablename__ = 'inventory'
    
    id = db.Column(db.String(10), primary_key=True)

    name = db.Column(db.String(120), nullable=False)
    category_id = db.Column(
        db.String(10),
        db.ForeignKey('categories.id')
    )    

    brand = db.Column(db.String(80))

    import_price = db.Column(db.Integer, default=0)
    sell_price = db.Column(db.Integer, default=0)

    quantity = db.Column(db.Integer, default=0)
    min_qty = db.Column(db.Integer, default=5)

    expiry = db.Column(db.String(20))

    supplier = db.Column(db.String(120))

    barcode = db.Column(db.String(120))

    description = db.Column(db.Text)

    status = db.Column(
        db.String(30),
        default='OK'
    )  # OK | Sắp hết | Hết hàng | Sắp hết hạn

    def update_status(self):

        if self.quantity <= 0:
            self.status = 'Hết hàng'

        elif self.quantity < self.min_qty:
            self.status = 'Sắp hết'

        else:
            self.status = 'OK'

    def to_dict(self):

        return {

            'id': self.id,

            'name': self.name,

            'category_id': self.category_id,

            'category': self.category_info.name if self.category_info else 'Chưa phân loại',
            
            'brand': self.brand,

            'import_price': self.import_price,

            'sell_price': self.sell_price,

            'quantity': self.quantity,

            'min_qty': self.min_qty,

            'expiry': self.expiry,

            'supplier': self.supplier,

            'barcode': self.barcode,

            'description': self.description,

            'status': self.status,
        }