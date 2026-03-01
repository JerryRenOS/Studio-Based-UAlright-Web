
"use client";

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, EyeOff, ShieldCheck, LogOut, LogIn, Loader2, Mail, Lock } from 'lucide-react';
import { useFirestore, useUser, useAuth, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { silentAlarmDispatch } from '@/ai/flows/silent-alarm-dispatch-flow';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const syncUserProfile = (firebaseUser: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', firebaseUser.uid);
    setDocumentNonBlocking(userRef, {
      id: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'User',
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber || 'Not provided',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, { merge: true });
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      syncUserProfile(result.user);
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

  const handleEmailAuth = async (mode: 'signin' | 'signup') => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsAuthLoading(true);
    try {
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        syncUserProfile(result.user);
        toast({
          title: "Account Created",
          description: "Welcome! Your safety profile is ready.",
        });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        syncUserProfile(result.user);
        toast({
          title: "Signed In",
          description: "Welcome back to UAlright.",
        });
      }
    } catch (error: any) {
      toast({
        title: mode === 'signup' ? "Registration Failed" : "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
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

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          saveIncident(type, latitude, longitude);
        },
        (error) => {
          toast({
            title: "Location Access Required",
            description: "We couldn't get your location. Triggering with placeholder data.",
            variant: "destructive",
          });
          saveIncident(type, 0, 0);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      saveIncident(type, 0, 0);
    }
  };

  const saveIncident = async (type: 'loud' | 'silent', lat: number, lng: number) => {
    if (!user || !firestore) return;

    const incidentData = {
      userProfileId: user.uid,
      incidentType: type === 'loud' ? 'LoudAlarm' : 'SilentAlarm',
      status: 'active',
      triggerTime: new Date().toISOString(),
      currentLocationLatitude: lat,
      currentLocationLongitude: lng,
      currentLocationTimestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    const incidentsRef = collection(firestore, 'users', user.uid, 'incidents');
    const incidentDocRef = doc(incidentsRef);
    const incidentId = incidentDocRef.id;

    // Use non-blocking set for optimistic UI
    setDocumentNonBlocking(incidentDocRef, incidentData, { merge: true });

    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Alarm Triggered`,
      description: type === 'loud' 
        ? "Deterrence activated. Contacts will be notified if not resolved."
        : "Silent alert initiated. Your location is being shared with trusted contacts.",
      variant: type === 'loud' ? "destructive" : "default",
    });

    // For silent alarms, proceed with Twilio dispatch
    if (type === 'silent') {
      try {
        // 1. Fetch active trusted contacts
        const contactsSnap = await getDocs(collection(firestore, 'users', user.uid, 'trustedContacts'));
        const activeContacts = contactsSnap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(c => c.isActive);

        if (activeContacts.length === 0) {
          toast({
            title: "No Contacts Configured",
            description: "Go to Settings to add trusted contacts for silent alerts.",
            variant: "destructive",
          });
          return;
        }

        // 2. Fetch safety profile for customized message
        const safetySnap = await getDoc(doc(firestore, 'users', user.uid, 'safetyProfile', 'safetyProfile'));
        const safetyData = safetySnap.data();
        const messageTemplate = safetyData?.defaultSmsTemplate || "I have triggered a silent safety alarm. I am feeling unsafe and need you to check on me immediately.";

        // 3. Dispatch Twilio alerts
        const locationUrl = lat !== 0 ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;
        
        const dispatchResult = await silentAlarmDispatch({
          contacts: activeContacts.map(c => ({
            id: c.id,
            name: c.name,
            phoneNumber: c.phoneNumber
          })),
          message: messageTemplate,
          userName: user.displayName || "A user",
          locationUrl,
        });

        // 4. Record IncidentActions in Firestore (Non-blocking)
        const actionsRef = collection(firestore, 'users', user.uid, 'incidents', incidentId, 'incidentActions');
        dispatchResult.results.forEach(res => {
          addDocumentNonBlocking(actionsRef, {
            incidentId,
            userProfileId: user.uid,
            actionType: 'notificationSent',
            actionTime: new Date().toISOString(),
            targetContactId: res.contactId,
            outcome: (res.smsSuccess || res.callSuccess) ? 'success' : 'failure',
            errorMessage: res.error || null,
          });
        });

        if (dispatchResult.results.some(r => r.smsSuccess || r.callSuccess)) {
          toast({
            title: "Alerts Dispatched",
            description: "Your trusted contacts have been notified via SMS and Voice Call.",
          });
        }
      } catch (err: any) {
        console.error("Alert dispatch failed", err);
        toast({
          title: "Dispatch Error",
          description: "There was a problem sending alerts to some contacts.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pl-24 md:pb-0 font-body bg-background">
      <div className="p-6 max-w-2xl mx-auto space-y-12 flex flex-col items-center">
        <header className="w-full flex justify-between items-center pt-8">
          <div className="text-left">
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

        <div className="w-full space-y-8 flex flex-col items-center max-w-md">
          <Card className="w-full border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all bg-white ring-1 ring-destructive/5">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-56 flex flex-col gap-4 hover:bg-destructive/5"
                onClick={() => triggerAlarm('loud')}
                disabled={isUserLoading}
              >
                <div className="bg-destructive/10 p-4 rounded-full text-destructive group-hover:bg-destructive/20 transition-colors">
                  <Volume2 size={36} />
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold block text-destructive">Loud Alarm</span>
                  <span className="text-sm font-normal text-destructive/60 font-medium">Immediate deterrence</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all bg-white ring-1 ring-primary/5">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-56 flex flex-col gap-4 hover:bg-primary/5"
                onClick={() => triggerAlarm('silent')}
                disabled={isUserLoading}
              >
                <div className="bg-primary/10 p-4 rounded-full text-primary group-hover:bg-primary/20 transition-colors">
                  <EyeOff size={36} />
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold block text-primary font-headline">Silent Alarm</span>
                  <span className="text-sm font-normal text-primary/60 font-medium tracking-tight">Discreet escalation</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        <section className="w-full space-y-4 max-w-md pt-4">
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
          <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-primary">Secure Access</CardTitle>
              <CardDescription>Sign in to activate monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                </TabsList>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <TabsContent value="signin" className="mt-6">
                  <Button 
                    className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
                    onClick={() => handleEmailAuth('signin')}
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-6">
                  <Button 
                    className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
                    onClick={() => handleEmailAuth('signup')}
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-muted" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-muted" />
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl flex gap-3 text-base font-bold border-2 hover:bg-muted/10 transition-colors"
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <Navigation />
    </div>
  );
}
