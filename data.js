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
let unsubscribe = null;

// LISTENER REAL-TIME
function subscribeToRealtimeUpdates(callback) {
    if (unsubscribe) unsubscribe();
    
    const barangRef = collection(db, "barang");
    
    unsubscribe = onSnapshot(barangRef, (snapshot) => {
        daftarBarang = [];
        snapshot.forEach((doc) => {
            daftarBarang.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`📦 Data real-time: ${daftarBarang.length} barang`);
        window.daftarBarang = daftarBarang;
        
        if (callback) callback(daftarBarang);
        
    }, (error) => {
        console.error("❌ Listener error:", error);
    });
}

// LOAD DATA
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

// TAMBAH BARANG
async function tambahBarang(barang) {
    try {
        const { id, ...dataWithoutId } = barang;
        const docRef = await addDoc(collection(db, "barang"), dataWithoutId);
        console.log(`✅ Barang ditambahkan dengan ID: ${docRef.id}`);
        return true;
    } catch (error) {
        console.error("❌ Error adding:", error);
        return false;
    }
}

// UPDATE BARANG
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

// HAPUS BARANG
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

// BACKUP JSON
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

// LOAD AWAL
loadData();

// EXPORT KE WINDOW
window.daftarBarang = daftarBarang;
window.daftarKategori = daftarKategori;
window.tambahBarang = tambahBarang;
window.updateBarang = updateBarang;
window.hapusBarang = hapusBarang;
window.exportData = exportData;
window.subscribeToRealtimeUpdates = subscribeToRealtimeUpdates;