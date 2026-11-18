// src/online/firebase.js
//
// Connexion au projet Firebase (base temps réel + identification anonyme).
// Ces clés ne sont pas secrètes : elles disent juste à l'app quel projet
// utiliser. La sécurité est assurée par les règles de la base
// (cf. database.rules.json).

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCI7l-gnV4fA5__MdHj1ja7IwtOFpzGom8',
  authDomain: 'samplee-a7aef.firebaseapp.com',
  databaseURL:
    'https://samplee-a7aef-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'samplee-a7aef',
  storageBucket: 'samplee-a7aef.firebasestorage.app',
  messagingSenderId: '943918489893',
  appId: '1:943918489893:web:820db9f1cef1b2c110facc',
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

let signInPromise = null;

/**
 * Identifie l'appareil de façon anonyme (aucun compte demandé au joueur).
 * L'identifiant est conservé par le navigateur : un joueur qui recharge
 * la page garde le même identifiant et retrouve sa place dans la partie.
 * Retourne l'uid.
 */
export function ensureSignedIn() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser.uid);

  if (!signInPromise) {
    signInPromise = new Promise((resolve, reject) => {
      // On attend que Firebase ait relu une éventuelle session existante
      // avant de décider d'en créer une nouvelle.
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        try {
          if (user) {
            resolve(user.uid);
          } else {
            const cred = await signInAnonymously(auth);
            resolve(cred.user.uid);
          }
        } catch (err) {
          signInPromise = null;
          reject(err);
        }
      });
    });
  }

  return signInPromise;
}
