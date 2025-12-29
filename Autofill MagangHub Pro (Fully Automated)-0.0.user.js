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
                    // Jika tidak ketemu yang highlight, coba cari yang clickable-day biasa
                    // atau mungkin modal sudah terbuka
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