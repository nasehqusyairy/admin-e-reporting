import { Link, Outlet, redirect, useMatches, type MiddlewareFunction } from "react-router"
import { Fragment } from "react/jsx-runtime"
import AppSidebar from "~/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "~/components/ui/sidebar"
import type { RouteModule } from "~/models/route-module"
import TransitionProgressbar from "../transition-progressbar"
import { getSession } from "~/.server/session"

export const middleware: MiddlewareFunction[] = [
    async ({ request }, next) => {
        const session = await getSession(request.headers.get("Cookie"))
        if (!session.get("userId")) {
            return redirect("/login")
        }
        return next()
    }
]

const SidebarLayout = () => {
    const matches = useMatches() as RouteModule[]
    const routes = matches.filter(el => el.pathname !== '/')

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex items-center gap-2 h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink asChild>
                                        <Link to={'/'}>E-Reporting Surabaya</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {routes.length ? routes.map((el, index) => (
                                    <Fragment key={el.id}>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            {index + 1 === routes.length ? (
                                                <BreadcrumbPage>
                                                    {el.handle?.title}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link to={el.pathname}>{el.handle?.title}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </Fragment>
                                )) : (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                Dashboard
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="p-4">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default () => {
    return (
        <>
            <TransitionProgressbar />
            <SidebarLayout />
        </>
    )
}