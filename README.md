# Asisten Absensi Otomatis untuk MagangHub

Selamat datang di sistem Asisten Absensi Otomatis! Proyek ini dirancang untuk menyederhanakan dan mempercepat proses pelaporan absensi harian di portal MagangHub Kemnaker.

Sistem ini terdiri dari dua komponen utama:
1.  **Asisten Gemini CLI**: Sebuah asisten cerdas yang membantu Anda membuat narasi laporan harian (uraian aktivitas, pembelajaran, dan kendala) sesuai format yang disyaratkan.
2.  **Skrip Autofill Tampermonkey**: Sebuah skrip pengguna yang secara otomatis mengisi formulir absensi di situs MagangHub dengan data yang telah dibuat oleh asisten.

## Alur Kerja Sistem

1.  Anda memberikan poin-poin aktivitas harian Anda ke Gemini CLI.
2.  Asisten memproses input Anda dan menghasilkan file laporan `.md` yang sudah terformat.
3.  Anda menjalankan server lokal (`server.py`) yang akan membaca laporan terbaru.
4.  Anda membuka situs MagangHub, dan skrip Tampermonkey akan memunculkan tombol "Autofill".
5.  Dengan satu klik, skrip mengambil data dari server lokal dan mengisi seluruh formulir absensi secara otomatis.

---

## Persyaratan

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut:
*   **Node.js v18+**: Diperlukan untuk menjalankan Gemini CLI. Anda bisa mengunduhnya dari [situs resmi Node.js](https://nodejs.org/).
*   **Python 3.x**: Untuk menjalankan server lokal.
*   **Browser Modern**: Seperti Google Chrome, Mozilla Firefox, atau Microsoft Edge.

---

## Instalasi dan Pengaturan

Ikuti empat langkah di bawah ini untuk menyiapkan keseluruhan sistem.

### Langkah 1: Siapkan Direktori Proyek

Pastikan semua file proyek berada dalam satu direktori yang sama. Strukturnya akan terlihat seperti ini:

```
/Absensi Maganghub/
|
├── 2025-12-29_Absensi.md   (File laporan yang akan dibuat)
├── asisten_absen.md        (Panduan untuk asisten)
├── server.py               (Server lokal untuk API)
└── Autofill MagangHub-0.0.user.js (Referensi skrip)
```

### Langkah 2: Instal Gemini CLI

1.  Buka terminal atau command prompt.
2.  Jalankan perintah berikut untuk menginstal Gemini CLI secara global melalui `npm` (yang disertakan dengan Node.js):
    ```bash
    npm install -g @google/gemini-cli
    ```
3.  Setelah instalasi selesai, autentikasikan diri Anda dengan menjalankan perintah:
    ```bash
    gemini
    ```
    Ikuti petunjuk yang muncul di terminal untuk login dengan akun Google Anda melalui browser.

### Langkah 3: Instal Ekstensi Tampermonkey

Instal ekstensi Tampermonkey dari toko resmi browser Anda:
*   [Untuk Google Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
*   [Untuk Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
*   [Untuk Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### Langkah 4: Instal Skrip Pengguna (Userscript)

1.  Buka browser Anda dan klik ikon ekstensi Tampermonkey, lalu pilih **"Dasbor"** (Dashboard).
2.  Klik pada tab **"Buat skrip baru"** (atau `Create a new script`).
3.  Hapus semua konten default yang ada di editor.
4.  Salin seluruh kode di bawah ini dan tempelkan ke dalam editor Tampermonkey.

```javascript
// ==UserScript==
// @name         Autofill MagangHub Pro (Fully Automated)
// @match        https://monev.maganghub.kemnaker.go.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper untuk menunggu elemen muncul (penting karena modal butuh waktu loading)
    const waitForElement = (selector, timeout = 3000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(timer);
                    reject(new Error(`Element ${selector} tidak ditemukan`));
                }
            }, 100);
        });
    };

    function injectButton() {
        if (document.getElementById('btn-gemini-autofill')) return;

        const btn = document.createElement('button');
        btn.id = 'btn-gemini-autofill';
        btn.innerHTML = '⚡ AUTOFILL ABSENSI';
        btn.style = 'position:fixed;top:150px;right:30px;z-index:999999;padding:12px 24px;background:#8f00ff;color:white;border:3px solid white;border-radius:16px;font-weight:bold;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.5);';

        btn.onclick = async function() {
            try {
                btn.innerHTML = '⏳ Menuju Modal...';

                // 1. Cari dan Klik tanggal hari ini (today-highlight)
                const todayBtn = document.querySelector('.text-center.clickable-day.today-highlight');
                if (todayBtn) {
                    todayBtn.click();
                } else {
                    console.log('Tombol hari ini tidak ditemukan, mencoba lanjut...');
                }

                // 2. Tunggu sampai textarea muncul (modal terbuka)
                btn.innerHTML = '⏳ Menunggu Modal...';
                await waitForElement('textarea[placeholder*="uraian aktivitas"]');

                // 3. Ambil data dari server Python
                btn.innerHTML = '⏳ Mengambil Data...';
                const response = await fetch('http://localhost:5000/get-report');
                const data = await response.json();

                // 4. Proses Input
                const inputAktivitas = document.querySelector('textarea[placeholder*="uraian aktivitas"]');
                const inputPembelajaran = document.querySelector('textarea[placeholder*="ilmu/pembelajaran"]');
                const inputKendala = document.querySelector('textarea[placeholder*="kendala/hambatan"]');

                if (inputAktivitas && inputPembelajaran && inputKendala) {
                    fillField(inputAktivitas, data.aktivitas);
                    fillField(inputPembelajaran, data.pembelajaran);
                    fillField(inputKendala, data.kendala);

                    const cb = document.querySelector('input[type="checkbox"]');
                    if (cb && !cb.checked) cb.click();

                    btn.innerHTML = '✅ BERHASIL';
                    setTimeout(() => { btn.innerHTML = '⚡ AUTOFILL ABSENSI'; }, 2000);
                }
            } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan: ' + err.message);
                btn.innerHTML = '⚡ AUTOFILL ABSENSI';
            }
        };

        document.body.appendChild(btn);
    }

    function fillField(el, value) {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setInterval(injectButton, 2000);
})();
```

5.  Simpan skrip dengan menekan `Ctrl + S` atau melalui menu `File > Save`.

---

## Cara Penggunaan Harian

Ikuti tiga langkah sederhana ini setiap hari untuk melaporkan absensi.

### Langkah 1: Buat Laporan Harian

- Buka terminal Gemini CLI di direktori proyek Anda.
- Jalankan perintah dengan memberikan poin-poin aktivitas Anda hari ini. Gunakan format berikut:

```
@asisten_absen.md saya hadir hari ini: [tuliskan poin-poin aktivitas Anda]
```

**Contoh:**
```
@asisten_absen.md saya hadir hari ini: -mengerjakan feedback UI/UX. -menyelesaikan 10 dari 12 poin. -tidak ada kendala.
```

- Asisten akan membuat file `YYYY-MM-DD_Absensi.md` secara otomatis.

### Langkah 2: Jalankan Server Lokal

- Di terminal lain (biarkan Gemini CLI tetap berjalan jika perlu), jalankan perintah berikut:

```bash
python server.py
```

- Server akan dimulai dan siap menyajikan data laporan. Biarkan terminal ini tetap terbuka.

### Langkah 3: Gunakan Autofill di Browser

1.  Buka situs [Monev MagangHub](https://monev.maganghub.kemnaker.go.id/).
2.  Setelah halaman dimuat, sebuah tombol ungu dengan tulisan **"⚡ AUTOFILL ABSENSI"** akan muncul di sisi kanan layar.
3.  Klik tombol tersebut. Skrip akan secara otomatis membuka modal absensi, mengambil data dari server lokal, dan mengisi semua kolom yang diperlukan.
4.  Pastikan semua data sudah benar, lalu kirim laporan Anda.

Selesai! Proses absensi Anda kini jauh lebih cepat dan efisien.
