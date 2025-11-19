import type { ActionFunction, LoaderFunction } from "react-router";
import { Category, SubCategory } from "~/.server/model";
import { getSession, pass } from "~/.server/session";
import SubCategoryDialog from "~/components/sub-category-dialog";
import type { Route } from "./+types/edit";

export const handle = {
    title: "Ubah"
}

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id as string
    return {
        categories: await Category.query().get(),
        item: await SubCategory.query().where({ id }).first()
    }
}

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie'))
    const form = await request.formData()
    const id = (form.get('id') as string).trim()
    const description = (form.get('description') as string).trim()
    const category_id = (form.get('category_id') as string).trim()
    const old_id = (form.get('old_id') as string).trim()

    const relatedId = `${category_id}.${id}`

    if (relatedId !== old_id) {
        const exist = await SubCategory.findById(relatedId)

        if (exist) {
            return {
                error: "Id sudah digunakan"
            }
        }
    }

    await SubCategory.update(old_id, { id: relatedId, category_id, description })
    return await pass(session, '/subcategories', 'Kategori baru berhasil ditambahkan')
}

export default ({ loaderData: { categories, item } }: Route.ComponentProps) => <SubCategoryDialog item={item} categories={categories} />