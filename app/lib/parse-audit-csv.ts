import type { Audit, Program, Activity, Expense, Category, SubCategory } from "~/models/schema"
import type { DocumentReference, DocumentData } from "firebase/firestore"
import { localeToNumber } from "./locale-to-number"

export interface ParsedAuditData {
    audit: Audit
    programs: Program[]
    activities: Activity[]
    expenses: Expense[]
}

export function parseAuditCSV(
    text: string,
    year: number,
    categories: Category[],
    subcategories: SubCategory[],
    getDocRef: (collection: string, id: string) => DocumentReference<DocumentData, DocumentData>
): ParsedAuditData {

    const lines = text.trim().split(/\r?\n/)
    const [_, ...dataLines] = lines

    const audit: Audit = {
        id: crypto.randomUUID(),
        hidden: false,
        year
    }

    const programs: Program[] = []
    const activities: Activity[] = []
    const expenses: Expense[] = []

    const existingCode: Record<string, boolean> = {}

    for (const line of dataLines) {
        if (!line.trim()) continue

        const cells = line.split(";").map(c => c.trim().replace(/^"|"$/g, ""))
        const [code, description, targetStr, realizationStr] = cells

        if (!code || !description) continue

        // Duplikasi kode
        if (existingCode[code]) throw new Error(`Kode duplikat ditemukan dalam CSV: ${code}`)

        existingCode[code] = true

        if (/^\d+(\.\d+)?$/.test(code)) continue

        // Level 3 = Program
        if (/^\d+\.\d+\.\d+$/.test(code)) {
            const splitedCode = code.split('.')
            const subCodeDigit = splitedCode[1]
            const catDigit = splitedCode[0]
            const cat = categories.find(cat => cat.code === catDigit)
            if (!cat) {
                throw new Error(`Kategori tidak ditemukan untuk kode program: ${code}`)
            }

            const sub = subcategories.find(s => s.code === subCodeDigit && s.category_ref.id === cat.id)
            if (!sub) {
                throw new Error(`Subkategori tidak ditemukan untuk kode program: ${code}`)
            }

            programs.push({
                hidden: false,
                id: crypto.randomUUID(),
                code,
                description,
                year,
                subcategory_ref: getDocRef("subcategories", sub.id),
                audit_ref: getDocRef("audits", audit.id)
            })
        }

        // Level 4 = Activity
        else if (/^\d+\.\d+\.\d+\.\d+$/.test(code)) {
            const parentCode = code.split(".").slice(0, 3).join(".")
            const parent = programs.find(p => p.code === parentCode)

            if (!parent) {
                throw new Error(`Program induk tidak ditemukan untuk activity: ${code}`)
            }

            activities.push({
                hidden: false,
                id: crypto.randomUUID(),
                code,
                description,
                year,
                program_ref: getDocRef("programs", parent.id),
            })
        }

        // Level 5 = Expense
        else if (/^\d+\.\d+\.\d+\.\d+\.\d+$/.test(code)) {
            const parentCode = code.split(".").slice(0, 4).join(".")
            const parent = activities.find(a => a.code === parentCode)

            // Parsing angka
            let target = 0
            let realization = 0
            try {
                target = localeToNumber(targetStr)
                realization = localeToNumber(realizationStr)
                if (Number.isNaN(target) || Number.isNaN(realization)) {
                    throw new Error()
                }
            } catch {
                throw new Error(`Nilai numerik tidak valid pada kode ${code}`)
            }

            if (!parent) {
                throw new Error(`Aktivitas induk tidak ditemukan untuk expense: ${code}`)
            }

            expenses.push({
                hidden: false,
                id: crypto.randomUUID(),
                code,
                description,
                target,
                realization,
                year,
                activity_ref: getDocRef("activities", parent.id),
            })
        }

        else {
            throw new Error(`Format kode tidak valid: ${code}`)
        }
    }

    return { audit, programs, activities, expenses }
}

