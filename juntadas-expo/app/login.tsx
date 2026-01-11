import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
    const { user, loading, loginWithGoogle } = useAuth();
    const { t } = useLang();
    const router = useRouter();

    useEffect(() => {
        if (user && !loading) {
            router.replace("/(tabs)");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={["#0f172a", "#1e1b4b", "#000000"]}
            style={styles.container}
        >
            <StatusBar style="light" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>💸</Text>
                    </View>
                    <Text style={styles.title}>Juntadas</Text>
                    <Text style={styles.subtitle}>{t("welcome")}</Text>
                </View>

                <View style={styles.card}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed
                        ]}
                        onPress={loginWithGoogle}
                    >
                        <View style={styles.googleIconContainer}>
                            <Text style={styles.googleIcon}>G</Text>
                        </View>
                        <Text style={styles.buttonText}>{t("login_google")}</Text>
                    </Pressable>

                    <Text style={styles.footerText}>
                        Tu app para dividir gastos sin complicaciones.
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}

import { ActivityIndicator } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center"
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 60,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(6, 182, 212, 0.5)",
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: "800",
        color: "#ffffff",
        marginBottom: 12,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        color: "#cbd5e1",
        marginBottom: 8,
        textAlign: "center",
        fontWeight: "400",
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        alignItems: "center",
    },
    button: {
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    googleIconContainer: {
        marginRight: 12,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4285F4",
    },
    buttonText: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: "700",
    },
    footerText: {
        color: "#64748b",
        fontSize: 14,
        textAlign: "center",
    },
});
