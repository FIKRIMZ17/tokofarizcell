// TAMPILKAN TANGGAL HARI INI
function tampilkanTanggal() {
    const tanggalSpan = document.getElementById('tanggalHariIni');
    if (tanggalSpan) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        tanggalSpan.textContent = today.toLocaleDateString('id-ID', options);
    }
}

// SEARCH BAR DENGAN SARAN
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const saranContainer = document.getElementById('saranContainer');
    
    if (!searchInput) return;
    
    // Saat mengetik
    searchInput.addEventListener('keyup', function() {
        const keyword = this.value.toLowerCase().trim();
        
        if (keyword.length < 1) {
            saranContainer.style.display = 'none';
            return;
        }
        
        // Cari barang yang cocok
        const hasil = daftarBarang.filter(barang => 
            barang.nama.toLowerCase().includes(keyword)
        ).slice(0, 5); // Max 5 saran
        
        if (hasil.length > 0) {
            saranContainer.innerHTML = '';
            hasil.forEach(barang => {
                const modalSatuan = barang.modal / barang.jumlahBeli;
                const item = document.createElement('div');
                item.className = 'saran-item';
                item.innerHTML = `
                    <span class="saran-nama">${barang.nama}</span>
                    <span class="saran-harga">${formatRupiah(modalSatuan)}/${barang.satuanBeli}</span>
                `;
                item.onclick = () => {
                    window.location.href = `cek-harga.html?cari=${encodeURIComponent(barang.nama)}`;
                };
                saranContainer.appendChild(item);
            });
            saranContainer.style.display = 'block';
        } else {
            saranContainer.style.display = 'none';
        }
    });
    
    // Tombol cari
    searchBtn.addEventListener('click', function() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            window.location.href = `cek-harga.html?cari=${encodeURIComponent(keyword)}`;
        }
    });
    
    // Enter di input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const keyword = this.value.trim();
            if (keyword) {
                window.location.href = `cek-harga.html?cari=${encodeURIComponent(keyword)}`;
            }
        }
    });
}

// UPDATE MINI KERANJANG
function updateMiniKeranjang() {
    const mini = document.getElementById('miniRingkasan');
    if (!mini) return;
    
    if (keranjangBelanja.length === 0) {
        mini.innerHTML = '<p class="kosong">Belum ada barang</p>';
        return;
    }
    
    let total = 0;
    let html = '<ul style="list-style: none; padding: 0;">';
    
    keranjangBelanja.slice(0, 3).forEach(item => {
        total += item.totalHarga;
        html += `<li style="margin-bottom: 5px;">• ${item.nama} (${item.jumlah} ${item.satuan})</li>`;
    });
    
    if (keranjangBelanja.length > 3) {
        html += `<li>...dan ${keranjangBelanja.length - 3} lainnya</li>`;
    }
    
    html += `<li style="font-weight: bold; margin-top: 8px;">Total: ${formatRupiah(total)}</li>`;
    html += '</ul>';
    
    mini.innerHTML = html;
}

// TAMPILKAN BARANG TERBARU
function tampilkanBarangTerbaru() {
    const container = document.getElementById('baruList');
    if (!container) return;
    
    // Ambil 3 barang terakhir
    const terbaru = [...daftarBarang].reverse().slice(0, 3);
    
    if (terbaru.length === 0) {
        container.innerHTML = '<p class="kosong">Belum ada barang</p>';
        return;
    }
    
    container.innerHTML = '';
    terbaru.forEach(barang => {
        const modalSatuan = barang.modal / barang.jumlahBeli;
        const item = document.createElement('div');
        item.className = 'baru-item';
        item.innerHTML = `
            <span><strong>${barang.nama}</strong></span>
            <span style="color: #F18F01;">${formatRupiah(modalSatuan)}/${barang.satuanBeli}</span>
        `;
        container.appendChild(item);
    });
}

// TAMPILKAN POPULER (SEMENTARA STATIS, NANTI BISA DINAMIS)
function tampilkanPopuler() {
    const container = document.getElementById('populerList');
    if (!container) return;
    
    const populer = ['Beras', 'Telur', 'Gula', 'Minyak', 'Rokok', 'Kopi'];
    
    container.innerHTML = '';
    populer.forEach(item => {
        const span = document.createElement('span');
        span.className = 'populer-item';
        span.textContent = item;
        span.onclick = () => {
            window.location.href = `cek-harga.html?cari=${encodeURIComponent(item)}`;
        };
        container.appendChild(span);
    });
}

// PANGGIL SEMUA FUNGSI
document.addEventListener('DOMContentLoaded', function() {
    tampilkanTanggal();
    initSearch();
    updateMiniKeranjang();
    tampilkanBarangTerbaru();
    tampilkanPopuler();
});
function ubahJumlah(id, delta) {
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
        const newQty = cartItems[index].qty + delta;
        if (newQty >= 1) {
            cartItems[index].qty = newQty;
            cartItems[index].totalHarga = cartItems[index].hargaSatuan * newQty;
            localStorage.setItem('tokofariz_cart', JSON.stringify(cartItems));
            renderCart();
        }
    }
}

function cariBarang(nama) {
    window.location.href = `cek-harga.html?cari=${encodeURIComponent(nama)}`;
}
// HANDLE IMPORT FILE
function handleImportFile(input) {
    if (input.files && input.files[0]) {
        importData(input.files[0]).then(() => {
            // Refresh tampilan
            loadFilterKategori();
            tampilkanDaftarBarang();
            input.value = ''; // Reset input
        }).catch(err => {
            alert('Gagal import: ' + err);
            input.value = '';
        });
    }
}

// Tombol export
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'exportBtn') {
        exportData();
    }
});
// HANDLE IMPORT JSON
function handleImportJson(input) {
    if (input.files && input.files[0]) {
        importData(input.files[0]).then(() => {
            loadFilterKategori();
            tampilkanDaftarBarang();
            input.value = '';
        }).catch(err => {
            alert('Gagal import: ' + err);
            input.value = '';
        });
    }
}

// HANDLE IMPORT EXCEL
function handleImportExcel(input) {
    if (input.files && input.files[0]) {
        importFromExcel(input.files[0]).then(() => {
            loadFilterKategori();
            tampilkanDaftarBarang();
            input.value = '';
        }).catch(err => {
            alert('Gagal import Excel: ' + err);
            input.value = '';
        });
    }
}
// PASTIKAN FUNGSI INI ADA DI data.js

// Simpan data ke localStorage
function simpanData() {
    try {
        localStorage.setItem('tokofariz_barang', JSON.stringify(daftarBarang));
        localStorage.setItem('tokofariz_kategori', JSON.stringify(daftarKategori));
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        return false;
    }
}