import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VisaPilotIcon } from './icons';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <VisaPilotIcon className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-xl">VisaPilot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#appointments" className="text-sm font-medium hover:text-primary transition-colors">
            Appointments
          </Link>
          <Link href="/#travel" className="text-sm font-medium hover:text-primary transition-colors">
            Travel
          </Link>
          <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
            Resources
          </Link>
        </nav>
        <div className="flex items-center gap-2">
           <Button variant="ghost" asChild>
             <Link href="/admin">Admin Panel</Link>
           </Button>
           <Button>
             Book Now
           </Button>
        </div>
      </div>
    </header>
  );
}