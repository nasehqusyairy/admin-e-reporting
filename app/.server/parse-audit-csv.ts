import type {
    IAudit,
    IProgram,
    IActivity,
    IExpense,
    ICategory,
    ISubCategory
} from "~/models/schema"
import { localeToNumber } from "~/lib/locale-to-number"

export type ParsedAuditData = {
    audit: IAudit
    programs: IProgram[]
    activities: IActivity[]
    expenses: IExpense[]
}

export function parseAuditCSV(
    text: string,
    year: number,
    categories: ICategory[],
    subcategories: ISubCategory[],
): ParsedAuditData {

    const lines = text.trim().split(/\r?\n/)
    const [_, ...dataLines] = lines

    const audit: IAudit = {
        hidden: false,
        year,
    }

    const programs: IProgram[] = []
    const activities: IActivity[] = []
    const expenses: IExpense[] = []

    const existingCode: Record<string, boolean> = {}

    for (const line of dataLines) {
        if (!line.trim()) continue

        const cells = line.split(";").map(c => c.trim().replace(/^"|"$/g, ""))
        const [code, description, targetStr, realizationStr] = cells

        if (!code || !description) continue

        if (existingCode[code]) throw new Error(`Kode duplikat dalam CSV: ${code}`)
        existingCode[code] = true

        // Abaikan level 1-2
        if (/^\d+(\.\d+)?$/.test(code)) continue

        // ========================
        // PROGRAM (level 3)
        // ========================
        if (/^\d+\.\d+\.\d+$/.test(code)) {
            const [catDigit, subDigit] = code.split(".")

            const cat = categories.find(c => c.id === catDigit)
            if (!cat) throw new Error(`Kategori tidak ditemukan untuk kode program: ${code}`)

            const sub = subcategories.find(s => s.id === `${catDigit}.${subDigit}` && s.category_id === cat.id)
            if (!sub) {
                throw new Error(`Subkategori tidak ditemukan untuk kode program: ${code}`)
            }

            programs.push({
                id: crypto.randomUUID(),
                code,
                description,
                year,
                subcategory_id: sub.id
            } as IProgram)
        }

        // ========================
        // ACTIVITY (level 4)
        // ========================
        else if (/^\d+\.\d+\.\d+\.\d+$/.test(code)) {
            const parentCode = code.split(".").slice(0, 3).join(".")
            const parent = programs.find(p => p.code === parentCode)

            if (!parent) throw new Error(`Program induk tidak ditemukan untuk activity: ${code}`)

            activities.push({
                id: crypto.randomUUID(),
                code,
                description,
                year,
                program_id: parent.id
            } as IActivity)
        }

        // ========================
        // EXPENSE (level 5)
        // ========================
        else if (/^\d+\.\d+\.\d+\.\d+\.\d+$/.test(code)) {
            const parentCode = code.split(".").slice(0, 4).join(".")
            const parent = activities.find(a => a.code === parentCode)

            if (!parent) throw new Error(`Activity induk tidak ditemukan untuk expense: ${code}`)

            let target = 0
            let realization = 0

            try {
                target = localeToNumber(targetStr)
                realization = localeToNumber(realizationStr)
            } catch {
                throw new Error(`Nilai numerik tidak valid pada kode ${code}`)
            }

            expenses.push({
                id: crypto.randomUUID(),
                code,
                description,
                target,
                realization,
                year,
                activity_id: parent.id,
            } as IExpense)
        }

        // ========================
        // Invalid format
        // ========================
        else {
            throw new Error(`Format kode tidak valid: ${code}`)
        }
    }

    return { audit, programs, activities, expenses }
}
