"use client";

import { useState, useEffect } from 'react';
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
  Heart,
  Pencil,
  Smartphone,
  Camera
} from 'lucide-react';
import { 
  useUser, 
  useFirestore, 
  useAuth,
  useCollection, 
  useMemoFirebase, 
  addDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  setDocumentNonBlocking
} from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactRelationship, setEditContactRelationship] = useState('');

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'trustedContacts'));
  }, [firestore, user]);

  const { data: contacts, isLoading: isContactsLoading } = useCollection(contactsQuery);

  useEffect(() => {
    if (user && isProfileDialogOpen) {
      setEditDisplayName(user.displayName || '');
      setEditPhotoURL(user.photoURL || '');
    }
  }, [user, isProfileDialogOpen]);

  const handleUpdateProfile = async () => {
    if (!user || !auth) return;

    setIsProfileSubmitting(true);
    try {
      await updateProfile(user, {
        displayName: editDisplayName,
        photoURL: editPhotoURL,
      });
      
      if (firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userRef, {
          id: user.uid,
          displayName: editDisplayName,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      toast({
        title: "Profile Updated",
        description: "Your safety profile has been updated successfully.",
      });
      setIsProfileDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

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

    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelationship('');
    setIsAddDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleImportFromPhone = async () => {
    const isSupported = 'contacts' in navigator && 'ContactsManager' in window;

    if (!isSupported) {
      toast({
        title: "Feature Unavailable",
        description: "Your current browser doesn't support direct contact importing yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      const props = ['name', 'tel'];
      const opts = { multiple: false };
      
      // @ts-ignore
      const selectedContacts = await navigator.contacts.select(props, opts);
      
      if (selectedContacts && selectedContacts.length > 0) {
        const contact = selectedContacts[0];
        const name = contact.name?.[0] || 'Unknown';
        const phone = contact.tel?.[0] || '';

        if (user && firestore && phone) {
          const contactsRef = collection(firestore, 'users', user.uid, 'trustedContacts');
          addDocumentNonBlocking(contactsRef, {
            userProfileId: user.uid,
            name: name,
            phoneNumber: phone,
            relationship: 'Other',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          toast({
            title: "Contact Imported",
            description: `${name} has been added to your safety circle.`,
          });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast({ title: "Import Failed", variant: "destructive" });
      }
    }
  };

  const handleEditClick = (contact: any) => {
    setEditingContactId(contact.id);
    setEditContactName(contact.name);
    setEditContactPhone(contact.phoneNumber);
    setEditContactRelationship(contact.relationship);
    setIsEditDialogOpen(true);
  };

  const handleUpdateContact = () => {
    if (!user || !firestore || !editingContactId || !editContactName || !editContactPhone) return;

    setIsSubmitting(true);
    const contactRef = doc(firestore, 'users', user.uid, 'trustedContacts', editingContactId);
    
    updateDocumentNonBlocking(contactRef, {
      name: editContactName,
      phoneNumber: editContactPhone,
      relationship: editContactRelationship || 'Other',
      updatedAt: new Date().toISOString(),
    });

    toast({ title: "Contact Updated" });
    setIsEditDialogOpen(false);
    setEditingContactId(null);
    setIsSubmitting(false);
  };

  const handleDeleteContact = (contactId: string, name: string) => {
    if (!user || !firestore) return;
    const contactRef = doc(firestore, 'users', user.uid, 'trustedContacts', contactId);
    deleteDocumentNonBlocking(contactRef);
    toast({ title: "Contact Removed" });
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen pb-24 md:pl-20 md:pb-12 bg-background font-body pt-12">
      <Navigation />
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Personalize your safety companion.</p>
        </header>

        <section className="space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-[2rem]">
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
                  <Avatar className="h-20 w-20 border-2 border-primary/10 shadow-xl">
                    <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200`} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-lg">{user.displayName || 'Authenticated User'}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary font-bold">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-[2rem]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Pencil className="text-primary" size={20} />
                            Update Profile
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2 text-center flex flex-col items-center">
                            <Avatar className="h-24 w-24 border-4 border-primary/5 mb-2">
                              <AvatarImage src={editPhotoURL || user.photoURL || ''} />
                              <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="display-name">Display Name</Label>
                            <Input id="display-name" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="photo-url" className="flex items-center gap-2">
                              <Camera size={14} /> Profile Image URL
                            </Label>
                            <Input id="photo-url" value={editPhotoURL} onChange={(e) => setEditPhotoURL(e.target.value)} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="w-full rounded-2xl font-bold py-7 shadow-xl shadow-primary/10" onClick={handleUpdateProfile} disabled={isProfileSubmitting || !editDisplayName}>
                            {isProfileSubmitting ? <Loader2 className="animate-spin" /> : "Save Profile"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Trusted Contacts
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-primary font-bold gap-1 rounded-full px-3" onClick={handleImportFromPhone}>
                  <Smartphone size={16} />
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-primary font-bold rounded-full px-3">
                      <Plus size={20} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-[2rem]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="text-primary" size={20} />
                        Add Contact
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Input id="relationship" value={newContactRelationship} onChange={(e) => setNewContactRelationship(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full rounded-2xl font-bold py-7 shadow-xl" onClick={handleAddContact} disabled={isSubmitting || !newContactName || !newContactPhone}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Contact"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isContactsLoading ? (
                <div className="flex justify-center p-6"><Loader2 className="animate-spin text-primary" /></div>
              ) : contacts && contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl text-primary"><Heart size={20} /></div>
                        <div>
                          <p className="text-sm font-bold">{contact.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone size={10} /> {contact.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(contact)}><Pencil size={18} /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 size={18} /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Contact?</AlertDialogTitle>
                              <AlertDialogDescription>Remove {contact.name} from your safety circle?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteContact(contact.id, contact.name)} className="bg-destructive text-white hover:bg-destructive/90 rounded-2xl">Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-12 rounded-3xl text-center border-2 border-dashed border-muted">
                  <p className="text-sm text-muted-foreground font-medium">No contacts added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem]">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock size={20} className="text-primary" /> Security & Duress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label className="font-bold">Duress Passcode</Label><p className="text-xs text-muted-foreground">Quietly escalates while appearing to stop.</p></div>
                <Button variant="outline" size="sm" className="rounded-full">Set Code</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div><Label className="font-bold">Biometric Auth</Label><p className="text-xs text-muted-foreground">Use FaceID to unlock.</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
