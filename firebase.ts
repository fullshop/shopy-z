import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkA6n4q-7suEICnRZcrgAnBtZ2bwrQyL8",
  authDomain: "shopyz-f79d0.firebaseapp.com",
  databaseURL: "https://shopyz-f79d0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shopyz-f79d0",
  storageBucket: "shopyz-f79d0.firebasestorage.app",
  messagingSenderId: "285467474064",
  appId: "1:285467474064:web:edd188f5ef255d49988015",
  measurementId: "G-GQMVD6ELFE"
};

// Ensure app is initialized exactly once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getDatabase(app);
export const auth = getAuth(app);