import type { ActionFunction } from "react-router";
import { Category } from "~/.server/model";
import { getSession, pass } from "~/.server/session";
import CategoryDialog from "~/components/category-dialog";

export const handle = {
    title: "Tambah"
}

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie'))
    const form = await request.formData()
    const description = (form.get('description') as string).trim()
    const id = (form.get('id') as string).trim()

    const exist = await Category.findById(id)

    if (exist) {
        return {
            error: "Id sudah digunakan"
        }
    }

    await Category.create({ id, description })
    return await pass(session, '/categories', 'Kategori baru berhasil ditambahkan')
}

export default () => <CategoryDialog />