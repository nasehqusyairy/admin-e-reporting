import { useState } from "react";
import {
  Link,
  Outlet,
  useFetcher,
  useOutlet,
  useSearchParams,
  type LoaderFunction
} from "react-router";
import { navLinks } from "~/lib/nav-links";
import {
  Card,
  CardContent
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Pencil,
  Plus,
  X
} from "lucide-react";
import VisibilityTab from "~/components/visibility-tab";
import DeleteAlert from "~/components/delete-alert";
import SubcategorySearchForm from "~/components/subcategory-search-form";
import { toast } from "sonner";
import type { Route } from "./+types/available";
import { Category, SubCategory } from "~/.server/model";
import type { ICategory, ISubCategory } from "~/models/schema";
import { URL } from "url";
import { subCategoryContext } from "~/context";

export const handle = {
  title: navLinks.find(el => el.url === '/categories')!.name
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || ""
  const cat = url.searchParams.get('cat') || "all"


  const categories = await Category.query().get()
  const categoryMap: Record<string, ICategory> = categories.reduce((acc, item) => {
    const { id } = item;
    acc[id] = item;
    return acc;
  }, {});

  const res = {
    categories,
    categoryMap,
    subCategories: [] as ISubCategory[]
  }

  if (url.pathname === '/subcategories') {
    const subCategories = SubCategory.query()
      .where({ hidden: false })
      .where('description', 'LIKE', `%${q}%`)

    const filtered = await (cat === "all" ? subCategories : subCategories.where({ category_id: cat })).get()
    res.subCategories = filtered.map(el => ({ ...el, category: categoryMap[el.category_id] })) as ISubCategory[]
  }
  context.set(subCategoryContext, { categoryMap })
  return res
}

export default ({ loaderData }: Route.ComponentProps) => {
  const { subCategories, categories, categoryMap } = loaderData

  const fetcher = useFetcher()
  const updating = fetcher.state !== "idle"

  const outlet = useOutlet()

  const [idToDelete, setIdToDelete] = useState<string>();

  const onDelete = async () => {
    await fetcher.submit({ id: idToDelete! }, { action: '/subcategories/remove', method: 'DELETE' })
    setIdToDelete(undefined)
    toast.success("Data berhasil dihapus")
  }

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
          <Link to={'/subcategories/create'}>
            <Plus />Sub Kategori
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent>
          <VisibilityTab path="/subcategories" />
          <SubcategorySearchForm categories={categories} />
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
              {outlet ? <Outlet context={{ categoryMap }} /> :
                !subCategories.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-secondary text-center">
                      {updating ? "Memperbarui..." : "Data kosong"}
                    </TableCell>
                  </TableRow>
                ) :
                  subCategories.map((el, index) => (
                    <TableRow key={index}>
                      <TableCell>{el.id}</TableCell>
                      <TableCell>{el.description}</TableCell>
                      <TableCell>{el.category?.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size={"icon"} variant={"outline"} asChild>
                            <Link to={`/subcategories/${el.id}`}>
                              <Pencil />
                            </Link>
                          </Button>
                          <Button size={"icon"} variant={"destructive"} onClick={() => setIdToDelete(el.id)}>
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
    </>
  )
}
