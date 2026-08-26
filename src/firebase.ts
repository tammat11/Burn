import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Тот же Firebase-проект (burn-b365c), что использует Flutter-клиент —
// см. flutter_app/lib/firebase_options.dart (Web-конфиг).
const firebaseConfig = {
  apiKey: "AIzaSyCM4ovpj4tw2zERcLCkzB1tCb3U4Il3mFU",
  authDomain: "burn-b365c.firebaseapp.com",
  projectId: "burn-b365c",
  storageBucket: "burn-b365c.firebasestorage.app",
  messagingSenderId: "643405050062",
  appId: "1:643405050062:web:fb9a9318c11f0fca5a209f",
  measurementId: "G-QXEY73281P",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
