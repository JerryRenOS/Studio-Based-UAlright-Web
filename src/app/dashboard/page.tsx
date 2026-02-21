import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 bg-background font-body">
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Recent Activity</h1>
            <p className="text-muted-foreground">Monitor your safety history.</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1">
            System Online
          </Badge>
        </header>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Clock size={18} className="text-primary" />
            <h2 className="text-lg font-bold">Active Incidents</h2>
          </div>
          <Card className="border-destructive shadow-lg overflow-hidden relative">
             <div className="absolute top-0 right-0 p-3">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
            </div>
            <CardHeader className="bg-destructive/5 border-b border-destructive/10">
              <CardTitle className="text-destructive flex items-center gap-2">
                Silent Alarm Triggered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Started: 12:45 PM</span>
                <span className="font-bold">Elapsed: 04:22</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="bg-muted p-2 rounded-full">
                    <MessageCircle size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">3 SMS Sent to Contacts</p>
                    <p className="text-xs text-muted-foreground italic">"Help, I'm at 123 Main St..."</p>
                  </div>
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="bg-muted p-2 rounded-full">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Location Tracking Active</p>
                    <p className="text-xs text-muted-foreground italic">Updating every 30 seconds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold px-1">History</h2>
          <div className="space-y-3">
            <HistoryItem 
              type="Staged Call" 
              date="Oct 24, 2:15 PM" 
              status="Completed" 
              desc="Work emergency scenario used."
            />
            <HistoryItem 
              type="Loud Alarm" 
              date="Oct 20, 11:30 PM" 
              status="Resolved" 
              desc="Resolved with secondary PIN."
            />
          </div>
        </section>
      </div>
      <Navigation />
    </div>
  );
}

function HistoryItem({ type, date, status, desc }: { type: string, date: string, status: string, desc: string }) {
  return (
    <Card className="hover:bg-muted/10 transition-colors">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">{type}</h3>
            <Badge variant="secondary" className="text-[10px] h-4 px-1">{status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{date}</p>
          <p className="text-xs">{desc}</p>
        </div>
        <Clock size={16} className="text-muted-foreground opacity-30" />
      </CardContent>
    </Card>
  );
}
