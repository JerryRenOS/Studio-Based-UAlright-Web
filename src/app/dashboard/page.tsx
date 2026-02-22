"use client";

import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageCircle, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'incidents'),
      orderBy('triggerTime', 'desc'),
      limit(10)
    );
  }, [firestore, user]);

  const { data: incidents, isLoading: isIncidentsLoading } = useCollection(incidentsQuery);

  const activeIncident = incidents?.find(inc => inc.status === 'active');
  const historyIncidents = incidents?.filter(inc => inc.status !== 'active') || [];

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

        {!user && !isUserLoading ? (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="text-muted-foreground" size={48} />
              <div className="space-y-1">
                <p className="font-bold">Not Signed In</p>
                <p className="text-sm text-muted-foreground">Please sign in to view your safety activity.</p>
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
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : activeIncident ? (
                <Card className="border-destructive shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                  </div>
                  <CardHeader className="bg-destructive/5 border-b border-destructive/10">
                    <CardTitle className="text-destructive flex items-center gap-2 text-xl">
                      {activeIncident.incidentType === 'LoudAlarm' ? 'Loud Alarm Active' : 'Silent Alarm Active'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Started: {format(new Date(activeIncident.triggerTime), 'p')}
                      </span>
                      <span className="font-bold">Monitoring Active</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="bg-muted p-2 rounded-full">
                          <MessageCircle size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Alerts Dispatched</p>
                          <p className="text-xs text-muted-foreground italic">"Help requested at current location..."</p>
                        </div>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      
                      <div className="flex gap-3 items-start">
                        <div className="bg-muted p-2 rounded-full">
                          <MapPin size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Location Tracking Active</p>
                          <p className="text-xs text-muted-foreground italic">Updating background location data</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No active incidents detected. You are safe.</p>
                  </CardContent>
                </Card>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold px-1">Incident History</h2>
              <div className="space-y-3">
                {historyIncidents.length > 0 ? (
                  historyIncidents.map((incident) => (
                    <HistoryItem 
                      key={incident.id}
                      type={incident.incidentType === 'LoudAlarm' ? 'Loud Alarm' : incident.incidentType === 'SilentAlarm' ? 'Silent Alarm' : 'Staged Call'} 
                      date={format(new Date(incident.triggerTime), 'MMM d, p')} 
                      status={incident.status.charAt(0).toUpperCase() + incident.status.slice(1)} 
                      desc={incident.incidentType === 'LoudAlarm' ? 'Deterrence protocol used.' : 'Discreet alert triggered.'}
                    />
                  ))
                ) : !isIncidentsLoading && (
                  <p className="text-sm text-muted-foreground text-center py-8">No historical incidents found.</p>
                )}
              </div>
            </section>
          </>
        )}
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
