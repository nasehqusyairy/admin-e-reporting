import { Outlet, type LoaderFunction } from "react-router"
import { getSession } from "~/.server/session"
import { navLinks } from "~/lib/nav-links"
import type { Route } from "./+types"
import { useEffect } from "react"
import { toast } from "sonner"

export const handle = {
  title: navLinks.find(el => el.url === '/audits')!.name
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))

  return {
    errorMessage: session.get("error"),
    successMessage: session.get("error")
  }
}

export default ({ loaderData }: Route.ComponentProps) => {
  const { errorMessage, successMessage } = loaderData
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage)
    }
    if (successMessage) {
      toast.success(successMessage)
    }
  }, [errorMessage, successMessage]);
  return (
    <div className="mx-auto container">
      <Outlet />
    </div>
  )
}
