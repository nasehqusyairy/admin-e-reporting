import { Recycle } from "lucide-react"
import { useOutletContext } from "react-router"
import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"
import type { Audit } from "~/models/schema"

export const handle = {
    title: "Dihapus"
}

type AuditRouteContext = {
    hidden: Audit[]
    updating: boolean
    loading: boolean
    restore: (id: string) => Promise<void>
    q: string
}

export default () => {

    const { hidden, updating, loading, restore, q } = useOutletContext() as AuditRouteContext

    const filtered = hidden.filter(el => el.year.toString().includes(q))

    return (
        <>
            {filtered?.length > 0 ? filtered.map((el, index) => (
                <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>Laporan Belanja Tahun {el.year}</TableCell>
                    <TableCell>
                        <Button size={"icon"} onClick={() => restore(el.id)}><Recycle /></Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={3} className="bg-secondary text-center">
                        {loading ? "Memuat..." : updating ? "Memperbarui..." : "Data Kosong"}
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}