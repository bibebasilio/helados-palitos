// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// : Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


/// esto agregue
  const firebaseConfig = {
  apiKey: "AIzaSyC8rtZXN4OfUQBPVOH6pmoiB6pN-gHlh7w",
  authDomain: "api-rest-node-7cd3f.firebaseapp.com",
  projectId: "api-rest-node-7cd3f",
  storageBucket: "api-rest-node-7cd3f.firebasestorage.app",
  messagingSenderId: "457504115785",
  appId: "1:457504115785:web:76ec685b195aa220228398"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/// hasta aca */


// / Your web app's Firebase configuration
 /* const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROYECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig); */

// Initializa Firestore
const db = getFirestore(app);

export { db };

