import { useEffect, useState, useCallback } from "react"
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch,
    query,
    QueryConstraint,
    Firestore,
    QueryFieldFilterConstraint,
    getDocs,
    setDoc,
    DocumentReference,
    type DocumentData,
    type UpdateData,
} from "firebase/firestore"
import type { DBRecord } from "~/models/schema"
import { toast } from "sonner"

interface UseCollectionOptions {
    filters?: QueryConstraint[]
}

export function useCollection<T extends DBRecord>(
    db: Firestore,
    collectionName: string,
    options: UseCollectionOptions = {}
) {
    const [data, setData] = useState<(T & { id: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const colRef = collection(db, collectionName)
        const q = options.filters?.length
            ? query(colRef, ...options.filters)
            : colRef

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as T & { id: string })
            )
            setData(docs)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [db, collectionName, JSON.stringify(options.filters)])

    // --- CRUD functions ---

    const add = useCallback(
        async (values: Omit<T, "id">, id?: string) => {
            setUpdating(true);
            try {
                if (id) {
                    // 1. Jika ID Diberikan (Manual ID):
                    // Gunakan doc() untuk membuat referensi dokumen spesifik
                    const docRef = doc(db, collectionName, id);
                    // Gunakan setDoc() untuk menulis data ke referensi dokumen tersebut
                    await setDoc(docRef, values);
                } else {
                    // 2. Jika ID Otomatis Diinginkan (No ID Provided):
                    // Dapatkan referensi koleksi
                    const colRef = collection(db, collectionName);
                    // Gunakan addDoc() untuk menambahkan dokumen baru dengan ID otomatis
                    await addDoc(colRef, values);
                }
            } finally {
                setUpdating(false);
            }
        },
        [db, collectionName]
    );

    const multiAdd = useCallback(
        async <T extends { id: string }>(values: T[], useId: boolean = false) => {
            if (!db || values.length === 0) return;
            setUpdating(true);
            try {
                const batch = writeBatch(db);

                values.forEach((val) => {
                    let newRef: DocumentReference<DocumentData, DocumentData>

                    if (useId) {
                        // 1. Jika ingin pakai ID manual:
                        // Gunakan doc() dengan 3 argumen: (db, nama_koleksi, id_dokumen_manual)
                        newRef = doc(db, collectionName, val.id);
                    } else {
                        // 2. Jika ingin ID otomatis:
                        // Ambil referensi koleksi dulu, lalu buat dokumen baru dengan ID otomatis di dalamnya
                        const colRef = collection(db, collectionName);
                        newRef = doc(colRef);
                    }

                    // Create a new object without the id property instead of deleting it from the original
                    const { id: _id, ...docData } = val as T;

                    // Gunakan set() pada referensi dokumen (newRef)
                    batch.set(newRef, docData as DocumentData);
                });

                await batch.commit();
            } finally {
                setUpdating(false);
            }
        },
        [db, collectionName]
    );

    const update = useCallback(
        async (id: string, values: Partial<T>) => {
            setUpdating(true)
            try {
                const ref = doc(db, collectionName, id) as DocumentReference<DocumentData, T>
                await updateDoc(ref, values as UpdateData<T>)
            } finally {
                setUpdating(false)
            }
        },
        [db, collectionName]
    )

    const remove = useCallback(
        async (id: string) => {
            setUpdating(true)
            try {
                const ref = doc(db, collectionName, id)
                await deleteDoc(ref)
            } finally {
                setUpdating(false)
            }
        },
        [db, collectionName]
    )

    const multiRemove = useCallback(
        async (filters: QueryFieldFilterConstraint[]) => {
            setUpdating(true)

            try {
                const colRef = collection(db, collectionName)

                // Buat query dari filters
                const q = filters.length ? query(colRef, ...filters) : colRef

                // Ambil dokumen yang akan dihapus
                const snapshot = await getDocs(q)

                if (snapshot.empty) {
                    setUpdating(false)
                    return
                }

                // Gunakan batch
                const batch = writeBatch(db)

                snapshot.forEach((docSnap) => {
                    const ref = doc(db, collectionName, docSnap.id)
                    batch.delete(ref)
                })

                await batch.commit()
            } finally {
                setUpdating(false)
            }
        },
        [db, collectionName]
    )


    const multiUpdate = useCallback(
        async (updates: { id: string; data: Partial<T> }[]) => {
            if (!db || updates.length === 0) return
            setUpdating(true)
            try {
                const batch = writeBatch(db)
                updates.forEach(({ id, data }) => {
                    const ref = doc(db, collectionName, id) as DocumentReference<DocumentData, T>
                    batch.update(ref, data as UpdateData<T>)
                })
                await batch.commit()
            } finally {
                setUpdating(false)
            }
        },
        [db, collectionName]
    )

    const getDocument = useCallback(
        (id: string) =>
            db ? doc(db, collectionName, id) : undefined,
        [db, collectionName]
    )

    const softDelete = useCallback(
        async (id: string) => await update(id, { hidden: true } as Partial<T>),
        [update]
    )

    const restore = useCallback(
        async (id: string) => {
            toast("Memulihkan data...")
            try {
                await update(id, { hidden: false } as Partial<T>)
                toast.success("Data berhasil dipulihkan")
            } catch (error) {
                toast.error("Terjadi kesalahan saat memulihkan data")
            }
        },
        [update]
    )

    return {
        data,
        loading,
        updating,
        add,
        multiAdd,
        update,
        multiRemove,
        remove,
        multiUpdate,
        getDocument,
        softDelete,
        restore
    }
}
