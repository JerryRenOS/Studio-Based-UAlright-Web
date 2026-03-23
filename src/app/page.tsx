"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, Sparkles, Volume2, EyeOff } from 'lucide-react';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to join the waitlist.",
        variant: "destructive",
      });
      return;
    }

    if (!firestore) return;

    setIsSubmitting(true);
    try {
      const waitlistRef = doc(firestore, 'waitlist', email.toLowerCase());
      setDocumentNonBlocking(waitlistRef, {
        email: email.toLowerCase(),
        createdAt: new Date().toISOString(),
        approved: false,
      }, { merge: true });

      setIsJoined(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you when the beta launches.",
      });
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center space-y-16">
        
        {/* Hero Section */}
        <header className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-4">
            <ShieldCheck className="text-primary" size={18} />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Now in Private Beta</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-headline font-bold text-foreground tracking-tighter leading-tight">
            UAlright? <br />
            <span className="text-primary">Safety</span> reimagined.
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto font-medium">
            Your trust-based companion for emergency deterrents, silent escalations, and AI-powered cover stories.
          </p>
        </header>

        {/* Signup Form */}
        <Card className="w-full max-w-md border-none shadow-[0_32px_64px_rgba(0,0,0,0.08)] rounded-[3rem] bg-white p-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <CardContent className="p-8 space-y-8">
            {isJoined ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold">You're on the waitlist.</h2>
                <p className="text-muted-foreground font-medium">We'll notify you as soon as your access is granted.</p>
                <Button variant="outline" className="mt-8 rounded-2xl w-full py-6 font-bold" onClick={() => router.push('/app')}>
                  Member Login
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Join the waitlist</h2>
                  <p className="text-sm text-muted-foreground">Be the first to access UAlright when we launch.</p>
                </div>
                <form onSubmit={handleJoinWaitlist} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-14 rounded-2xl bg-muted/30 border-none px-6 focus-visible:ring-primary font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Request Access"}
                  </Button>
                </form>
                <div className="pt-4">
                  <Button variant="ghost" className="text-muted-foreground text-sm font-bold hover:bg-transparent hover:text-primary transition-colors" onClick={() => router.push('/app')}>
                    Already a member? Sign in
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Feature Teasers */}
        <div className="grid md:grid-cols-3 gap-8 w-full pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <FeatureTeaser 
            icon={<Volume2 className="text-destructive" />} 
            title="Loud Alarm" 
            desc="Immediate audible deterrence for high-risk situations." 
          />
          <FeatureTeaser 
            icon={<EyeOff className="text-primary" />} 
            title="Silent Alert" 
            desc="Discreet SMS & Voice alerts with live location tracking." 
          />
          <FeatureTeaser 
            icon={<Sparkles className="text-amber-500" />} 
            title="AI Co-pilot" 
            desc="Contextual staged calls and scripts for social cover." 
          />
        </div>
      </div>
    </div>
  );
}

function FeatureTeaser({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="text-center space-y-4 p-6 hover:bg-white/50 rounded-3xl transition-colors">
      <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto ring-1 ring-black/5">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
