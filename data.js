import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    deleteDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1RjaNYCuefTwpYHaivvrNJG9z6DiuB7M",
    authDomain: "tokofarizcell-8d6c7.firebaseapp.com",
    projectId: "tokofarizcell-8d6c7",
    storageBucket: "tokofarizcell-8d6c7.firebasestorage.app",
    messagingSenderId: "496248842703",
    appId: "1:496248842703:web:307adfb557eb8ee36c8aba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("🔥 Firebase berhasil terkoneksi!");

let daftarBarang = [];
let daftarKategori = ["Sembako", "Makanan", "Frozen Food", "Rokok", "RT", "Lainnya"];
let listeners = [];

// ========== LISTENER REAL-TIME ==========
function subscribeToBarang(callback) {
    listeners.push(callback);
    
    // Kalau ini pertama kali, setup listener Firebase
    if (listeners.length === 1) {
        const barangRef = collection(db, "barang");
        
        onSnapshot(barangRef, (snapshot) => {
            daftarBarang = [];
            snapshot.forEach((doc) => {
                daftarBarang.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📦 Data update: ${daftarBarang.length} barang`);
            window.daftarBarang = daftarBarang;
            
            // Panggil semua callback
            listeners.forEach(cb => cb(daftarBarang));
        });
    }
    
    // Return fungsi untuk unsubscribe
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ========== LOAD DATA (ONE TIME) ==========
async function loadData() {
    try {
        const querySnapshot = await getDocs(collection(db, "barang"));
        daftarBarang = [];
        querySnapshot.forEach((doc) => {
            daftarBarang.push({ id: doc.id, ...doc.data() });
        });
        
        window.daftarBarang = daftarBarang;
        console.log(`✅ Data loaded: ${daftarBarang.length} barang`);
        return daftarBarang;
    } catch (error) {
        console.error("❌ Error loading data:", error);
        return [];
    }
}

// ========== TAMBAH BARANG ==========
async function tambahBarang(barang) {
    try {
        const { id, ...dataWithoutId } = barang;
        const docRef = await addDoc(collection(db, "barang"), dataWithoutId);
        console.log(`✅ Barang ditambahkan dengan ID: ${docRef.id}`);
        
        // Data otomatis masuk lewat onSnapshot, gak perlu load ulang
        return true;
    } catch (error) {
        console.error("❌ Error adding:", error);
        return false;
    }
}

// ========== UPDATE BARANG ==========
async function updateBarang(id, data) {
    try {
        await updateDoc(doc(db, "barang", id), data);
        console.log(`✅ Barang diupdate: ${id}`);
        return true;
    } catch (error) {
        console.error("❌ Error updating:", error);
        return false;
    }
}

// ========== HAPUS BARANG ==========
async function hapusBarang(id) {
    try {
        await deleteDoc(doc(db, "barang", id));
        console.log(`✅ Barang dihapus: ${id}`);
        return true;
    } catch (error) {
        console.error("❌ Error deleting:", error);
        return false;
    }
}

// ========== BACKUP JSON ==========
function exportData() {
    try {
        const dataExport = {
            barang: daftarBarang,
            kategori: daftarKategori,
            tanggalExport: new Date().toISOString()
        };
        
        const jsonString = JSON.stringify(dataExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tokofariz_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        
        alert(`✅ Backup ${daftarBarang.length} barang berhasil!`);
        return true;
    } catch (e) {
        console.error("❌ Export error:", e);
        return false;
    }
}

// ========== EXPORT KE EXCEL ==========
function exportToExcel() {
    try {
        if (daftarBarang.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }
        
        let csv = 'Nama Barang,Kategori,Agen,Tanggal,Satuan Beli,Jumlah,Isi Kemasan,Satuan Isi,Harga Modal,Catatan\n';
        
        daftarBarang.forEach(barang => {
            const row = [
                `"${barang.nama || ''}"`,
                `"${barang.kategori || ''}"`,
                `"${barang.agen || ''}"`,
                barang.tanggal || '',
                barang.satuanBeli || '',
                barang.jumlahAngka || '',
                barang.isiAngka || '',
                barang.isiSatuan || '',
                barang.modal || '',
                `"${(barang.catatan || '').replace(/"/g, '""')}"`
            ].join(',');
            csv += row + '\n';
        });
        
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tokofariz_data_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        
        alert(`✅ Export Excel berhasil! ${daftarBarang.length} barang.`);
        return true;
    } catch (e) {
        console.error("❌ Export error:", e);
        return false;
    }
}

// ========== IMPORT DATA ==========
async function importData(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData.barang || !Array.isArray(importedData.barang)) {
                        throw new Error('Format file tidak valid');
                    }
                    
                    const pesan = `⚠️ Import ${importedData.barang.length} barang?\nData akan DITAMBAHKAN.`;
                    
                    if (!confirm(pesan)) {
                        reject('Import dibatalkan');
                        return;
                    }
                    
                    let berhasil = 0;
                    for (const barang of importedData.barang) {
                        try {
                            const { id, ...dataWithoutId } = barang;
                            await addDoc(collection(db, "barang"), dataWithoutId);
                            berhasil++;
                        } catch (err) {
                            console.error('Gagal import:', err);
                        }
                    }
                    
                    alert(`✅ Import selesai! ${berhasil} barang ditambahkan.`);
                    resolve(true);
                } catch (err) {
                    reject('Error parsing file: ' + err.message);
                }
            };
            
            reader.onerror = function() {
                reject('Error membaca file');
            };
            
            reader.readAsText(file);
        } catch (e) {
            reject('Error: ' + e.message);
        }
    });
}

// ========== IMPORT EXCEL ==========
async function importFromExcel(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const csvText = e.target.result;
                    const lines = csvText.split('\n');
                    
                    if (lines.length < 2) throw new Error('File kosong');
                    
                    const barangBaru = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        
                        let inQuote = false;
                        let currentValue = '';
                        const values = [];
                        
                        for (let char of line) {
                            if (char === '"' && !inQuote) {
                                inQuote = true;
                            } else if (char === '"' && inQuote) {
                                inQuote = false;
                            } else if (char === ',' && !inQuote) {
                                values.push(currentValue);
                                currentValue = '';
                            } else {
                                currentValue += char;
                            }
                        }
                        values.push(currentValue);
                        
                        if (values.length >= 9) {
                            const modal = parseFloat(values[8]) || 0;
                            const jumlahAngka = parseFloat(values[5]) || 1;
                            const isiAngka = parseFloat(values[6]) || 1;
                            const totalUnit = jumlahAngka * isiAngka;
                            
                            const barang = {
                                nama: values[0].replace(/"/g, '') || 'Tanpa Nama',
                                kategori: values[1].replace(/"/g, '') || 'Lainnya',
                                agen: values[2].replace(/"/g, '') || '-',
                                tanggal: values[3] || new Date().toISOString().split('T')[0],
                                satuanBeli: values[4] || 'Pcs',
                                jumlahAngka: jumlahAngka,
                                isiAngka: isiAngka,
                                isiSatuan: values[7] || 'pcs',
                                modal: modal,
                                totalUnit: totalUnit,
                                catatan: values[9] ? values[9].replace(/"/g, '') : `${jumlahAngka} ${values[4]} @ ${isiAngka} ${values[7]}`
                            };
                            
                            barangBaru.push(barang);
                        }
                    }
                    
                    if (barangBaru.length === 0) throw new Error('Tidak ada data valid');
                    
                    if (!confirm(`Import ${barangBaru.length} barang?`)) {
                        reject('Dibatalkan');
                        return;
                    }
                    
                    let berhasil = 0;
                    for (const barang of barangBaru) {
                        try {
                            await addDoc(collection(db, "barang"), barang);
                            berhasil++;
                        } catch (err) {}
                    }
                    
                    alert(`✅ Import selesai! ${berhasil} barang ditambahkan.`);
                    resolve(true);
                } catch (err) {
                    reject(err.message);
                }
            };
            
            reader.onerror = () => reject('Error membaca file');
            reader.readAsText(file, 'UTF-8');
        } catch (e) {
            reject(e.message);
        }
    });
}

// ========== LOAD AWAL ==========
loadData();

// ========== EXPORT KE WINDOW ==========
window.daftarBarang = daftarBarang;
window.daftarKategori = daftarKategori;
window.tambahBarang = tambahBarang;
window.updateBarang = updateBarang;
window.hapusBarang = hapusBarang;
window.exportData = exportData;
window.exportToExcel = exportToExcel;
window.importData = importData;
window.importFromExcel = importFromExcel;
window.subscribeToBarang = subscribeToBarang;
