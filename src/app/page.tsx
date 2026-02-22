
"use client";

import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, EyeOff, ShieldCheck, LogOut, LogIn, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
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
      userProfileId: user.uid,
      incidentType: type === 'loud' ? 'LoudAlarm' : 'SilentAlarm',
      status: 'active',
      triggerTime: new Date().toISOString(),
      currentLocationLatitude: 0,
      currentLocationLongitude: 0,
      currentLocationTimestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    const incidentsRef = collection(firestore, 'users', user.uid, 'incidents');

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
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}/incidents`,
          operation: 'create',
          requestResourceData: incidentData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 font-body bg-background">
      <div className="p-6 max-w-2xl mx-auto space-y-12">
        <header className="flex justify-between items-center pt-8">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">UAlright?</h1>
            <p className="text-muted-foreground mt-1">Stay safe, stay connected.</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut size={20} className="text-muted-foreground" />
              </Button>
            )}
            <div className="bg-primary/10 p-2 rounded-full shadow-sm">
              <ShieldCheck className="text-primary" size={28} />
            </div>
          </div>
        </header>

        <div className="space-y-6 flex flex-col items-center">
          <Card className="w-full max-w-md border-none shadow-xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-48 flex flex-col gap-3 hover:bg-destructive/5"
                onClick={() => triggerAlarm('loud')}
                disabled={isUserLoading}
              >
                <div className="bg-destructive/10 p-3 rounded-full text-destructive">
                  <Volume2 size={32} />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold block text-destructive">Loud Alarm</span>
                  <span className="text-sm font-normal text-destructive/60">Immediate deterrence</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md border-none shadow-xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-48 flex flex-col gap-3 hover:bg-primary/5"
                onClick={() => triggerAlarm('silent')}
                disabled={isUserLoading}
              >
                <div className="bg-muted p-3 rounded-full text-muted-foreground">
                  <EyeOff size={32} />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold block text-primary">Silent Alarm</span>
                  <span className="text-sm font-normal text-muted-foreground">Discreet escalation</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-primary px-2">Safety Status</h2>
          <Card className="border-none shadow-lg bg-white/70 backdrop-blur-md rounded-2xl">
            <CardContent className="p-6 flex items-center gap-4">
              {isUserLoading ? (
                <Loader2 className="animate-spin text-primary" size={24} />
              ) : (
                <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-amber-400'}`} />
              )}
              <div className="flex-1">
                <p className="text-base font-bold">
                  {isUserLoading ? 'Connecting...' : user ? 'Monitoring active' : 'Awaiting sign-in'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isUserLoading 
                    ? 'Verifying your security status...' 
                    : user 
                      ? 'Location sharing ready for silent alarm.' 
                      : 'Sign in to enable location sharing services.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {!user && !isUserLoading && (
          <div className="flex flex-col items-center pt-8">
            <Button className="w-full max-w-sm rounded-full py-6 flex gap-2 font-bold shadow-lg" onClick={handleSignIn}>
              <LogIn size={20} />
              Sign In with Google
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Secure Access Required</p>
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}
