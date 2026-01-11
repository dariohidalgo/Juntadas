import { createContext, useContext, useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import { auth, googleProvider, db } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, signInAnonymously, updateProfile } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";

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
            if (Platform.OS === 'web') {
                // Use Redirect to avoid Cross-Origin-Opener-Policy (COOP) issues
                await signInWithRedirect(auth, googleProvider);
            } else {
                // Fallback for Expo Go (Google Sign-In requires Dev Client or Native Build)
                Alert.alert(
                    "Modo Invitado (Expo Go)", // Title
                    "El login con Google requiere una build nativa. Entrando como invitado para probar.", // Message
                    [{ text: "OK" }]
                );

                const result = await signInAnonymously(auth);

                // Set default profile for anonymous user
                if (result.user && !result.user.displayName) {
                    await updateProfile(result.user, {
                        displayName: "Invitado Demo",
                        photoURL: "https://ui-avatars.com/api/?name=Invitado&background=0D8ABC&color=fff"
                    });

                    // Trigger the same db indexing logic manually if needed, 
                    // but onAuthStateChanged should pick it up.
                }
            }
        } catch (error: any) {
            console.error("Login failed", error);
            Alert.alert("Error de Inicio de Sesión", error.message);
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
