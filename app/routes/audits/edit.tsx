import type { ActionFunction } from "react-router"
import {
    Activity,
    Category,
    Expense,
    Program,
    SubCategory
} from "~/.server/model"
import { parseAuditCSV } from "~/.server/parse-audit-csv"
import { getSession, pass } from "~/.server/session"
import UploadAuditDialog from "~/components/upload-audit-dialog"
import type { Route } from "./+types/edit"

export const handle = {
    title: 'Ubah'
}

export const action: ActionFunction = async ({ request }) => {
    const start = performance.now();
    const session = await getSession(request.headers.get('Cookie'))
    const formData = await request.formData()

    const year = formData.get('year') as string

    await Expense.delete({ year })
    await Activity.delete({ year })
    await Program.delete({ year })

    const csv = formData.get('csv') as File
    const buffer = await csv.arrayBuffer();
    const csvText = new TextDecoder().decode(buffer); // jadikan string CSV

    const categories = await Category.query().get()
    const subcategories = await SubCategory.query().get()

    try {
        const { activities, expenses, programs } = parseAuditCSV(csvText, Number(year), categories, subcategories)
        await Program.insert(programs)
        await Activity.insert(activities)
        await Expense.insert(expenses)

        const end = performance.now();
        const duration = end - start;

        console.log(`[UJI KINERJA] Waktu Total Proses Bun: ${duration.toFixed(2)} ms`);

        return await pass(session, '/audits', "Dokumen berhasil diunggah")
    } catch (err: any) {
        return { error: err?.message || "Terjadi kesalahan" }
    }
}

export default ({ params: { id } }: Route.ComponentProps) => {
    return <UploadAuditDialog year={Number(id)} />
}