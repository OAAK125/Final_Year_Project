"use client"

import * as React from "react"
import {
  Home,
  FileText,
  Bookmark,
  List,
  SlidersVertical,
} from "lucide-react"

import { NavDocuments } from "@/ui/quiz-dashboard/nav-documents"
import { NavMain } from "@/ui/quiz-dashboard/nav-main"
import { NavUser } from "@/ui/quiz-dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    },
  ],
  quizMenu: [
    {
      name: "Practice Tests",
      url: "#",
      icon: FileText,
    },
    {
      name: "Personalized Tests",
      url: "#",
      icon: SlidersVertical,
    },
    {
      name: "Bookmarked Questions",
      url: "#",
      icon: Bookmark,
    },
  ],
  forumMenu: [
    {
      name: "Topics",
      url: "#",
      icon: List,
    },
  ],
}

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
                  src="/assets/quiz-dashboard/logo-symbol.svg"
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
        <NavMain items={data.navMain} />
        <NavDocuments label="Quiz" items={data.quizMenu} />
        <NavDocuments label="Forum" items={data.forumMenu} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
