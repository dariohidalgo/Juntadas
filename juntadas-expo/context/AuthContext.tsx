import { createContext, useContext, useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { auth, googleProvider, db } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, signInAnonymously, updateProfile, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { usePushNotifications } from "../hooks/usePushNotifications";

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    // Initialize Push Notifications
    const { expoPushToken } = usePushNotifications();

    useEffect(() => {
        if (user && expoPushToken) {
            const userRef = doc(db, "users", user.uid);
            updateDoc(userRef, {
                pushToken: expoPushToken
            }).catch(err => console.error("Error updating push token:", err));
        }
    }, [user, expoPushToken]);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "(tabs)" || segments[0] === "group";
        const inLogin = segments[0] === "login";

        if (!user && inAuthGroup) {
            // Redirect to the login page if the user is not signed in and trying to access a protected route
            router.replace("/login");
        } else if (user && inLogin) {
            // Redirect to the home page if the user is signed in and trying to access the login page
            router.replace("/(tabs)");
        }
    }, [user, loading, segments]);

    useEffect(() => {
        // Native Google Sign-In Configuration
        if (Platform.OS !== 'web') {
            GoogleSignin.configure({
                webClientId: "1028462492534-gtjh8nd463qsofoukftshghr2f1pohb9.apps.googleusercontent.com",
            });
        }

        if (!auth) {
            console.error("Auth object is undefined. Firebase init failed?");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            try {
                if (u) {
                    // 1. Index user in Firestore
                    const userRef = doc(db, "users", u.uid);
                    await setDoc(userRef, {
                        uid: u.uid,
                        email: u.email,
                        displayName: u.displayName,
                        photoURL: u.photoURL,
                        lastLogin: new Date()
                    }, { merge: true });

                    // 2. Check for pending invitations
                    const q = query(collection(db, "invitations"), where("email", "==", u.email));
                    const querySnapshot = await getDocs(q);

                    for (const invitationDoc of querySnapshot.docs) {
                        const { groupId } = invitationDoc.data();

                        // Add user to the group
                        const groupRef = doc(db, "groups", groupId);
                        await updateDoc(groupRef, {
                            memberIds: arrayUnion(u.uid),
                            members: arrayUnion({
                                id: u.uid,
                                name: u.displayName || "Usuario",
                                avatar: u.photoURL || ""
                            })
                        });

                        // Delete the invitation
                        await deleteDoc(invitationDoc.ref);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error (likely Firestore rules):", error);
            } finally {
                setUser(u);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            if (Platform.OS === 'web') {
                // Use Popup for web to avoid redirect issues and hosting dependencies on localhost
                console.log("Web Login: Starting signInWithPopup...");
                try {
                    const result = await signInWithPopup(auth, googleProvider);
                    console.log("Web Login: Success, user:", result.user.email);
                } catch (webError: any) {
                    console.error("Web Login Error:", webError);
                    // Handle popup closed by user specifically
                    if (webError.code === 'auth/popup-closed-by-user') {
                        return;
                    }
                    throw webError;
                }
            } else {
                // Native Google Sign-In
                try {
                    await GoogleSignin.hasPlayServices();
                    const userInfo = await GoogleSignin.signIn();
                    const idToken = userInfo.data?.idToken;

                    if (!idToken) {
                        throw new Error("No ID token found");
                    }

                    const credential = GoogleAuthProvider.credential(idToken);
                    await signInWithCredential(auth, credential);
                } catch (error: any) {
                    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                        // User cancelled
                        console.log("User cancelled login");
                    } else if (error.code === statusCodes.IN_PROGRESS) {
                        // Operation in progress
                        console.log("Login in progress");
                    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                        Alert.alert("Error", "Google Play Services no está disponible");
                    } else {
                        console.error("Native Google Login Error:", error);
                        Alert.alert("Error", "Error al iniciar sesión con Google: " + error.message);
                    }
                }
            }
        } catch (error: any) {
            console.error("Login failed", error);
            Alert.alert("Error de Inicio de Sesión", error.message);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            if (Platform.OS !== 'web') {
                await GoogleSignin.signOut();
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
