import { Recycle } from "lucide-react"
import { useFetcher, useOutletContext, type ActionFunction, type LoaderFunction } from "react-router"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"
import type { ICategory, ISubCategory } from "~/models/schema"
import type { Route } from "./+types/removed"
import { SubCategory } from "~/.server/model"

type SubCategoryRouteContext = {
    categoryMap: Record<string, ICategory>
}

export const handle = {
    title: "Dihapus"
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url)

    const q = url.searchParams.get('q') || ""
    const cat = url.searchParams.get('cat') || "all"

    const query = SubCategory.query()
        .where({ hidden: true })
        .where('description', 'LIKE', `%${q}%`)

    return {
        subCategories: await (cat === 'all' ? query : query.where({ category_id: cat })).get()
    }
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    await SubCategory.update(id, { hidden: false });
}

export default ({ loaderData }: Route.ComponentProps) => {
    const { subCategories } = loaderData

    const { categoryMap } = useOutletContext() as SubCategoryRouteContext

    const related = subCategories.map(el => ({ ...el, category: categoryMap[el.category_id] })) as ISubCategory[]

    const fetcher = useFetcher()
    const updating = fetcher.state !== "idle"

    const restore = async (id: string) => {
        await fetcher.submit({ id }, { method: "POST" })
        toast.success("Data berhasil dipulihkan")
    }

    return (
        <>
            {related?.length > 0 ? related.map((el, index) => (
                <TableRow key={index}>
                    <TableCell>{el.id}</TableCell>
                    <TableCell>{el.description}</TableCell>
                    <TableCell>{el.category?.description}</TableCell>
                    <TableCell>
                        <Button size={"icon"} onClick={() => restore(el.id)}><Recycle /></Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="bg-secondary text-center">
                        {updating ? "Memperbarui..." : "Data Kosong"}
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}