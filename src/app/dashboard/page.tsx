
"use client";

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  History,
  Volume2,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'incidents'),
      orderBy('triggerTime', 'desc'),
      limit(25)
    );
  }, [firestore, user]);

  const { data: incidents, isLoading: isIncidentsLoading } = useCollection(incidentsQuery);

  const activeIncident = incidents?.find(inc => inc.status === 'active');
  const allIncidents = incidents || [];

  const handleResolve = (incidentId: string) => {
    if (!user || !firestore) return;
    
    setIsResolving(true);
    const docRef = doc(firestore, 'users', user.uid, 'incidents', incidentId);
    
    updateDocumentNonBlocking(docRef, { 
      status: 'resolved', 
      resolveTime: new Date().toISOString() 
    });

    toast({
      title: "Incident Resolved",
      description: "Safety status updated. Contacts have been notified that you are safe.",
    });
    
    // Smooth transition for the UI
    setTimeout(() => setIsResolving(false), 500);
  };

  return (
    <div className="min-h-screen pb-24 md:pl-24 md:pb-0 bg-background font-body">
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground">Real-time safety monitoring & history.</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1 hidden sm:flex">
            System Online
          </Badge>
        </header>

        {!user && !isUserLoading ? (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="text-muted-foreground" size={48} />
              <div className="space-y-1">
                <p className="font-bold">Account Required</p>
                <p className="text-sm text-muted-foreground">Sign in to view your personalized safety logs.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Clock size={18} className="text-primary" />
                <h2 className="text-lg font-bold">Current Status</h2>
              </div>
              
              {isIncidentsLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : activeIncident ? (
                <Card className={cn(
                  "overflow-hidden relative shadow-lg ring-2 transition-all",
                  activeIncident.incidentType === 'LoudAlarm' 
                    ? "border-destructive ring-destructive/20 bg-destructive/5" 
                    : "border-primary ring-primary/20 bg-primary/5"
                )}>
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-3 w-3">
                      <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        activeIncident.incidentType === 'LoudAlarm' ? "bg-destructive" : "bg-primary"
                      )}></span>
                      <span className={cn(
                        "relative inline-flex rounded-full h-3 w-3",
                        activeIncident.incidentType === 'LoudAlarm' ? "bg-destructive" : "bg-primary"
                      )}></span>
                    </span>
                  </div>
                  <CardHeader className="py-4 border-b border-black/5">
                    <CardTitle className={cn(
                      "flex items-center gap-2 text-xl font-bold",
                      activeIncident.incidentType === 'LoudAlarm' ? "text-destructive" : "text-primary"
                    )}>
                      {activeIncident.incidentType === 'LoudAlarm' ? <Volume2 size={24} /> : <EyeOff size={24} />}
                      {activeIncident.incidentType === 'LoudAlarm' ? 'Loud Alarm Active' : 'Silent Alarm Active'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground font-medium">
                        Started: {format(new Date(activeIncident.triggerTime), 'p')}
                      </span>
                      <Badge variant={activeIncident.incidentType === 'LoudAlarm' ? "destructive" : "default"} className="animate-pulse">
                        Live Incident
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="bg-primary/10 p-2.5 rounded-full">
                          <MessageCircle size={18} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">Alerts Dispatched</p>
                          <p className="text-xs text-muted-foreground italic">"Help requested at current location..."</p>
                        </div>
                        <div className="bg-green-100 p-1 rounded-full">
                          <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="bg-primary/10 p-2.5 rounded-full">
                          <MapPin size={18} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">Live Tracking</p>
                          <p className="text-xs text-muted-foreground">Location breadcrumbs being recorded.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5">
                      <Button 
                        className="w-full py-6 rounded-xl font-bold text-lg gap-2 shadow-md hover:scale-[1.01] transition-all" 
                        variant={activeIncident.incidentType === 'LoudAlarm' ? "destructive" : "default"}
                        onClick={() => handleResolve(activeIncident.id)}
                        disabled={isResolving}
                      >
                        {isResolving ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        I'm Safe - Resolve Alarm
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-bold opacity-60">
                        This will notify trusted contacts that you are secure
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30 border-none rounded-2xl">
                  <CardContent className="p-8 text-center flex flex-col items-center gap-2">
                    <CheckCircle2 className="text-green-500 mb-1" size={24} />
                    <p className="text-sm font-medium">Monitoring Standby</p>
                    <p className="text-xs text-muted-foreground">No active incidents detected.</p>
                  </CardContent>
                </Card>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-primary" />
                  <h2 className="text-lg font-bold">Incident History</h2>
                </div>
                {allIncidents.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="text-xs font-bold text-primary hover:bg-primary/5"
                  >
                    {isHistoryExpanded ? (
                      <span className="flex items-center gap-1">Collapse <ChevronUp size={14} /></span>
                    ) : (
                      <span className="flex items-center gap-1">View All <ChevronDown size={14} /></span>
                    )}
                  </Button>
                )}
              </div>

              <div className={cn(
                "transition-all duration-300 ease-in-out",
                isHistoryExpanded ? "max-h-[600px]" : "max-h-[300px]"
              )}>
                <ScrollArea className={cn(
                  "w-full rounded-2xl border bg-white/50 backdrop-blur-sm shadow-sm",
                  isHistoryExpanded ? "h-[500px]" : "h-auto"
                )}>
                  <div className="p-4 space-y-3">
                    {allIncidents.length > 0 ? (
                      (isHistoryExpanded ? allIncidents : allIncidents.slice(0, 3)).map((incident) => (
                        <HistoryItem 
                          key={incident.id}
                          type={incident.incidentType} 
                          date={format(new Date(incident.triggerTime), 'MMM d, p')} 
                          status={incident.status} 
                          isActive={incident.status === 'active'}
                        />
                      ))
                    ) : !isIncidentsLoading && (
                      <div className="text-center py-12 space-y-2">
                        <History size={32} className="mx-auto text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground font-medium">No recorded incidents yet.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </section>
          </>
        )}
      </div>
      <Navigation />
    </div>
  );
}

function HistoryItem({ type, date, status, isActive }: { type: string, date: string, status: string, isActive: boolean }) {
  const isLoud = type === 'LoudAlarm';
  const label = isLoud ? 'Loud Alarm' : type === 'SilentAlarm' ? 'Silent Alarm' : 'Staged Call';
  const desc = isLoud ? 'Deterrence protocol used.' : 'Discreet alert triggered.';
  
  return (
    <Card className={cn(
      "hover:bg-muted/10 transition-all border-none shadow-none",
      isLoud ? "bg-destructive/5" : "bg-primary/5",
      isActive && (isLoud ? "ring-2 ring-destructive/20" : "ring-2 ring-primary/20")
    )}>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "p-2 rounded-full",
            isLoud ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          )}>
            {isLoud ? <Volume2 size={16} /> : <EyeOff size={16} />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">{label}</h3>
              <Badge 
                variant={isActive ? (isLoud ? "destructive" : "default") : (status === 'resolved' ? 'outline' : 'secondary')} 
                className={cn(
                  "text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider",
                  status === 'resolved' && "text-green-600 border-green-200 bg-green-50"
                )}
              >
                {status}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Clock size={10} /> {date}
            </p>
            <p className="text-xs text-foreground/80">{desc}</p>
          </div>
        </div>
        <div className="opacity-20">
          {isActive ? (
            <AlertCircle size={18} className={isLoud ? "text-destructive" : "text-primary"} />
          ) : status === 'resolved' ? (
            <CheckCircle2 size={18} className="text-green-600" />
          ) : (
            <CheckCircle2 size={18} className="text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
