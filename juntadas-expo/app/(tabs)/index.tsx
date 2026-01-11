import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useLang } from "../../context/LanguageContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
    const { user, logout } = useAuth();
    const { groups, deleteGroup, getUserBalanceInGroup } = useData();
    const { t } = useLang();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLongPress = (group: any) => {
        Alert.alert(
            "Eliminar Grupo",
            `¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        await deleteGroup(group.id);
                    }
                }
            ]
        );
    };

    // Redirect if not authenticated (double check)
    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: 'white' }}>Redirigiendo...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={["#0f172a", "#000000"]}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hola, {user.displayName?.split(" ")[0] || "Usuario"}</Text>
                    <Text style={styles.title}>{t("dashboard_title")}</Text>
                </View>
                <Pressable onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Salir</Text>
                </Pressable>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            >
                {groups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Text style={{ fontSize: 40 }}>🏝️</Text>
                        </View>
                        <Text style={styles.emptyTitle}>Sin grupos todavía</Text>
                        <Text style={styles.emptyText}>Crea tu primer grupo para empezar a dividir gastos con amigos.</Text>
                    </View>
                ) : (
                    groups.map((group: any) => {
                        const { balance, owe } = getUserBalanceInGroup(group.id);

                        return (
                            <Pressable
                                key={group.id}
                                style={({ pressed }) => [styles.groupCard, pressed && styles.cardPressed]}
                                onPress={() => router.push(`/group/${group.id}`)}
                                onLongPress={() => handleLongPress(group)}
                                delayLongPress={500}
                            >
                                <LinearGradient
                                    colors={["rgba(30, 41, 59, 0.7)", "rgba(15, 23, 42, 0.8)"]}
                                    style={styles.cardGradient}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.groupIcon}>
                                            <Text style={styles.groupIconText}>{group.name[0].toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.groupName}>{group.name}</Text>
                                            <Text style={styles.groupStatus}>
                                                {group.members?.length || 0} miembros • {group.expenses?.length || 0} gastos
                                            </Text>
                                        </View>
                                    </View>

                                    {balance > 0.01 && (
                                        <View style={[styles.balanceBadge, owe ? styles.badgeOwe : styles.badgeOwed]}>
                                            <Text style={[styles.balanceLabel, owe ? styles.textOwe : styles.textOwed]}>
                                                {owe ? t("owe") : t("owed")}
                                            </Text>
                                            <Text style={[styles.balanceAmount, owe ? styles.textOwe : styles.textOwed]}>
                                                {t("currency")} {balance.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}

                                    {balance <= 0.01 && (
                                        <View style={styles.settledBadge}>
                                            <Text style={styles.settledText}>Estás al día ✅</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        )
                    })
                )}
            </ScrollView>

            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    { bottom: 30 + insets.bottom },
                    pressed && styles.fabPressed
                ]}
                onPress={() => router.push("/new-group")}
            >
                <LinearGradient
                    colors={["#06b6d4", "#3b82f6"]}
                    style={styles.fabGradient}
                >
                    <Text style={styles.fabText}>+</Text>
                </LinearGradient>
            </Pressable>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    welcomeText: {
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#ffffff",
    },
    logoutButton: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    logoutText: {
        color: "#cbd5e1",
        fontSize: 12,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 80,
        padding: 20,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    emptyTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    groupCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            }
        }),
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
    },
    cardGradient: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    groupIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    groupIconText: {
        color: "#22d3ee",
        fontSize: 20,
        fontWeight: "bold",
    },
    groupName: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    groupStatus: {
        color: "#94a3b8",
        fontSize: 13,
    },
    balanceBadge: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderLeftWidth: 4,
    },
    badgeOwe: {
        borderLeftColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
    },
    badgeOwed: {
        borderLeftColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.05)",
    },
    settledBadge: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    settledText: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "500",
    },
    balanceLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    balanceAmount: {
        fontSize: 18,
        fontWeight: "bold",
    },
    textOwe: {
        color: "#f87171",
    },
    textOwed: {
        color: "#22d3ee",
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        ...Platform.select({
            ios: {
                shadowColor: "#06b6d4",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: "0px 8px 16px rgba(6, 182, 212, 0.4)",
            }
        }),
    },
    fabPressed: {
        transform: [{ scale: 0.95 }],
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    fabText: {
        color: "#ffffff",
        fontSize: 36,
        fontWeight: "300",
        marginTop: -4,
    },
});
