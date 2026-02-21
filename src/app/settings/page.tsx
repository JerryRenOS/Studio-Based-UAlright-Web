import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 bg-background font-body">
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Personalize your safety companion.</p>
        </header>

        <section className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User size={20} className="text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-primary/10">
                <AvatarImage src="https://picsum.photos/seed/u1/200" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <h3 className="font-bold">Jane Doe</h3>
                <p className="text-sm text-muted-foreground">jane.doe@example.com</p>
                <Button variant="link" size="sm" className="p-0 h-auto text-primary">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Trusted Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContactItem name="Mom" phone="+1 (555) 001" />
              <ContactItem name="Mark (Partner)" phone="+1 (555) 002" />
              <Separator />
              <Button variant="outline" className="w-full border-dashed">
                Add New Contact
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Security & Duress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Duress Passcode</Label>
                  <p className="text-xs text-muted-foreground italic">Quietly escalates while appearing to stop.</p>
                </div>
                <Button variant="outline" size="sm">Set Code</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Biometric Auth</Label>
                  <p className="text-xs text-muted-foreground">Use FaceID to unlock the app.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Confirmation Calls</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>System Alerts</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Navigation />
    </div>
  );
}

function ContactItem({ name, phone }: { name: string, phone: string }) {
  return (
    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
      <div>
        <p className="text-sm font-bold">{name}</p>
        <p className="text-xs text-muted-foreground">{phone}</p>
      </div>
      <Button variant="ghost" size="sm" className="text-muted-foreground">Manage</Button>
    </div>
  );
}
