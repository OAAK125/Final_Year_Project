"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

// React Icons
import {
  BiHome,
  BiSolidHome,
  BiSpreadsheet,
  BiSolidSpreadsheet,
  BiSlider,
  BiBookmark,
  BiSolidBookmark,
} from "react-icons/bi"

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

const navMain = [
  {
    name: "Home",
    href: "#",
    icon: BiHome,
    solidIcon: BiSolidHome,
    active: true,
  },
]

const quizMenu = [
  {
    name: "Practice Tests",
    href: "#",
    icon: BiSpreadsheet,
    solidIcon: BiSolidSpreadsheet,
    active: false,
  },
  {
    name: "Personalized Quiz",
    href: "#",
    icon: BiSlider,
    solidIcon: null,
    active: false,
  },
  {
    name: "Bookmarked",
    href: "#",
    icon: BiBookmark,
    solidIcon: BiSolidBookmark,
    active: false,
  },
]

const forumMenu = [
  {
    name: "Showcase",
    href: "#",
    icon: BiBookmark, 
    active: false,
  },
]

function NavGroup({ label, items }) {
  return (
    <SidebarMenu>
      {label && (
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      {items.map(({ name, href, icon, solidIcon, active }, idx) => {
        const IconToUse = active && solidIcon ? solidIcon : icon
        return (
          <SidebarMenuItem key={idx}>
            <SidebarMenuButton asChild className="px-3 py-2">
              <Link
                href={href}
                 className={cn(
                        'flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                        active
                          ? 'bg-muted text-primary font-bold'
                          : 'text-muted-foreground'
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

// Main Component
export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              asChild
            >
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

        <div className="mt-6">
          <NavGroup label="Forum" items={forumMenu} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
