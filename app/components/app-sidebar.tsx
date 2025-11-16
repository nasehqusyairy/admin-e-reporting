import NavItems from "~/components/nav-items"
import { navLinks } from "~/models/nav-links"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import logo from "~/images/logo.webp"
import { LogOut } from "lucide-react"

import { signOut } from "firebase/auth"
import { useFirebase } from "./providers/firebase"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { Link } from "react-router"

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { auth } = useFirebase()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = "/auth"
    } catch (err) {
      console.error("Logout failed:", err)
      toast.error(`Terjadi kesalahan saat logout`)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton asChild size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"   >
          <Link to={'/'}>
            <div className="flex justify-center items-center rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
              <img src={logo} alt="logo" className="h-8" />
            </div>
            <div className="flex-1 grid text-sm text-left leading-tight">
              <div className="font-medium truncate">
                E-Reporting <span className="text-primary">Surabaya</span>
              </div>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        <NavItems links={navLinks} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton>
                  <LogOut /> Keluar
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Keluar</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan diarahkan ke halaman login. Anda yakin?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant={"outline"} onClick={handleLogout}>
                    Ya
                  </Button>
                  <AlertDialogCancel className="bg-primary hover:bg-primary/90 text-primary-foreground!">
                    Batal
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
