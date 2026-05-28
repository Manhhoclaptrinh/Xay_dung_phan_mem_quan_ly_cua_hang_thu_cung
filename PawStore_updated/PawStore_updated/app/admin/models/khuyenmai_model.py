import sqlite3

DATABASE = 'instance/pawstore.db'


def get_all_khuyenmai():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM khuyenmai")
    data = cursor.fetchall()

    conn.close()
    return data


def add_khuyenmai(ten_km, loai_km, giam_gia, mo_ta, ngay_bd, ngay_kt):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO khuyenmai
        (ten_km, loai_km, giam_gia, mo_ta, ngay_bat_dau, ngay_ket_thuc)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (ten_km, loai_km, giam_gia, mo_ta, ngay_bd, ngay_kt))

    conn.commit()
    conn.close()


def delete_khuyenmai(id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM khuyenmai WHERE id=?", (id,))

    conn.commit()
    conn.close()