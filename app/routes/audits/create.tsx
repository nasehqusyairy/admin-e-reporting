import type { ActionFunction } from "react-router"
import {
    Activity,
    Audit,
    Category,
    Expense,
    Program,
    SubCategory
} from "~/.server/model"
import { parseAuditCSV } from "~/.server/parse-audit-csv"
import { getSession, pass } from "~/.server/session"
import UploadAuditDialog from "~/components/upload-audit-dialog"

export const handle = {
    title: 'Tambah'
}

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie'))
    const formData = await request.formData()

    const year = formData.get('year') as string

    const csv = formData.get('csv') as File
    const buffer = await csv.arrayBuffer();
    const csvText = new TextDecoder().decode(buffer); // jadikan string CSV

    const categories = await Category.query().get()
    const subcategories = await SubCategory.query().get()

    try {
        const { activities, audit, expenses, programs } = parseAuditCSV(csvText, Number(year), categories, subcategories)
        await Audit.create(audit)
        await Program.insert(programs)
        await Activity.insert(activities)
        await Expense.insert(expenses)

        return await pass(session, '/audits', "Dokumen berhasil diunggah")
    } catch (err: any) {
        return { error: err?.message || "Terjadi kesalahan" }
    }
}

export default () => {
    return <UploadAuditDialog />
}