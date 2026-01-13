// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Polyfill localStorage for Native to avoid Firebase errors
if (Platform.OS !== 'web') {
    // @ts-ignore
    global.localStorage = {
        getItem: (key: string) => {
            // We don't actually need it to work perfectly synchronously for Firebase Auth 
            // if we use initializeAuth, but this prevents the crash.
            return null;
        },
        setItem: () => { },
        removeItem: () => { },
    };
}

// Firebase project configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
let auth: any;

if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    } catch (e: any) {
        console.error("Firebase Auth Init Error:", e);
        // Fallback to getAuth to prevent crash, even if persistence might be compromised
        auth = getAuth(app);
    }
}

const db = getFirestore(app);

// Google Provider is not typically used with initializeAuth in this way for native,
// but we keep it for now as we might need it for web fallback or different flow.
import { GoogleAuthProvider } from "firebase/auth";
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, db, googleProvider };
