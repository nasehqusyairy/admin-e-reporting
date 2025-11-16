import { useState } from "react"
import { navLinks } from "~/models/nav-links";
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table"
import { Plus, Upload, X } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import UploadAuditDialog from "~/components/upload-audit-dialog"
import { useCollection } from "~/hooks/use-collection"
import type { Audit } from "~/models/schema"
import DownloadTemplateButton from "~/components/download-template-button"
import VisibilityTab from "~/components/visibility-tab"
import { exportAudit } from "~/lib/export-audit";
import { toast } from "sonner";
import type { Firestore } from "firebase/firestore";
import { Outlet, useOutlet, useSearchParams } from "react-router";
import { separateHidden } from "~/lib/separate-hidden";
import DeleteAlert from "~/components/delete-alert";
import AuditSearchForm from "~/components/audit-search-form";
import { useFirebase } from "~/components/providers/firebase";

export const handle = {
  title: navLinks.find(el => el.url === '/audits')!.name
}

export default () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ""

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [year, setYear] = useState<number>();
  const [idToDelete, setIdToDelete] = useState<string>();

  const { db } = useFirebase()
  const { data, loading, updating, softDelete, restore } = useCollection<Audit>(db, 'audits')
  const { available, hidden } = separateHidden(data)

  const outlet = useOutlet()

  const onExport = (db: Firestore, year: number) => {
    toast.promise(
      () => exportAudit(db, year),
      {
        loading: `Mengunduh Laporan Belanja ${year}...`,
        success: () => `Laporan Belanja ${year} berhasil diunduh`,
        error: "Terjadi kesalahan",
      }
    )
  }

  const onDelete = async () => {
    try {
      await softDelete(idToDelete!)
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIdToDelete(undefined)
    }
  }

  const filtered = available.filter(el => el.year.toString().includes(q))

  return (
    <>
      <UploadAuditDialog
        db={db}
        open={isDialogOpen}
        year={year}
        onClose={() => { setYear(undefined); setIsDialogOpen(false) }}
      />

      <DeleteAlert onDelete={onDelete} open={idToDelete !== undefined} isDeleting={updating} onClose={() => setIdToDelete(undefined)} />
      <div className="mx-auto container">
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus /> Dokumen
          </Button>
          <DownloadTemplateButton db={db} />
        </div>
        <Card>
          <CardContent>
            <VisibilityTab path="/audits" />
            <div className="mb-4">
              <AuditSearchForm q={q} searchParams={searchParams} setSearchParams={setSearchParams} />
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
                {outlet ? <Outlet context={{ hidden, loading, updating, restore, q }} />
                  : !filtered.length ?
                    <TableRow className="bg-secondary text-center">
                      <TableCell colSpan={3}>
                        {loading ? "Memuat..." : updating ? "Memperbarui..." : "Data Kosong"}
                      </TableCell>
                    </TableRow>
                    : filtered.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Button variant={"link"} onClick={() => onExport(db, item.year)}>
                            Laporan Belanja {item.year}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size={"icon"} variant={"outline"} onClick={() => { setIsDialogOpen(true); setYear(item.year) }}>
                              <Upload />
                            </Button>
                            <Button size={"icon"} variant={"destructive"} onClick={() => setIdToDelete(item.id)}>
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
