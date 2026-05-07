# ==============================
# HỆ THỐNG QUẢN LÝ KHÁCH SẠN THÚ CƯNG (FULL + CRUD + UI IMPROVED)
# ==============================

import sys
import sqlite3
from datetime import datetime
from PyQt6 import QtWidgets, QtCore, QtGui

from openpyxl import Workbook
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

DB_NAME = "pet_boarding.db"
PRICE_PER_DAY = 100

# ================= DATABASE =================
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        owner TEXT,
        room_id INTEGER,
        checkin TEXT,
        checkout TEXT,
        diet TEXT,
        exercise TEXT
    )""")

    conn.commit()
    conn.close()

# ================= STYLE =================
def load_style(app):
    app.setStyle("Fusion")
    app.setStyleSheet("""
        QWidget { font-size: 14px; }
        QLineEdit, QComboBox {
            padding: 6px;
            border-radius: 6px;
            border: 1px solid #ccc;
        }
        QPushButton {
            background-color: #009688;
            color: white;
            padding: 8px;
            border-radius: 8px;
        }
        QPushButton:hover {
            background-color: #00bfa5;
        }
    """)

# ================= MAIN =================
class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Quản Lý Khách Sạn Thú Cưng")
        self.resize(1100, 650)

        self.tabs = QtWidgets.QTabWidget()
        self.setCentralWidget(self.tabs)

        self.room_tab = RoomTab()
        self.pet_tab = PetTab(self.room_tab)

        self.tabs.addTab(self.room_tab, "🏠 Phòng")
        self.tabs.addTab(self.pet_tab, "🐶 Thú Cưng")

# ================= ROOM =================
class RoomTab(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        layout = QtWidgets.QVBoxLayout()

        self.table = QtWidgets.QTableWidget(0, 3)
        self.table.setHorizontalHeaderLabels(["ID", "Tên Phòng", "Trạng Thái"])
        self.table.horizontalHeader().setStretchLastSection(True)

        form = QtWidgets.QHBoxLayout()
        self.name = QtWidgets.QLineEdit()
        self.name.setPlaceholderText("Tên phòng")

        self.status = QtWidgets.QComboBox()
        self.status.addItems(["Empty", "Occupied"])

        btn = QtWidgets.QPushButton("➕ Thêm")
        btn.clicked.connect(self.add_room)

        form.addWidget(self.name)
        form.addWidget(self.status)
        form.addWidget(btn)

        layout.addWidget(self.table)
        layout.addLayout(form)
        self.setLayout(layout)
        self.load()

    def load(self):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("SELECT * FROM rooms")
        rows = c.fetchall()
        self.table.setRowCount(len(rows))
        for i,row in enumerate(rows):
            for j,val in enumerate(row):
                self.table.setItem(i,j,QtWidgets.QTableWidgetItem(str(val)))
        conn.close()

    def add_room(self):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO rooms (name,status) VALUES (?,?)",
                  (self.name.text(), self.status.currentText()))
        conn.commit()
        conn.close()
        self.load()

    def get_empty_rooms(self):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("SELECT id,name FROM rooms WHERE status='Empty'")
        data = c.fetchall()
        conn.close()
        return data

    def set_status(self, room_id, status):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("UPDATE rooms SET status=? WHERE id=?", (status, room_id))
        conn.commit()
        conn.close()
        self.load()

# ================= PET =================
class PetTab(QtWidgets.QWidget):
    def __init__(self, room_tab):
        super().__init__()
        self.room_tab = room_tab

        main_layout = QtWidgets.QVBoxLayout()

        self.table = QtWidgets.QTableWidget(0, 8)
        self.table.setHorizontalHeaderLabels([
            "ID","Tên","Chủ","Phòng","Checkin","Checkout","Ăn","Vận động"
        ])
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.cellClicked.connect(self.load_form)

        # ===== FORM =====
        form = QtWidgets.QGridLayout()

        self.name = QtWidgets.QLineEdit(); self.name.setPlaceholderText("Tên thú")
        self.owner = QtWidgets.QLineEdit(); self.owner.setPlaceholderText("Chủ")
        self.room_box = QtWidgets.QComboBox()
        self.diet = QtWidgets.QLineEdit(); self.diet.setPlaceholderText("Ăn uống")
        self.exercise = QtWidgets.QLineEdit(); self.exercise.setPlaceholderText("Vận động")

        self.load_rooms()

        form.addWidget(QtWidgets.QLabel("Tên thú"),0,0)
        form.addWidget(self.name,0,1)
        form.addWidget(QtWidgets.QLabel("Chủ"),0,2)
        form.addWidget(self.owner,0,3)

        form.addWidget(QtWidgets.QLabel("Phòng"),1,0)
        form.addWidget(self.room_box,1,1)
        form.addWidget(QtWidgets.QLabel("Ăn"),1,2)
        form.addWidget(self.diet,1,3)

        form.addWidget(QtWidgets.QLabel("Vận động"),2,0)
        form.addWidget(self.exercise,2,1)

        # ===== BUTTONS =====
        btn_layout = QtWidgets.QHBoxLayout()

        btn_add = QtWidgets.QPushButton("🐾 Check-in")
        btn_update = QtWidgets.QPushButton("✏️ Sửa")
        btn_delete = QtWidgets.QPushButton("❌ Xóa")
        btn_checkout = QtWidgets.QPushButton("🚪 Checkout")
        btn_bill = QtWidgets.QPushButton("💰 Tính tiền")
        btn_excel = QtWidgets.QPushButton("📊 Excel")
        btn_pdf = QtWidgets.QPushButton("📄 PDF")

        btn_add.clicked.connect(self.add_pet)
        btn_update.clicked.connect(self.update_pet)
        btn_delete.clicked.connect(self.delete_pet)
        btn_checkout.clicked.connect(self.checkout)
        btn_bill.clicked.connect(self.bill)
        btn_excel.clicked.connect(self.export_excel)
        btn_pdf.clicked.connect(self.export_pdf)

        btn_layout.addWidget(btn_add)
        btn_layout.addWidget(btn_update)
        btn_layout.addWidget(btn_delete)
        btn_layout.addWidget(btn_checkout)
        btn_layout.addWidget(btn_bill)
        btn_layout.addWidget(btn_excel)
        btn_layout.addWidget(btn_pdf)

        main_layout.addWidget(self.table)
        main_layout.addLayout(form)
        main_layout.addLayout(btn_layout)

        self.setLayout(main_layout)
        self.load()

    def load_form(self, row, col):
        self.name.setText(self.table.item(row,1).text())
        self.owner.setText(self.table.item(row,2).text())
        self.diet.setText(self.table.item(row,6).text())
        self.exercise.setText(self.table.item(row,7).text())

    def load_rooms(self):
        self.room_box.clear()
        for r in self.room_tab.get_empty_rooms():
            self.room_box.addItem(f"{r[1]} (ID:{r[0]})", r[0])

    def load(self):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("SELECT * FROM pets")
        rows = c.fetchall()
        self.table.setRowCount(len(rows))
        for i,row in enumerate(rows):
            for j,val in enumerate(row):
                self.table.setItem(i,j,QtWidgets.QTableWidgetItem(str(val)))
        conn.close()

    def add_pet(self):
        room_id = self.room_box.currentData()
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("INSERT INTO pets VALUES (NULL,?,?,?,?,?,?,?)",
                  (self.name.text(), self.owner.text(), room_id,
                   datetime.now().strftime("%Y-%m-%d"), "", self.diet.text(), self.exercise.text()))
        conn.commit()
        conn.close()

        self.room_tab.set_status(room_id, "Occupied")
        self.load()
        self.load_rooms()

    def update_pet(self):
        row = self.table.currentRow()
        if row < 0: return
        pet_id = self.table.item(row,0).text()

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("UPDATE pets SET name=?, owner=?, diet=?, exercise=? WHERE id=?",
                  (self.name.text(), self.owner.text(), self.diet.text(), self.exercise.text(), pet_id))
        conn.commit()
        conn.close()
        self.load()

    def delete_pet(self):
        row = self.table.currentRow()
        if row < 0: return

        pet_id = self.table.item(row,0).text()

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("DELETE FROM pets WHERE id=?", (pet_id,))
        conn.commit()
        conn.close()
        self.load()

    def checkout(self):
        row = self.table.currentRow()
        if row < 0: return

        pet_id = self.table.item(row,0).text()
        room_id = self.table.item(row,3).text()

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("UPDATE pets SET checkout=? WHERE id=?",
                  (datetime.now().strftime("%Y-%m-%d"), pet_id))
        conn.commit()
        conn.close()

        self.room_tab.set_status(room_id, "Empty")
        self.load()
        self.load_rooms()

    def bill(self):
        row = self.table.currentRow()
        if row < 0: return

        checkin = self.table.item(row,4).text()
        checkout = self.table.item(row,5).text()

        d1 = datetime.strptime(checkin, "%Y-%m-%d")
        d2 = datetime.now() if checkout=="" else datetime.strptime(checkout, "%Y-%m-%d")

        days = (d2-d1).days + 1
        total = days * PRICE_PER_DAY

        QtWidgets.QMessageBox.information(self, "Hóa đơn",
            f"Số ngày: {days}\nTổng tiền: {total}")

    def export_excel(self):
        wb = Workbook()
        ws = wb.active
        ws.append(["ID","Tên","Chủ","Phòng","Checkin","Checkout","Ăn","Vận động"])

        for row in range(self.table.rowCount()):
            data = []
            for col in range(self.table.columnCount()):
                item = self.table.item(row, col)
                data.append(item.text() if item else "")
            ws.append(data)

        wb.save("pets.xlsx")
        QtWidgets.QMessageBox.information(self, "Excel", "Đã xuất pets.xlsx")

    def export_pdf(self):
        doc = SimpleDocTemplate("pets.pdf")
        styles = getSampleStyleSheet()
        content = []

        content.append(Paragraph("Danh sách thú cưng", styles['Title']))

        for row in range(self.table.rowCount()):
            text = " - ".join([
                self.table.item(row, col).text() if self.table.item(row, col) else ""
                for col in range(self.table.columnCount())
            ])
            content.append(Paragraph(text, styles['Normal']))

        doc.build(content)
        QtWidgets.QMessageBox.information(self, "PDF", "Đã xuất pets.pdf")

# ================= RUN =================
if __name__ == "__main__":
    init_db()
    app = QtWidgets.QApplication(sys.argv)
    load_style(app)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
