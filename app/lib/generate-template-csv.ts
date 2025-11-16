import type { Category, Budget, SubCategory } from "~/models/schema";

const getOrdered = (lookup: Record<string, Budget[]>, categories: Category[]) => {

    const ordered: Budget[] = []

    for (const c of categories) {
        ordered.push(c)
        for (const s of lookup[c.id]) {
            ordered.push({ ...s, code: `${c.code}.${s.code}` })
        }
    }

    return ordered;

}

export function generateTemplateCSV(categories: Category[], subcategories: SubCategory[]) {

    const lookup: Record<string, Budget[]> = {};
    for (const s of subcategories) {
        if (!lookup[s.category_ref.id]) {
            lookup[s.category_ref.id] = []
        }
        lookup[s.category_ref.id].push(s)
    }
    const ordered: Budget[] = getOrdered(lookup, categories)

    const header = ["Kode", "Uraian", "Target", "Realisasi"]
    const rows = ordered.map(item => [item.code, item.description, "", ""])
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "template_dokumen_audit.csv"
    link.click()
    URL.revokeObjectURL(url)
}
