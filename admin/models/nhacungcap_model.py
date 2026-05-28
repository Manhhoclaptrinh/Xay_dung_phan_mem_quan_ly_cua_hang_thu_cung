import sqlite3

DATABASE = 'instance/pawstore.db'


def get_all_ncc():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM nhacungcap")
    data = cursor.fetchall()

    conn.close()
    return data


def add_ncc(ten, diachi, sdt, email):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO nhacungcap
        (ten_ncc, dia_chi, so_dien_thoai, email)
        VALUES (?, ?, ?, ?)
    """, (ten, diachi, sdt, email))

    conn.commit()
    conn.close()


def delete_ncc(id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM nhacungcap WHERE id=?", (id,))

    conn.commit()
    conn.close()