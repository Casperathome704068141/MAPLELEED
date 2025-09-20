import { ReactNode } from 'react';

import { requireAdminSession } from '@/lib/auth';

import AdminLayoutShell from './layout-shell';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return <AdminLayoutShell session={session}>{children}</AdminLayoutShell>;
}
