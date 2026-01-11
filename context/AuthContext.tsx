"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signInWithCredential, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            if (Capacitor.isNativePlatform()) {
                // Mobile: Use native Google Sign-In
                const result = await FirebaseAuthentication.signInWithGoogle();

                // Create credential and sign in to Firebase
                const credential = GoogleAuthProvider.credential(result.credential?.idToken);
                await signInWithCredential(auth, credential);
            } else {
                // Web: Use popup
                await signInWithPopup(auth, googleProvider);
            }
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const logout = async () => {
        await signOut(auth);
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
