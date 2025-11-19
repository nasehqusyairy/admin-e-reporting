import { Recycle } from "lucide-react"
import { useFetcher, useOutletContext, type ActionFunction } from "react-router"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"
import type { Route } from "./+types"
import { Category } from "~/.server/model"

export const handle = {
    title: "Dihapus"
}

type CategoryRouteContext = {
    q: string
}

export const loader = async () => {
    return {
        categories: await Category.query().where({ hidden: true }).get()
    }
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    await Category.update(id, { hidden: false });
}

export default ({ loaderData, actionData }: Route.ComponentProps) => {
    const { categories } = loaderData

    const { q } = useOutletContext() as CategoryRouteContext

    const fetcher = useFetcher()
    const updating = fetcher.state !== "idle"

    const restore = async (id: string) => {
        fetcher.submit({ id }, { method: "post" })
        toast.success("Data berhasil dipulihkan")
    }

    const filtered = categories.filter(el => el.description.toLowerCase().includes(q.toLowerCase()))

    return (
        <>
            {filtered?.length > 0 ? filtered.map((el, index) => (
                <TableRow key={index}>
                    <TableCell>{el.code}</TableCell>
                    <TableCell>{el.description}</TableCell>
                    <TableCell>
                        <Button size={"icon"} onClick={() => restore(el.id)}><Recycle /></Button>
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