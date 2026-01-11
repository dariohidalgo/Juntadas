// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRfs7x6HmWPGiSWCWz2LaTJKAqdvZ9AMc",
    authDomain: "juntadas-73888.firebaseapp.com",
    projectId: "juntadas-73888",
    storageBucket: "juntadas-73888.firebasestorage.app",
    messagingSenderId: "1028462492534",
    appId: "1:1028462492534:web:22cc6f65b12ecdb4a79857",
    measurementId: "G-L1KB03WYR7"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
