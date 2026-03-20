"use client";

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { collection, serverTimestamp, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { silentAlarmDispatch } from '@/ai/flows/silent-alarm-dispatch-flow';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function AppPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  const waitlistQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(collection(firestore, 'waitlist'), where('email', '==', user.email));
  }, [firestore, user?.email]);

  const { data: waitlistEntries, isLoading: isWaitlistLoading } = useCollection(waitlistQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
      return;
    }

    if (!isUserLoading && !isWaitlistLoading && waitlistEntries) {
      const entry = waitlistEntries[0];
      if (entry?.approved === true) {
        setIsApproved(true);
      }
      setIsCheckingAccess(false);
    }
  }, [user, isUserLoading, waitlistEntries, isWaitlistLoading, router]);

  const triggerAlarm = (type: 'loud' | 'silent') => {
    if (!user) return;
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
            description: "Defaulting to placeholder coordinates.",
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

    setDocumentNonBlocking(incidentDocRef, incidentData, { merge: true });

    toast({
      title: `${type === 'loud' ? 'Loud' : 'Silent'} Alarm Active`,
      description: type === 'loud' 
        ? "Emergency audio activated."
        : "Silent notification sent to contacts.",
      variant: type === 'loud' ? "destructive" : "default",
    });

    if (type === 'silent') {
      try {
        const contactsSnap = await getDocs(collection(firestore, 'users', user.uid, 'trustedContacts'));
        const activeContacts = contactsSnap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(c => c.isActive);

        if (activeContacts.length > 0) {
          const safetySnap = await getDoc(doc(firestore, 'users', user.uid, 'safetyProfile', 'safetyProfile'));
          const messageTemplate = safetySnap.data()?.defaultSmsTemplate || "I have triggered a silent alarm. Check on me.";
          const locationUrl = lat !== 0 ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;
          
          const dispatchResult = await silentAlarmDispatch({
            contacts: activeContacts.map(c => ({ id: c.id, name: c.name, phoneNumber: c.phoneNumber })),
            message: messageTemplate,
            userName: user.displayName || "A user",
            locationUrl,
          });

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
        }
      } catch (err) {
        console.error("Dispatch failed", err);
      }
    }
  };

  if (isUserLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-background px-6 flex flex-col items-center justify-center text-center space-y-4">
        <Navigation />
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm">
          <ShieldCheck className="mx-auto text-primary mb-4" size={48} />
          <h1 className="text-2xl font-bold text-foreground">Access Pending</h1>
          <p className="text-muted-foreground">Your account is not approved yet. We'll notify you when the beta launches.</p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-12 bg-background font-body px-6 pt-12">
      <Navigation />
      <div className="max-w-md mx-auto space-y-12 flex flex-col items-center">
        <header className="w-full text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Safety Center</h1>
          <p className="text-muted-foreground font-medium">Immediate deterrents and discreet help.</p>
        </header>

        <div className="grid grid-cols-1 gap-12 w-full justify-items-center">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => triggerAlarm('loud')}
              className="w-48 h-48 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_60px_rgba(239,68,68,0.2)] transition-all active:scale-95 flex items-center justify-center group"
            >
              <div className="bg-destructive/10 p-8 rounded-full text-destructive group-hover:bg-destructive/20 transition-colors">
                <Volume2 size={48} />
              </div>
            </button>
            <div className="text-center">
              <span className="text-xl font-bold block text-foreground">Loud Alarm</span>
              <span className="text-sm font-medium text-muted-foreground">Immediate deterrent</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => triggerAlarm('silent')}
              className="w-48 h-48 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_60px_rgba(14,165,233,0.2)] transition-all active:scale-95 flex items-center justify-center group"
            >
              <div className="bg-primary/10 p-8 rounded-full text-primary group-hover:bg-primary/20 transition-colors">
                <EyeOff size={48} />
              </div>
            </button>
            <div className="text-center">
              <span className="text-xl font-bold block text-foreground">Silent Alarm</span>
              <span className="text-sm font-medium text-muted-foreground">Discreet escalation</span>
            </div>
          </div>
        </div>

        <Card className="w-full border-none shadow-lg bg-white/80 backdrop-blur-md rounded-[2rem]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            <div className="flex-1">
              <p className="text-base font-bold">Monitoring Active</p>
              <p className="text-xs text-muted-foreground font-medium">GPS breadcrumbs ready for dispatch.</p>
            </div>
            <ShieldCheck className="text-primary/40" size={24} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
