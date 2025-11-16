import {
    collection,
    Firestore,
    getDocs,
    query,
    QueryConstraint // Tipe untuk where, orderBy, dll.
} from "firebase/firestore";

/**
 * Mengambil semua data dari koleksi dengan opsi query tambahan (seperti where atau orderBy).
 * @param db Instance Firestore.
 * @param collectionName Nama koleksi.
 * @param constraints Array opsional dari QueryConstraint (e.g., [where("field", "==", value), orderBy("field")]).
 * @returns Promise yang berisi array data dengan ID dokumen.
 */
export async function getAll<T>(
    db: Firestore,
    collectionName: string,
    constraints: QueryConstraint[] = [] // Parameter opsional
): Promise<(T & { id: string })[]> { // Menambahkan id ke tipe kembalian
    const colRef = collection(db, collectionName);

    // Membuat query baru yang menggabungkan referensi koleksi dan batasan query
    const q = query(colRef, ...constraints);

    const snap = await getDocs(q);

    // Menggunakan .map() pada snap.docs untuk mengonversi snapshot menjadi array data
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as (T & { id: string })[];
}
