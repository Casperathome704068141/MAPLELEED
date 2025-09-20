import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

import { VisaPilotIcon } from './icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <VisaPilotIcon className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold text-xl">VisaPilot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} VisaPilot. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/admin"
              aria-label="Admin dashboard"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Admin dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
