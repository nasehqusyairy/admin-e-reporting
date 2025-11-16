import { useState } from "react";
import { Outlet, useOutlet, useSearchParams } from "react-router";
import { navLinks } from "~/models/nav-links";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, X } from "lucide-react";
import VisibilityTab from "~/components/visibility-tab";
import DeleteAlert from "~/components/delete-alert";
import { useCollection } from "~/hooks/use-collection";
import CategoryDialog from "~/components/category-dialog";
import CategorySearchForm from "~/components/category-search-form";
import type { Category } from "~/models/schema";
import { separateHidden } from "~/lib/separate-hidden";
import { toast } from "sonner";
import { useFirebase } from "~/components/providers/firebase";

export const handle = {
  title: navLinks.find(el => el.url === '/categories')!.name
}

export default () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ""

  const outlet = useOutlet()
  const { db } = useFirebase()
  const collection = useCollection<Category>(db, 'categories')
  const { data, loading, updating, update, add, softDelete } = collection

  const { available, hidden } = separateHidden(data)

  const [idToDelete, setIdToDelete] = useState<string>();
  const [idToEdit, setIdToEdit] = useState<string>();

  const onDelete = async () => {
    await softDelete(idToDelete!)
    setIdToDelete(undefined)
    toast.success("Data berhasil dihapus")
  }

  const onSubmit = async (code: string, description: string, idToEdit?: string) => {

    const sameCode = data.find(el => el.code === code)

    if (idToEdit) {
      if (sameCode && sameCode.id !== idToEdit) {
        return toast.error("Kode sudah dipakai")
      }
      await update(idToEdit, { description, code })
    } else {
      if (sameCode) {
        return toast.error("Kode sudah dipakai")
      }
      await add({ description, code, hidden: false })
    }
    setIdToEdit(undefined)
    toast(`Data berhasil ${idToEdit ? "diperbarui" : "ditambahkan"}`)
  }

  const filtered = available.filter(el => el.description.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      {/* dialogs */}
      <DeleteAlert
        open={idToDelete !== undefined}
        isDeleting={updating}
        onDelete={onDelete}
        onClose={() => setIdToDelete(undefined)}
      />
      <CategoryDialog
        categories={available}
        onClose={() => { setIdToEdit(undefined) }}
        idToEdit={idToEdit}
        onsubmit={onSubmit}
        updating={updating}
      />

      {/* main content */}
      <div className="mx-auto container">
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setIdToEdit("")}><Plus />Kategori</Button>
        </div>
        <Card>
          <CardContent>
            <VisibilityTab path="/categories" />
            <CategorySearchForm
              q={q}
              searchParams={searchParams}
              setSearchParams={setSearchParams} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlet ? <Outlet context={{ ...collection, q, hidden }} /> :
                  !filtered.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="bg-secondary text-center">
                        {loading ? "Memuat..." : updating ? "Memperbarui..." : "Data kosong"}
                      </TableCell>
                    </TableRow>
                  ) :
                    filtered.map((el, index) => (
                      <TableRow key={index}>
                        <TableCell>{el.code}</TableCell>
                        <TableCell>{el.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size={"icon"} variant={"outline"} onClick={() => {
                              setIdToEdit(el.id)
                            }}><Pencil /></Button>
                            <Button size={"icon"} variant={"destructive"} onClick={() => setIdToDelete(el.id)}><X /></Button>
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
