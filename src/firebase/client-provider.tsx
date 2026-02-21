'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebase, setFirebase] = useState<{
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const { firebaseApp, firestore, auth } = initializeFirebase();
    setFirebase({ firebaseApp, firestore, auth });
  }, []);

  if (!firebase) return null;

  return (
    <FirebaseProvider
      firebaseApp={firebase.firebaseApp}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
