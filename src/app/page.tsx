"use client";

import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, EyeOff, ShieldCheck } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function Home() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const triggerAlarm = (type: 'loud' | 'silent') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to trigger an alarm.",
        variant: "destructive",
      });
      return;
    }

    if (!firestore) return;

    const incidentData = {
      userId: user.uid,
      type,
      status: 'active',
      createdAt: serverTimestamp(),
    };

    const incidentsRef = collection(firestore, 'incidents');

    addDoc(incidentsRef, incidentData)
      .then(() => {
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Alarm Triggered`,
          description: type === 'loud' 
            ? "Deterrence activated. Contacts will be notified if not resolved."
            : "Silent alert sent. Your location is now being shared with trusted contacts.",
          variant: type === 'loud' ? "destructive" : "default",
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'incidents',
          operation: 'create',
          requestResourceData: incidentData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 font-body">
      <div className="p-6 max-w-lg mx-auto space-y-8">
        <header className="flex justify-between items-center pt-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">UAlright?</h1>
            <p className="text-muted-foreground">Stay safe, stay connected.</p>
          </div>
          <div className="bg-accent/20 p-2 rounded-full">
            <ShieldCheck className="text-primary" size={32} />
          </div>
        </header>

        <div className="grid gap-6">
          <Card className="border-2 border-destructive/20 shadow-lg overflow-hidden group hover:border-destructive transition-all">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-40 flex flex-col gap-4 text-destructive hover:bg-destructive/5"
                onClick={() => triggerAlarm('loud')}
              >
                <div className="bg-destructive/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Volume2 size={48} />
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold block">Loud Alarm</span>
                  <span className="text-sm font-normal opacity-70">Immediate deterrence</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden group hover:border-primary transition-all">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-40 flex flex-col gap-4 text-primary hover:bg-primary/5"
                onClick={() => triggerAlarm('silent')}
              >
                <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <EyeOff size={48} />
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold block">Silent Alarm</span>
                  <span className="text-sm font-normal opacity-70">Discreet escalation</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {!user && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">You need to be signed in to trigger alarms.</p>
              <Button size="sm" variant="outline" onClick={() => {/* Sign in logic would go here */}}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-primary px-1">Safety Status</h2>
          <Card className="bg-white/50 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium">Monitoring active</p>
                <p className="text-xs text-muted-foreground">Location sharing available for silent alarm.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Navigation />
    </div>
  );
}
