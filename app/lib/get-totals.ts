import {
    collection,
    query,
    where,
    getCountFromServer,
    type Firestore,
} from 'firebase/firestore';

export type Totals = {
    audits: number
    categories: number
    subcategories: number
}

/**
 * Mengambil jumlah dokumen yang tidak tersembunyi (hidden == false) dari beberapa koleksi.
 * @param db Instance Firestore dari aplikasi Firebase Anda.
 * @returns Promise yang berisi objek dengan jumlah dokumen untuk setiap koleksi.
 */
export async function getTotals(db: Firestore): Promise<Totals> {
    // Daftar nama koleksi yang ingin Anda hitung
    const collectionNames: string[] = [
        'audits',
        'categories',
        'subcategories',
    ];

    // Buat array dari semua Promise kueri agregasi
    const countPromises = collectionNames.map(async (collectionName) => {
        const collRef = collection(db, collectionName);

        // Kueri: Cari dokumen di mana 'hidden' secara eksplisit false.
        // PENTING: Kueri ini akan MENGABAIKAN dokumen yang TIDAK memiliki field 'hidden'.
        const q = query(collRef, where('hidden', '!=', true));

        try {
            const snapshot = await getCountFromServer(q);
            // getCountFromServer().data().count mengembalikan number
            return { name: collectionName, count: snapshot.data().count };
        } catch (error) {
            console.error(`Error counting documents in ${collectionName}:`, error);
            return { name: collectionName, count: 0 }; // Kembalikan 0 jika terjadi kesalahan
        }
    });

    // Tunggu hingga semua kueri selesai secara paralel
    const results = await Promise.all(countPromises);

    // Format hasil ke dalam objek tunggal untuk kemudahan penggunaan
    const dashboardData: Totals = {
        audits: 0,
        categories: 0,
        subcategories: 0
    };
    results.forEach((item) => {
        dashboardData[item.name] = item.count;
    });

    return dashboardData;
}