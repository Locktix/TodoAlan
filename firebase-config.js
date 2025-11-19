/**
 * Configuration Firebase
 * 
 * Pour activer la synchronisation :
 * 1. Allez sur https://console.firebase.google.com/
 * 2. Créez un nouveau projet (gratuit)
 * 3. Activez Firestore Database
 * 4. Dans Settings → General, copiez les valeurs ci-dessous
 * 5. Remplacez les valeurs dans ce fichier
 * 6. Dans Firestore Rules, mettez :
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /users/{userId}/{document=**} {
 *          allow read, write: if request.auth != null && request.auth.uid == userId;
 *        }
 *      }
 *    }
 */

// ⚠️ REMPLACEZ CES VALEURS PAR LES VÔTRES
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// Si vous n'utilisez pas Firebase, laissez ce fichier vide
// L'application fonctionnera toujours avec localStorage uniquement

