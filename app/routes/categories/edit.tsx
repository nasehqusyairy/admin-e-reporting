import type { ActionFunction, LoaderFunction } from "react-router";
import { Category } from "~/.server/model";
import { getSession, pass } from "~/.server/session";
import CategoryDialog from "~/components/category-dialog";
import type { Route } from "./+types/edit";

export const handle = {
    title: "Ubah"
}

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id as string
    const item = await Category.findById(id)
    if (!item) {
        throw new Response('Not Found', { status: 404 })
    }
    return { item }
}

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie'))
    const form = await request.formData()
    const description = (form.get('description') as string).trim()
    const id = (form.get('id') as string).trim()
    const old_id = (form.get('old_id') as string).trim()

    if (id !== old_id) {
        const exist = await Category.query().where({ id }).first()
        if (exist) {
            return {
                error: "Id sudah digunakan"
            }
        }
    }

    await Category.update(old_id, { id, description })
    return await pass(session, '/categories', 'Kategori berhasil diperbarui')
}

export default ({ loaderData: { item } }: Route.ComponentProps) => <CategoryDialog item={item} />