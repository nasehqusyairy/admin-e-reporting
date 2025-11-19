import type { ActionFunction } from "react-router";
import { Audit } from "~/.server/model";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");

    if (!id) {
        throw new Response('Bad Request', { status: 400 })
    }

    await Audit.update(id, { hidden: true });
}