import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table"
import { Download, Plus, Upload, X } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import VisibilityTab from "~/components/visibility-tab"
import { toast } from "sonner";
import { Link, Outlet, useFetcher, useOutlet, type LoaderFunction } from "react-router";
import DeleteAlert from "~/components/delete-alert";
import AuditSearchForm from "~/components/audit-search-form";
import type { IAudit } from "~/models/schema"
import type { Route } from "./+types/available"
import { Audit } from "~/.server/model"

export const handle = {
  title: "Tersedia"
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || ''

  const res = {
    audits: [] as IAudit[]
  }

  if (url.pathname === '/audits') {
    const query = await Audit.query()
      .where({ hidden: false })
      .where('year', 'LIKE', `%${q}%`)
      .orderBy('year', 'DESC')
      .get()
    res.audits = query
  }

  return res
}

export default ({ loaderData: { audits } }: Route.ComponentProps) => {
  const [idToDelete, setIdToDelete] = useState<string>();

  const fetcher = useFetcher()
  const updating = fetcher.state !== "idle"

  const outlet = useOutlet()

  const onDelete = async () => {
    await fetcher.submit({ id: idToDelete! }, { method: "DELETE", action: '/audits/remove' })
    setIdToDelete(undefined)
    toast.success("Data berhasil dihapus")
  }

  return (
    <>
      <DeleteAlert
        onDelete={onDelete}
        open={idToDelete !== undefined}
        isDeleting={updating}
        onClose={() => setIdToDelete(undefined)}
      />
      <div className="mx-auto container">
        <div className="flex gap-2 mb-4">
          <Button asChild>
            <Link to={'/audits/create'}>
              <Plus /> Dokumen
            </Link>
          </Button>
          <Button asChild variant={"secondary"}>
            <a href={'/audits/template'}>
              <Download /> Template
            </a>
          </Button>
        </div>
        <Card>
          <CardContent>
            <VisibilityTab path="/audits" />
            <div className="mb-4">
              <AuditSearchForm />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlet ? <Outlet />
                  : !audits.length ?
                    <TableRow className="bg-secondary text-center">
                      <TableCell colSpan={3}>
                        {updating ? "Memperbarui..." : "Data Kosong"}
                      </TableCell>
                    </TableRow>
                    : audits.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <a href={`/audits/export/?year=${item.year}`} className="text-primary underline">
                            Laporan Belanja {item.year}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size={"icon"} variant={"outline"} asChild>
                              <Link to={`/audits/${item.year}`}>
                                <Upload />
                              </Link>
                            </Button>
                            <Button size={"icon"} variant={"destructive"} onClick={() => setIdToDelete(item.year)}>
                              <X />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
