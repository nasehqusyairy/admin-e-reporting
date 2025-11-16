import { Recycle } from "lucide-react"
import { useOutletContext } from "react-router"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"
import type { SubCategory } from "~/models/schema"

export const handle = {
    title: "Dihapus"
}

type SubCategoryRouteContext = {
    hidden: SubCategory[]
    updating: boolean
    loading: boolean
    update: (id: string, data: object) => Promise<void>
    q: string
    cat: string
}

export default () => {

    const { hidden, updating, loading, update, q, cat } = useOutletContext() as SubCategoryRouteContext

    const restore = async (id: string) => {
        await update(id, { hidden: false })
        toast.success("Data berhasil dipulihkan")
    }

    const filtered = hidden.filter(el => cat && cat !== "all" ? el.category!.id === cat : true).filter(el => el.description.toLowerCase().includes(q.toLowerCase()))

    return (
        <>
            {filtered?.length > 0 ? filtered.map((el, index) => (
                <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{el.description}</TableCell>
                    <TableCell>{el.category?.description}</TableCell>
                    <TableCell>
                        <Button size={"icon"} onClick={() => restore(el.id)}><Recycle /></Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="bg-secondary text-center">
                        {loading ? "Memuat..." : updating ? "Memperbarui..." : "Data Kosong"}
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}