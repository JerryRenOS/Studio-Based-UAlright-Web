import Link from 'next/link';
import { Shield, LayoutDashboard, PhoneCall, Settings, Activity } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-3 z-50 flex justify-between items-center md:top-0 md:bottom-auto md:flex-col md:h-full md:w-20 md:py-10 md:px-0">
      <NavItem href="/" icon={<Shield size={24} />} label="Safety" />
      <NavItem href="/dashboard" icon={<Activity size={24} />} label="Activity" />
      <NavItem href="/staged-call" icon={<PhoneCall size={24} />} label="Cover" />
      <NavItem href="/blueprint" icon={<LayoutDashboard size={24} />} label="Plan" />
      <NavItem href="/settings" icon={<Settings size={24} />} label="Settings" />
    </nav>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}
