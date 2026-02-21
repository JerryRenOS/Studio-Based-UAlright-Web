"use client";

import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, EyeOff, ShieldCheck, LogOut, LogIn } from 'lucide-react';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Signed In",
        description: "Welcome to UAlright. Your safety monitoring is now active.",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 font-body bg-background">
      <div className="p-6 max-w-lg mx-auto space-y-8">
        <header className="flex justify-between items-center pt-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">UAlright?</h1>
            <p className="text-muted-foreground">Stay safe, stay connected.</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut size={20} className="text-muted-foreground" />
              </Button>
            )}
            <div className="bg-accent/20 p-2 rounded-full">
              <ShieldCheck className="text-primary" size={32} />
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          <Card className="border-2 border-destructive/20 shadow-lg overflow-hidden group hover:border-destructive transition-all">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-40 flex flex-col gap-4 text-destructive hover:bg-destructive/5"
                onClick={() => triggerAlarm('loud')}
                disabled={loading}
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
                disabled={loading}
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

        {!user && !loading && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-bold">Secure Access Required</p>
                <p className="text-xs text-muted-foreground">Sign in to activate incident reporting and trusted contact alerts.</p>
              </div>
              <Button className="w-full flex gap-2" onClick={handleSignIn}>
                <LogIn size={18} />
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-primary px-1">Safety Status</h2>
          <Card className="bg-white/50 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {user ? 'Monitoring active' : 'Awaiting sign-in'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user ? 'Location sharing ready for silent alarm.' : 'Sign in to enable location sharing services.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Navigation />
    </div>
  );
}
