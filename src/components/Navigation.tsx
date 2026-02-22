import Link from 'next/link';
import { Shield, LayoutDashboard, PhoneCall, Settings, Activity, UserCircle } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-3 z-50 flex justify-between items-center md:top-0 md:bottom-auto md:left-0 md:flex-col md:h-full md:w-24 md:py-12 md:px-0 md:border-t-0 md:border-r">
      <div className="flex justify-between items-center w-full md:flex-col md:gap-12 md:h-full">
        <div className="flex justify-between items-center w-full md:flex-col md:gap-10">
          <NavItem href="/" icon={<Shield size={28} />} label="Safety" />
          <NavItem href="/dashboard" icon={<Activity size={28} />} label="Activity" />
          <NavItem href="/staged-call" icon={<PhoneCall size={28} />} label="Cover" />
          <NavItem href="/blueprint" icon={<LayoutDashboard size={28} />} label="Plan" />
          <NavItem href="/settings" icon={<Settings size={28} />} label="Settings" />
        </div>
        <div className="hidden md:block mt-auto pb-4">
           <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              <UserCircle size={24} />
           </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-all group">
      <div className="p-1 rounded-xl group-hover:bg-primary/5 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">{label}</span>
    </Link>
  );
}
