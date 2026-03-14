'use client';

import Link from 'next/link';
import { Shield, Activity, PhoneCall, LayoutDashboard, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-black/5 z-50 flex items-center justify-center px-6">
      <div className="flex items-center gap-1 md:gap-4 bg-muted/40 p-1.5 rounded-full ring-1 ring-black/5">
        <NavItem 
          href="/app" 
          icon={<Shield size={20} />} 
          label="Safety" 
          active={pathname === '/app'} 
        />
        <NavItem 
          href="/dashboard" 
          icon={<Activity size={20} />} 
          label="Activity" 
          active={pathname === '/dashboard'} 
        />
        <NavItem 
          href="/staged-call" 
          icon={<PhoneCall size={20} />} 
          label="Cover" 
          active={pathname === '/staged-call'} 
        />
        <NavItem 
          href="/blueprint" 
          icon={<LayoutDashboard size={20} />} 
          label="Plan" 
          active={pathname === '/blueprint'} 
        />
        <NavItem 
          href="/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={pathname === '/settings'} 
        />
      </div>
    </nav>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
          : "text-muted-foreground hover:text-foreground hover:bg-black/5"
      )}
    >
      {icon}
      <span className={cn(
        "text-xs font-bold uppercase tracking-widest hidden sm:block",
        !active && "opacity-60"
      )}>
        {label}
      </span>
    </Link>
  );
}
