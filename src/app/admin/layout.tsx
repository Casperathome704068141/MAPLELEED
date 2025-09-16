"use client"

import * as React from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  CalendarClock,
  Plane,
  Wand2,
  GraduationCap,
  LogOut
} from "lucide-react"

import { VisaPilotIcon } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <VisaPilotIcon className="size-6 shrink-0" />
            <span className="text-lg font-semibold font-headline">VisaPilot</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin')} tooltip="Dashboard">
                <Link href="/admin"><LayoutDashboard /><span>Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/appointments')} tooltip="Appointments">
                <Link href="/admin/appointments"><CalendarClock /><span>Appointments</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/study')} tooltip="Study">
                <Link href="/admin/study"><GraduationCap /><span>Study Admin</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/travel')} tooltip="Travel">
                <Link href="/admin/travel"><Plane /><span>Travel Bookings</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/ai-tools')} tooltip="AI Tools">
                <Link href="/admin/ai-tools"><Wand2 /><span>AI Tools</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src="https://picsum.photos/seed/admin-avatar/100/100" />
                <AvatarFallback>VE</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">Visa Expert</span>
                <span className="text-muted-foreground">expert@visapilot.com</span>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/"><LogOut /></Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-background/60">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
