import {
    collection,
    getDocs,
    query,
    where,
    Firestore
} from "firebase/firestore"
import type { Category, SubCategory, Program, Activity, Expense } from "~/models/schema"


export async function exportAudit(db: Firestore, year: number) {

    // --- 1. Ambil semua data dari Firestore ---
    const [categoriesSnap, subcategoriesSnap, programsSnap, activitiesSnap, expensesSnap] =
        await Promise.all([
            getDocs(collection(db, "categories")),
            getDocs(collection(db, "subcategories")),
            getDocs(query(collection(db, "programs"), where("year", "==", year))),
            getDocs(query(collection(db, "activities"), where("year", "==", year))),
            getDocs(query(collection(db, "expenses"), where("year", "==", year))),
        ])

    const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Category[]
    const subcategories = subcategoriesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SubCategory[]
    const programs = programsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Program[]
    const activities = activitiesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Activity[]
    const expenses = expensesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Expense[]


    // --- 2. Buat struktur relasi untuk navigasi cepat ---

    const subcategoriesByCategory: Record<string, SubCategory[]> = {}
    const programsBySubCategory: Record<string, Program[]> = {}
    const activitiesByProgram: Record<string, Activity[]> = {}
    const expensesByActivity: Record<string, Expense[]> = {}

    subcategories.forEach(sc => {
        const categoryId = sc.category_ref?.id
        if (!categoryId) return
        if (!subcategoriesByCategory[categoryId]) subcategoriesByCategory[categoryId] = []
        subcategoriesByCategory[categoryId].push(sc)
    })

    programs.forEach(p => {
        const subId = p.subcategory_ref?.id
        if (!subId) return
        if (!programsBySubCategory[subId]) programsBySubCategory[subId] = []
        programsBySubCategory[subId].push(p)
    })

    activities.forEach(a => {
        const pId = a.program_ref?.id
        if (!pId) return
        if (!activitiesByProgram[pId]) activitiesByProgram[pId] = []
        activitiesByProgram[pId].push(a)
    })

    expenses.forEach(e => {
        const aId = e.activity_ref?.id
        if (!aId) return
        if (!expensesByActivity[aId]) expensesByActivity[aId] = []
        expensesByActivity[aId].push(e)
    })

    // --- 3. Build CSV rows secara HIRARKIS ---

    const rows: string[] = []
    rows.push(`Kode;Uraian;Target;Realisasi`)

    for (const cat of categories) {
        // Category (Level 1)
        rows.push(`${cat.code};${cat.description};;`)

        const subs = subcategoriesByCategory[cat.id] || []
        for (const sub of subs) {
            // Subcategory (Level 2)
            rows.push(`${cat.code}.${sub.code};${sub.description};;`)

            const progs = programsBySubCategory[sub.id] || []
            for (const prog of progs) {
                // Program (Level 3)
                rows.push(`${prog.code};${prog.description};;`)

                const acts = activitiesByProgram[prog.id] || []
                for (const act of acts) {
                    // Activity (Level 4)
                    rows.push(`${act.code};${act.description};;`)

                    const exps = expensesByActivity[act.id] || []
                    for (const exp of exps) {
                        // Expense (Level 5)
                        rows.push(
                            `${exp.code};${exp.description};${exp.target ?? ""};${exp.realization ?? ""}`
                        )
                    }
                }
            }
        }
    }

    const csv = rows.join("\n")

    // --- 4. Simpan sebagai file CSV ---
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Laporan Belanja ${year}.csv`
    link.click()
}
