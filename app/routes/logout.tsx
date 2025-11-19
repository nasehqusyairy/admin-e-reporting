import type { LoaderFunction } from "react-router";
import { logout } from "~/.server/session";


export const loader: LoaderFunction = async ({ request }) => {
    return await logout(request);
}