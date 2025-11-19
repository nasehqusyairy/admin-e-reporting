import { useState } from "react";
import { Link, Outlet, useFetcher, useOutlet, useSearchParams } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, X } from "lucide-react";
import VisibilityTab from "~/components/visibility-tab";
import DeleteAlert from "~/components/delete-alert";
import CategorySearchForm from "~/components/category-search-form";
import { toast } from "sonner";
import { Category } from "~/.server/model";
import type { Route } from "./+types/available";

export const handle = {
  title: "Tersedia"
}

export const loader = async () => {
  return {
    categories: await Category.query().where({ hidden: false }).get()
  }
}

export default ({ loaderData }: Route.ComponentProps) => {
  const { categories } = loaderData
  const outlet = useOutlet()

  const fetcher = useFetcher()
  const updating = fetcher.state !== "idle"


  const [idToDelete, setIdToDelete] = useState<string>();

  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ""

  const onDelete = async () => {
    await fetcher.submit({ id: idToDelete! }, { method: "post", action: "/categories/remove" })

    setIdToDelete(undefined)
    toast.success("Data berhasil dihapus")
  }

  const filtered = categories.filter(el => el.description.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      {/* dialogs */}
      <DeleteAlert
        open={idToDelete !== undefined}
        isDeleting={updating}
        onDelete={onDelete}
        onClose={() => setIdToDelete(undefined)}
      />

      {/* main content */}
      <div className="flex gap-2 mb-4">
        <Button asChild>
          <Link to={'/categories/create'}>
            <Plus />Kategori
          </Link>
        </Button>
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
              {outlet ? <Outlet context={{ q, updating }} /> :
                !filtered.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-secondary text-center">
                      {updating ? "Memperbarui..." : "Data kosong"}
                    </TableCell>
                  </TableRow>
                ) :
                  filtered.map((el, index) => (
                    <TableRow key={index}>
                      <TableCell>{el.id}</TableCell>
                      <TableCell>{el.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size={"icon"} variant={"outline"} asChild>
                            <Link to={`/categories/${el.id}`}>
                              <Pencil />
                            </Link>
                          </Button>
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
    </>
  )
}
