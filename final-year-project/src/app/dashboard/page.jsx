import { AppSidebar } from "@/ui/quiz-dashboard/app-sidebar"
import { SiteHeader } from "@/ui/quiz-dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import DashboardHome from "@/ui/quiz-dashboard/home";


export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashboardHome />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
