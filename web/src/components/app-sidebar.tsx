import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCoin,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Transactions",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Budgets",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Can I Afford It?",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Categories",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Insights",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Monthly Trends",
          url: "#",
        },
        {
          title: "Yearly Overview",
          url: "#",
        },
      ],
    },
    {
      title: "Subscriptions",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active",
          url: "#",
        },
        {
          title: "Cancelled",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Tax Report",
          url: "#",
        },
        {
          title: "Export Data",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconCoin className="!size-5 text-emerald-600" />
                <span className="text-base font-semibold">SpendSmart</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
