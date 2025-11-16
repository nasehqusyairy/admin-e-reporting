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
import type { Category, SubCategory } from "~/models/schema";
import { separateHidden } from "~/lib/separate-hidden";
import SubcategorySearchForm from "~/components/subcategory-search-form";
import SubCategoryDialog from "~/components/sub-category-dialog";
import { eagerLoad } from "~/lib/eager-load";
import { toast } from "sonner";
import { useFirebase } from "~/components/providers/firebase";

export const handle = {
  title: navLinks.find(el => el.url === '/categories')!.name
}

export default () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ""
  const cat = searchParams.get('cat') ?? "all"

  const outlet = useOutlet()
  const { db } = useFirebase()
  const { data: categories, getDocument: categoryDoc } = useCollection<Category>(db, 'categories')
  const collection = useCollection<SubCategory>(db, 'subcategories')
  const { data, loading, updating, update, add, softDelete } = collection

  const eagerLoaded = eagerLoad(data, categories, 'category').sort((a, b) => `${a.category!.code}.${a.code}`.localeCompare(`${b.category!.code}.${b.code}`))

  const { available, hidden } = separateHidden(eagerLoaded)

  const [idToDelete, setIdToDelete] = useState<string>();
  const [idToEdit, setIdToEdit] = useState<string>();

  const onDelete = async () => {
    await softDelete(idToDelete!)
    setIdToDelete(undefined)
    toast.success("Data berhasil dihapus")
  }

  const onSubmit = async (code: string, description: string, categoryId: string, idToEdit?: string) => {
    const category_ref = categoryDoc(categoryId)
    if (!category_ref) return toast.error("Kategori tidak ditemuukan")
    const sameCode = eagerLoaded.find((el) => el.category?.id === categoryId && el.code === code)
    if (idToEdit) {
      if (sameCode && sameCode.id !== idToEdit) {
        return toast.error("Kode sudah dipakai")
      }
      await update(idToEdit, { description, category_ref, code })
    } else {
      if (sameCode) {
        return toast.error("Kode sudah dipakai")
      }
      await add({ description, category_ref, code, hidden: true })
    }
    setIdToEdit(undefined)
    toast(`Data berhasil ${idToEdit ? "diperbarui" : "ditambahkan"}`)
  }

  const filtered = available.filter(el => cat !== "all" ? el.category!.id === cat : true).filter(el => el.description.toUpperCase().includes(q.toUpperCase()))

  return (
    <>
      {/* dialogs */}
      <DeleteAlert
        open={idToDelete !== undefined}
        isDeleting={updating}
        onDelete={onDelete}
        onClose={() => setIdToDelete(undefined)}
      />
      <SubCategoryDialog
        categories={categories}
        subCategories={available}
        onClose={() => { setIdToEdit(undefined) }}
        idToEdit={idToEdit}
        onsubmit={onSubmit}
        updating={updating}
      />

      {/* main content */}
      <div className="mx-auto container">
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setIdToEdit("")}><Plus />Sub Kategori</Button>
        </div>
        <Card>
          <CardContent>
            <VisibilityTab path="/subcategories" />
            <SubcategorySearchForm
              q={q}
              cat={cat}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              categories={categories}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlet ? <Outlet context={{ ...collection, q, hidden, cat }} /> :
                  !filtered.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-secondary text-center">
                        {loading ? "Memuat..." : updating ? "Memperbarui..." : "Data kosong"}
                      </TableCell>
                    </TableRow>
                  ) :
                    filtered.map((el, index) => (
                      <TableRow key={index}>
                        <TableCell>{el.category?.code}.{el.code}</TableCell>
                        <TableCell>{el.description}</TableCell>
                        <TableCell>{el.category?.description}</TableCell>
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
