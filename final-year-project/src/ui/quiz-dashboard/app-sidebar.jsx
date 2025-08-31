"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { NavUser } from "@/ui/quiz-dashboard/nav-user"

import {
  BiHome,
  BiSolidHome,
  BiSpreadsheet,
  BiSolidSpreadsheet,
  BiSlider,
  BiBookmark,
  BiSolidBookmark,
  BiBookAlt,
  BiSolidBookAlt,
} from "react-icons/bi"

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

const navMain = [
  {
    name: "Home",
    href: "/dashboard",
    icon: BiHome,
    solidIcon: BiSolidHome,
  },
]

const quizMenu = [
  {
    name: "Practice Tests",
    href: "/dashboard/practice",
    icon: BiSpreadsheet,
    solidIcon: BiSolidSpreadsheet,
  },
  {
    name: "Resorces",
    href: "/dashboard/practice",
    icon: BiBookAlt ,
    solidIcon: BiSolidBookAlt,
  },
  {
    name: "Personalized Insights",
    href: "/dashboard/personalized",
    icon: BiSlider,
    solidIcon: null,
  },
  {
    name: "Bookmarks",
    href: "/dashboard/bookmark",
    icon: BiBookmark,
    solidIcon: BiSolidBookmark,
  },

]

function NavGroup({ label, items }) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {label && (
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      {items.map(({ name, href, icon, solidIcon }, idx) => {
        const isActive = pathname === href
        const IconToUse = isActive && solidIcon ? solidIcon : icon

        return (
          <SidebarMenuItem key={idx}>
            <SidebarMenuButton asChild className="px-3 py-2">
              <Link
                href={href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-muted text-primary font-bold hover:cursor-default"
                    : "text-muted-foreground"
                )}
              >
                <IconToUse className="h-4 w-4" />
                <span>{name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5" asChild>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/quiz/logo-symbol.svg"
                  alt="CertifyPrep Logo"
                  width={24}
                  height={24}
                  className="shrink-0"
                  priority
                />
                <span className="text-base font-semibold">CertifyPrep</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <div className="mt-3">
          <NavGroup label="" items={navMain} />
        </div>

        <div className="mt-3">
          <NavGroup label="Quiz" items={quizMenu} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
