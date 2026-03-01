"use client";

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Lock, 
  Bell, 
  User as UserIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  Phone, 
  UserPlus, 
  Heart 
} from 'lucide-react';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  addDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Form State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Contacts
  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'trustedContacts'));
  }, [firestore, user]);

  const { data: contacts, isLoading: isContactsLoading } = useCollection(contactsQuery);

  const handleAddContact = () => {
    if (!user || !firestore || !newContactName || !newContactPhone) return;

    setIsSubmitting(true);
    const contactsRef = collection(firestore, 'users', user.uid, 'trustedContacts');
    
    const contactData = {
      userProfileId: user.uid,
      name: newContactName,
      phoneNumber: newContactPhone,
      relationship: newContactRelationship || 'Other',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDocumentNonBlocking(contactsRef, contactData);

    toast({
      title: "Contact Added",
      description: `${newContactName} has been added to your trusted contacts.`,
    });

    // Reset and close
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelationship('');
    setIsAddDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleDeleteContact = (contactId: string, name: string) => {
    if (!user || !firestore) return;

    const contactRef = doc(firestore, 'users', user.uid, 'trustedContacts', contactId);
    deleteDocumentNonBlocking(contactRef);

    toast({
      title: "Contact Removed",
      description: `${name} is no longer a trusted contact.`,
    });
  };

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
          {/* Profile Card */}
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

          {/* Trusted Contacts Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Trusted Contacts
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary font-bold gap-1">
                    <Plus size={16} /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="text-primary" size={20} />
                      Add Trusted Contact
                    </DialogTitle>
                    <DialogDescription>
                      This person will be notified during silent or loud alarms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Jane Doe" 
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="+1 (555) 000-0000" 
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input 
                        id="relationship" 
                        placeholder="e.g. Sister, Friend, Partner" 
                        value={newContactRelationship}
                        onChange={(e) => setNewContactRelationship(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="w-full rounded-xl font-bold py-6"
                      onClick={handleAddContact}
                      disabled={isSubmitting || !newContactName || !newContactPhone}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Contact"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {isContactsLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : contacts && contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                          <Heart size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold">{contact.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone size={10} /> {contact.phoneNumber} • {contact.relationship}
                          </p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Trusted Contact?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {contact.name} from your safety circle. They will no longer be notified during emergencies.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteContact(contact.id, contact.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-8 rounded-2xl text-center border-2 border-dashed border-muted">
                  <Users className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                  <p className="text-sm text-muted-foreground font-medium">No contacts added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add people you trust to be notified in emergencies.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Duress Card */}
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

          {/* Notifications Card */}
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
