'use client';

import Link from 'next/link';
import { Shield, Activity, PhoneCall, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: '/app', icon: <Shield size={28} strokeWidth={1.5} />, label: 'Safety' },
    { href: '/dashboard', icon: <Activity size={28} strokeWidth={1.5} />, label: 'Activity' },
    { href: '/staged-call', icon: <PhoneCall size={28} strokeWidth={1.5} />, label: 'Cover' },
    { href: '/blueprint', icon: <LayoutDashboard size={28} strokeWidth={1.5} />, label: 'Plan' },
    { href: '/settings', icon: <Settings size={28} strokeWidth={1.5} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-2xl border-t border-primary/10 z-50 flex items-center justify-around px-2 md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => (
          <MobileNavItem 
            key={item.href}
            href={item.href} 
            icon={item.icon} 
            active={pathname === item.href} 
            label={item.label}
          />
        ))}
      </nav>

      {/* Desktop Vertical Sidebar */}
      <nav className="fixed inset-y-0 left-0 w-24 bg-background border-r border-primary/10 z-50 hidden md:flex flex-col items-center py-10 shadow-[4px_0_30px_rgba(0,0,0,0.02)]">
        <div className="flex-1 w-full flex flex-col items-center gap-10">
          {navItems.map((item) => (
            <DesktopNavItem 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              active={pathname === item.href} 
              label={item.label}
            />
          ))}
        </div>

        {/* User Profile Action at Bottom */}
        <Link 
          href="/settings" 
          className="mt-auto group"
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white shadow-sm ring-1 ring-black/5 group-hover:bg-primary/5",
            pathname === '/settings' && "ring-2 ring-primary ring-offset-4"
          )}>
            {user?.photoURL ? (
              <Avatar className="w-full h-full">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback><UserIcon className="text-foreground/40" size={20} /></AvatarFallback>
              </Avatar>
            ) : (
              <UserIcon className="text-foreground/40 group-hover:text-primary transition-colors" size={24} strokeWidth={1.5} />
            )}
          </div>
        </Link>
      </nav>
    </>
  );
}

function DesktopNavItem({ href, icon, active, label }: { href: string; icon: React.ReactNode; active?: boolean; label: string }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex flex-col items-center gap-2 transition-all duration-300 group",
        active ? "text-primary" : "text-foreground/40 hover:text-foreground/60"
      )}
    >
      <div className={cn(
        "transition-transform duration-300 group-hover:scale-110",
        active && "scale-110"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
        active ? "text-primary" : "text-foreground/30 group-hover:text-foreground/50"
      )}>
        {label}
      </span>
    </Link>
  );
}

function MobileNavItem({ href, icon, active, label }: { href: string; icon: React.ReactNode; active?: boolean; label: string }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
        active ? "text-primary" : "text-foreground/40 hover:text-foreground/60"
      )}
    >
      <div className={cn(
        "transition-transform",
        active && "scale-110"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-wider",
        active ? "text-primary" : "text-foreground/40"
      )}>
        {label}
      </span>
    </Link>
  );
}