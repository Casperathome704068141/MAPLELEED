import Link from 'next/link';
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
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
