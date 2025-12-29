import os
import glob
import re
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_latest_report():
    files = glob.glob("*.md")
    if not files:
        return None
    
    latest_file = max(files, key=os.path.getmtime)
    print(f"📖 Sedang Memproses: {latest_file}")
    
    try:
        with open(latest_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # LOGIKA BARU: Mencari teks di antara kata kunci utama
        # Kita buat case-insensitive agar tidak masalah huruf besar/kecil
        content_lower = content.lower()
        
        # Cari posisi index tiap judul
        idx_aktivitas = content_lower.find("uraian aktivitas")
        idx_pembelajaran = content_lower.find("pembelajaran yang diperoleh")
        idx_kendala = content_lower.find("kendala yang dialami")

        # Fungsi pembantu untuk membersihkan teks dari sisa markdown (** atau :)
        def clean_text(text):
            # Hapus tanda bintang, titik dua di awal, dan spasi berlebih
            cleaned = re.sub(r'^[:\*\s]+|[:\*\s]+$', '', text)
            return cleaned.strip()

        # Potong teks berdasarkan urutan index
        res_aktivitas = ""
        res_pembelajaran = ""
        res_kendala = ""

        if idx_aktivitas != -1:
            end = idx_pembelajaran if idx_pembelajaran != -1 else len(content)
            # Ambil teks setelah judul "uraian aktivitas" (sekitar 20 karakter dari index awal)
            raw_text = content[idx_aktivitas + 16 : end]
            res_aktivitas = clean_text(raw_text)

        if idx_pembelajaran != -1:
            end = idx_kendala if idx_kendala != -1 else len(content)
            raw_text = content[idx_pembelajaran + 27 : end]
            res_pembelajaran = clean_text(raw_text)

        if idx_kendala != -1:
            raw_text = content[idx_kendala + 20 :]
            res_kendala = clean_text(raw_text)

        # Jika masih kosong, berikan pesan default
        return {
            "aktivitas": res_aktivitas or "Teks aktivitas tidak ditemukan di file",
            "pembelajaran": res_pembelajaran or "Teks pembelajaran tidak ditemukan di file",
            "kendala": res_kendala or "Teks kendala tidak ditemukan di file"
        }
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

@app.route('/get-report')
def send_report():
    data = get_latest_report()
    if data:
        return jsonify(data)
    return jsonify({"error": "File tidak ditemukan"}), 404

if __name__ == '__main__':
    print("🚀 Server Universal Autofill Siap!")
    app.run(port=5000)