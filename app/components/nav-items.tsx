import { type LucideIcon } from "lucide-react"
import { NavLink } from "react-router"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

type NavItemsProps = {
  links: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}

export default ({ links }: NavItemsProps) => {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {links.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <NavLink to={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
