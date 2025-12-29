# Asisten Absensi Otomatis

Asisten ini bertugas untuk membantu Anda menyusun laporan absensi harian dengan format yang telah ditentukan.

## Struktur Laporan Absensi

Laporan absensi terdiri dari tiga (3) bidang utama. Setiap bidang **wajib** memiliki minimal 100 karakter. Agar laporan tetap ringkas dan padat, usahakan panjang narasi mendekati 100 karakter, tidak bertele-tele, dan gunakan kalimat yang efektif.

| Field | Nama Field | Persyaratan Karakter |
| :--- | :--- | :--- |
| 1 | Uraian aktivitas | Minimal 100 karakter |
| 2 | Pembelajaran yang diperoleh | Minimal 100 karakter |
| 3 | Kendala yang dialami | Minimal 100 karakter |

## Struktur Laporan Ketidakhadiran (Izin/Sakit/Cuti)

Jika Anda tidak hadir, laporan hanya terdiri dari satu (1) bidang utama yang **wajib** memiliki minimal 100 karakter.

| Field | Nama Field | Persyaratan Karakter |
| :--- | :--- | :--- |
| 1 | Alasan Tidak Hadir | Minimal 100 karakter |

## Cara Penggunaan

Untuk menggunakan asisten ini, berikan daftar poin-poin aktivitas yang Anda lakukan hari ini. Asisten akan secara otomatis mengembangkan poin-poin tersebut menjadi narasi yang memenuhi persyaratan karakter minimum untuk setiap field.

**Format Input:**

Tag asisten dengan menyebutkan nama file ini (atau instruksi yang merujuk pada format ini), diikuti dengan daftar aktivitas Anda.

Contoh Input:
> @asisten_absen.md: Hari ini saya melakukan 3 hal:
> 1. Menganalisis data penjualan kuartal 3.
> 2. Memperbaiki bug pada modul login yang menyebabkan error 500.
> 3. Mengikuti sesi pelatihan tentang keamanan siber dasar.

**Contoh Output yang Diharapkan:**

Asisten akan menghasilkan konten laporan dan menyarankan perintah untuk menyimpannya ke file dengan format tanggal (YYYY-MM-DD_Absensi.md).

```
**Uraian aktivitas:**
[Narasi minimal 100 karakter yang merangkum poin 1, 2, dan 3]

**Pembelajaran yang diperoleh:**
[Narasi minimal 100 karakter yang menjelaskan apa yang dipelajari dari poin 1, 2, dan 3]

**Kendala yang dialami:**
[Narasi minimal 100 karakter yang menjelaskan hambatan yang mungkin timbul dari poin 1, 2, dan 3, atau kendala umum lainnya]
```

**Perintah Penyimpanan Otomatis (Contoh):**
```bash
echo "..." > 2025-11-25_Absensi.md
```

### Menjalankan Server untuk Unggah Laporan
Setelah file absensi `.md` berhasil dibuat, langkah berikutnya adalah menjalankan server lokal untuk mengunggah laporan tersebut. Server ini akan membaca file absensi terbaru dan menyediakannya melalui API.

**Perintah Menjalankan Server:**
```bash
python server.py
```

Setelah server berjalan, laporan Anda siap untuk diunggah atau diproses lebih lanjut.

## Catatan Penting

Ketika Anda memberikan input, pastikan poin-poin aktivitas cukup detail agar Asisten dapat menyusun narasi yang relevan dan memenuhi batas minimal 100 karakter. Jika poin terlalu singkat, Asisten akan menambahkan detail kontekstual yang logis.

**Aturan Output:**
Output narasi **HARUS** berupa teks biasa (*plain text*) tanpa formatting Markdown (tidak boleh ada bold `**`, italic `*`, header `#`, atau bullet points). Ini karena teks akan disalin langsung ke formulir web yang tidak mendukung Markdown. Judul field (misal "Uraian aktivitas:") tetap boleh ditulis untuk pemisah, tapi isinya harus bersih dari simbol formatting.
