import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Database, Cloud, Lock } from 'lucide-react';

export default function BlueprintPage() {
  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-12 bg-background font-body pt-12">
      <Navigation />
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">System Architecture</h1>
          <p className="text-muted-foreground">Firebase-first safety backend design for UAlright.</p>
        </header>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full bg-muted/50 grid grid-cols-2 md:grid-cols-5 h-auto rounded-2xl p-1">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="data">Data Model</TabsTrigger>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="plan">Build Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <ProductCard 
                icon={<Shield className="text-primary" />}
                title="Firebase Auth"
                desc="Phone + Email. Justification: Low-friction onboarding (Phone) + recovery option (Email)."
              />
              <ProductCard 
                icon={<Database className="text-primary" />}
                title="Firestore"
                desc="Real-time document storage for incidents and location breadcrumbs."
              />
              <ProductCard 
                icon={<Cloud className="text-primary" />}
                title="Cloud Storage"
                desc="Storing staged call audio/video assets with signed URL delivery."
              />
              <ProductCard 
                icon={<Lock className="text-primary" />}
                title="App Check"
                desc="Critical for abuse prevention in high-risk SMS/Alarm operations."
              />
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
              <CardContent className="pt-6">
                <pre className="text-xs bg-muted p-4 rounded-xl overflow-x-auto text-primary font-mono">
{`{
  "users": {
    "uid": { "name": "...", "phone": "...", "safetySettings": { "smsTemplate": "..." } }
  },
  "trustedContacts": {
    "id": { "userId": "uid", "name": "...", "phone": "...", "priority": 1 }
  },
  "incidents": {
    "id": { 
      "type": "loud|silent|staged", 
      "status": "active|resolved",
      "location": { "lat": 0, "lng": 0 },
      "duressTriggered": false,
      "createdAt": "timestamp"
    }
  },
  "locationBreadcrumbs": {
    "id": { "incidentId": "id", "pos": "...", "t": "timestamp" }
  }
}`}
                </pre>
                <div className="mt-4 text-sm text-muted-foreground">
                  <strong>TTL Strategy:</strong> Automatic deletion of breadcrumbs after 7 days for privacy.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="functions" className="mt-6">
            <div className="space-y-4">
              <FunctionItem title="triggerSilentAlarm" trigger="Callable" logic="Fetches contacts, sends first SMS via Twilio, starts location tracking." />
              <FunctionItem title="sendSmsToContacts" trigger="Trigger" logic="Invoked by incident document changes; handles Twilio retries." />
              <FunctionItem title="handleDuressResolution" trigger="Callable" logic="If passcode matches 'duress' hash, mark incident as 'silent escalation' instead of resolved." />
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4">
                  <Lock className="text-destructive shrink-0" />
                  <div>
                    <h3 className="font-bold">Privacy First</h3>
                    <p className="text-sm text-muted-foreground">Location data is ONLY readable by the user and specific Cloud Functions during an active incident. No cross-user access.</p>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-xl text-xs font-mono">
                  {`allow read, write: if request.auth.uid == userId;`}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-white p-4 rounded-2xl shadow-sm">
                <div className="bg-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shrink-0">1</div>
                <div><h4 className="font-bold">Core Infrastructure</h4><p className="text-sm text-muted-foreground">Auth setup & Firestore schema definition.</p></div>
              </div>
              <div className="flex gap-4 items-start bg-white p-4 rounded-2xl shadow-sm">
                <div className="bg-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shrink-0">2</div>
                <div><h4 className="font-bold">Triggers</h4><p className="text-sm text-muted-foreground">Implement Loud & Silent alarm Logic in Cloud Functions.</p></div>
              </div>
              <div className="flex gap-4 items-start bg-white p-4 rounded-2xl shadow-sm">
                <div className="bg-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shrink-0">3</div>
                <div><h4 className="font-bold">Twilio Integration</h4><p className="text-sm text-muted-foreground">SMS bridge with secret management.</p></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-none rounded-[2rem]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function FunctionItem({ title, trigger, logic }: { title: string, trigger: string, logic: string }) {
  return (
    <div className="border-l-4 border-primary pl-4 py-4 bg-white shadow-sm rounded-r-[2rem] rounded-l-md">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-bold text-primary">{title}</h4>
        <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono font-bold uppercase">{trigger}</span>
      </div>
      <p className="text-sm text-muted-foreground">{logic}</p>
    </div>
  );
}
