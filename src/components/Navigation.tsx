'use client';

import Link from 'next/link';
import { Shield, Activity, PhoneCall, LayoutDashboard, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-black/5 z-50 flex items-center justify-around px-6 md:hidden">
        <NavItem href="/app" icon={<Shield size={24} />} active={pathname === '/app'} />
        <NavItem href="/dashboard" icon={<Activity size={24} />} active={pathname === '/dashboard'} />
        <NavItem href="/staged-call" icon={<PhoneCall size={24} />} active={pathname === '/staged-call'} />
        <NavItem href="/blueprint" icon={<LayoutDashboard size={24} />} active={pathname === '/blueprint'} />
        <NavItem href="/settings" icon={<Settings size={24} />} active={pathname === '/settings'} />
      </nav>

      {/* Desktop Vertical Sidebar */}
      <nav className="fixed inset-y-0 left-0 w-20 bg-white border-r border-black/5 z-50 hidden md:flex flex-col items-center py-8 gap-6">
        <div className="mb-6 p-2 bg-primary/10 rounded-2xl">
           <Shield className="text-primary" size={28} />
        </div>
        <NavItem href="/app" icon={<Shield size={24} />} active={pathname === '/app'} tooltip="Safety" />
        <NavItem href="/dashboard" icon={<Activity size={24} />} active={pathname === '/dashboard'} tooltip="Activity" />
        <NavItem href="/staged-call" icon={<PhoneCall size={24} />} active={pathname === '/staged-call'} tooltip="Cover" />
        <NavItem href="/blueprint" icon={<LayoutDashboard size={24} />} active={pathname === '/blueprint'} tooltip="Plan" />
        <NavItem href="/settings" icon={<Settings size={24} />} active={pathname === '/settings'} tooltip="Settings" />
      </nav>
    </>
  );
}

function NavItem({ href, icon, active, tooltip }: { href: string; icon: React.ReactNode; active?: boolean; tooltip?: string }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center justify-center p-3 rounded-2xl transition-all duration-300 group relative",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
          : "text-muted-foreground hover:text-foreground hover:bg-black/5"
      )}
    >
      {icon}
      {tooltip && (
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap pointer-events-none z-[60]">
          {tooltip}
        </span>
      )}
    </Link>
  );
}
