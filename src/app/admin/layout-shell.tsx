'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { AdminSession } from '@/lib/auth';
import { VisaPilotIcon } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, CalendarClock, GraduationCap, Plane, Wand2, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
  { href: '/admin/study', label: 'Study Admin', icon: GraduationCap },
  { href: '/admin/travel', label: 'Travel Bookings', icon: Plane },
  { href: '/admin/ai-tools', label: 'AI Tools', icon: Wand2 },
];

type AdminLayoutShellProps = {
  session: AdminSession;
  children: React.ReactNode;
};

export default function AdminLayoutShell({ session, children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setSigningOut] = React.useState(false);

  const displayName = session.name || session.email || 'Administrator';
  const displayEmail = session.email || 'admin@visapilot.com';
  const initials = React.useMemo(() => {
    const source = displayName.trim() || displayEmail;
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(segment => segment.charAt(0).toUpperCase())
      .join('')
      .padEnd(2, 'A')
      .slice(0, 2);
  }, [displayName, displayEmail]);

  const isActive = React.useCallback(
    (path: string) => pathname === path || pathname.startsWith(`${path}/`),
    [pathname],
  );

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      router.replace('/admin/login');
    }
  }

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
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {session.picture ? <AvatarImage src={session.picture} alt={displayName} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <span className="font-semibold">{displayName}</span>
              <span className="text-muted-foreground">{displayEmail}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={handleSignOut} disabled={isSigningOut}>
              <LogOut className="size-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 bg-secondary/30">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
