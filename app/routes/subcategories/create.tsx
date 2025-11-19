import type { ActionFunction, LoaderFunction } from "react-router";
import { Category, SubCategory } from "~/.server/model";
import { getSession, pass } from "~/.server/session";
import SubCategoryDialog from "~/components/sub-category-dialog";
import type { Route } from "./+types/create";

export const handle = {
    title: "Tambah"
}

export const loader: LoaderFunction = async () => {
    return {
        categories: await Category.query().get()
    }
}

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie'))
    const form = await request.formData()
    const id = (form.get('id') as string).trim()
    const description = (form.get('description') as string).trim()
    const category_id = (form.get('category_id') as string).trim()

    const relatedId = `${category_id}.${id}`

    const exist = await SubCategory.findById(relatedId)

    if (exist) {
        return {
            error: "Id sudah digunakan"
        }
    }

    await SubCategory.create({ id: relatedId, category_id, description })
    return await pass(session, '/subcategories', 'Kategori baru berhasil ditambahkan')
}

export default ({ loaderData: { categories } }: Route.ComponentProps) => <SubCategoryDialog categories={categories} />