import * as firebaseApp from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Production Configuration
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

// Use type casting to handle potential type definition mismatches with initializeApp
const app = (firebaseApp as any).initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);