import { Recycle } from "lucide-react"
import { useFetcher, type ActionFunction, type LoaderFunction } from "react-router"
import { Audit } from "~/.server/model"
import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"
import type { Route } from "./+types/removed"
import { toast } from "sonner"

export const handle = {
    title: "Dihapus"
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get("q") || ""
    return {
        audits: await Audit.query().where({ hidden: true }).where('year', 'LIKE', `%${q}%`).get()
    }
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    await Audit.update(id, { hidden: false });
}

export default ({ loaderData: { audits } }: Route.ComponentProps) => {

    const fetcher = useFetcher()
    const updating = fetcher.state !== "idle"

    const restore = async (id: string) => {
        fetcher.submit({ id }, { method: "post" })
        toast.success("Data berhasil dipulihkan")
    }

    return (
        <>
            {audits?.length > 0 ? audits.map((el, index) => (
                <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>Laporan Belanja Tahun {el.year}</TableCell>
                    <TableCell>
                        <Button size={"icon"} onClick={() => restore(el.year)}><Recycle /></Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={3} className="bg-secondary text-center">
                        {updating ? "Memperbarui..." : "Data Kosong"}
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}