"use client";

import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Bell, User as UserIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-0 bg-background font-body">
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Personalize your safety companion.</p>
        </header>

        <section className="space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon size={20} className="text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              {isUserLoading ? (
                <div className="h-20 w-20 rounded-full bg-muted/50 animate-pulse flex items-center justify-center">
                  <Loader2 className="animate-spin text-muted-foreground/30" size={24} />
                </div>
              ) : user ? (
                <>
                  <Avatar className="h-20 w-20 border-2 border-primary/10 shadow-sm">
                    <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200`} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-lg">{user.displayName || 'Authenticated User'}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary font-bold">Edit Profile</Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 py-4 text-center">
                  <p className="text-sm text-muted-foreground italic">Sign in to view and manage your profile.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Trusted Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl text-center border-2 border-dashed border-muted">
                <p className="text-sm text-muted-foreground font-medium">No contacts added yet</p>
                <Button variant="link" size="sm" className="mt-1 text-primary">Import from phone</Button>
              </div>
              <Button variant="outline" className="w-full rounded-xl font-bold py-6">
                Add New Contact
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Security & Duress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-bold">Duress Passcode</Label>
                  <p className="text-xs text-muted-foreground italic">Quietly escalates while appearing to stop.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">Set Code</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-bold">Biometric Auth</Label>
                  <p className="text-xs text-muted-foreground">Use FaceID to unlock the app.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Confirmation Calls</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">System Alerts</Label>
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
