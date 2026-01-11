import { View, Text, ScrollView, Pressable, StyleSheet, Alert, TextInput, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

export default function GroupDetailsScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { getGroup, getGroupDebts, getUserBalanceInGroup, settleBalance, deleteGroup, inviteUserByEmail } = useData();
    const { t } = useLang();
    const insets = useSafeAreaInsets();

    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);

    const group = getGroup(id as string);

    if (!group) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.replace("/(tabs)");
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Grupo",
            `¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        await deleteGroup(id as string);
                        router.replace("/(tabs)");
                    }
                }
            ]
        );
    };

    const handleInvite = async () => {
        if (!inviteEmail || !inviteEmail.includes("@")) {
            Alert.alert("Error", "Ingresa un correo válido");
            return;
        }

        setInviting(true);
        const result = await inviteUserByEmail(id as string, inviteEmail);
        setInviting(false);

        if (result.success) {
            setInviteEmail("");
            setIsInviting(false);
            Alert.alert("Éxito", result.message);
        } else {
            Alert.alert("Error", result.message);
        }
    };

    const activities = group.expenses || [];
    const debts = getGroupDebts(id as string);
    const { balance, owe } = getUserBalanceInGroup(id as string);

    return (
        <LinearGradient
            colors={["#0f172a", "#000000"]}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.iconButton}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>{group.name}</Text>
                <Pressable onPress={handleDelete} style={styles.iconButton}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            >
                {/* Members */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Participantes</Text>
                        <Pressable
                            onPress={() => setIsInviting(!isInviting)}
                            style={styles.addMemberButton}
                        >
                            <Text style={styles.addMemberButtonText}>{isInviting ? "Cancelar" : "+ Agregar"}</Text>
                        </Pressable>
                    </View>

                    {isInviting && (
                        <View style={styles.inviteContainer}>
                            <TextInput
                                style={styles.inviteInput}
                                placeholder="Email del participante"
                                placeholderTextColor="#64748b"
                                value={inviteEmail}
                                onChangeText={setInviteEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <Pressable
                                style={[styles.inviteConfirmButton, !inviteEmail && styles.disabledButton]}
                                onPress={handleInvite}
                                disabled={!inviteEmail || inviting}
                            >
                                {inviting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.inviteConfirmText}>Invitar</Text>
                                )}
                            </Pressable>
                        </View>
                    )}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersList}>
                        {group.members?.map((m: any) => (
                            <View key={m.id} style={styles.memberItem}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberInitial}>{m.name[0]}</Text>
                                </View>
                                <Text style={styles.memberName}>{m.name.split(" ")[0]}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Balance Summary */}
                {balance > 0.01 && (
                    <LinearGradient
                        colors={owe ? ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"] : ["rgba(6, 182, 212, 0.1)", "rgba(6, 182, 212, 0.05)"]}
                        style={styles.balanceCard}
                    >
                        <View>
                            <Text style={styles.balanceLabel}>{owe ? t("you_owe_upper") : t("you_receive_upper")}</Text>
                            <Text style={[styles.balanceAmount, owe ? styles.balanceAmountOwe : styles.balanceAmountOwed]}>
                                {t("currency")} {balance.toFixed(2)}
                            </Text>
                            <Text style={styles.balanceSubtext}>{owe ? t("to_members") : t("from_members")}</Text>
                        </View>
                    </LinearGradient>
                )}

                {/* Debts */}
                {debts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t("balances_debts")}</Text>
                        {debts.map((debt: any, idx: number) => {
                            const from = group.members.find((m: any) => m.id === debt.from);
                            const to = group.members.find((m: any) => m.id === debt.to);
                            const isPayer = debt.from === user?.uid;

                            return (
                                <View key={idx} style={styles.debtCard}>
                                    <View style={styles.debtInfo}>
                                        <Text style={styles.debtText}>
                                            <Text style={{ fontWeight: 'bold', color: isPayer ? '#fff' : '#94a3b8' }}>
                                                {from?.id === user?.uid ? t("you") : from?.name.split(" ")[0]}
                                            </Text>
                                            <Text style={styles.debtLabel}> {t("owes")} </Text>
                                            <Text style={{ fontWeight: 'bold', color: !isPayer ? '#fff' : '#94a3b8' }}>
                                                {to?.id === user?.uid ? t("you") : to?.name.split(" ")[0]}
                                            </Text>
                                        </Text>
                                    </View>
                                    <View style={styles.debtRight}>
                                        <Text style={styles.debtAmount}>{t("currency")} {debt.amount.toFixed(2)}</Text>
                                        {isPayer && (
                                            <Pressable
                                                style={styles.payButton}
                                                onPress={() => settleBalance(id as string, debt.from, debt.to, debt.amount)}
                                            >
                                                <Text style={styles.payButtonText}>{t("pay_now")}</Text>
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Activities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("activities")}</Text>
                    {activities.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>{t("no_expenses")}</Text>
                            <Text style={styles.emptySubtext}>Toca el + para agregar un gasto.</Text>
                        </View>
                    ) : (
                        activities.map((item: any) => (
                            <Pressable
                                key={item.id}
                                style={({ pressed }) => [styles.expenseCard, pressed && styles.opacityPressed]}
                                onPress={() => router.push(`/group/${id}/edit-expense/${item.id}`)}
                            >
                                <View style={styles.expenseInfo}>
                                    <Text style={styles.expenseTitle}>{item.title}</Text>
                                    <Text style={styles.expenseSubtext}>
                                        {t("paid_by")} {item.paidById === user?.uid ? t("you") : item.paidBy}
                                    </Text>
                                </View>
                                <View style={styles.expenseRight}>
                                    <Text style={styles.expenseAmount}>{t("currency")} {item.amount.toFixed(2)}</Text>
                                    <Text style={styles.expenseDate}>{item.date}</Text>
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>

            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    { bottom: 30 + insets.bottom },
                    pressed && styles.fabPressed
                ]}
                onPress={() => router.push(`/group/${id}/new-expense`)}
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
        alignItems: "center"
    },
    loadingText: {
        color: "#94a3b8"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: "center",
        alignItems: "center",
    },
    backText: {
        color: "#ffffff",
        fontSize: 24,
        marginTop: -2
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    addMemberButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    addMemberButtonText: {
        color: "#06b6d4",
        fontSize: 14,
        fontWeight: "600",
    },
    inviteContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    inviteInput: {
        flex: 1,
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: "#fff",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    inviteConfirmButton: {
        backgroundColor: "#06b6d4",
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: "#334155",
    },
    inviteConfirmText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    membersList: {
        flexDirection: "row",
        marginLeft: -4
    },
    memberItem: {
        alignItems: "center",
        marginRight: 16,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    memberInitial: {
        color: "#38bdf8",
        fontSize: 18,
        fontWeight: "bold",
    },
    memberName: {
        color: "#cbd5e1",
        fontSize: 12,
        fontWeight: "500"
    },
    balanceCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)"
    },
    balanceLabel: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
        textTransform: "uppercase"
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    balanceAmountOwe: {
        color: "#f87171",
    },
    balanceAmountOwed: {
        color: "#22d3ee",
    },
    balanceSubtext: {
        color: "#cbd5e1",
        fontSize: 14,
    },
    debtCard: {
        backgroundColor: "rgba(30, 41, 59, 1)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    debtInfo: {
        flex: 1,
    },
    debtText: {
        color: "#cbd5e1",
        fontSize: 14,
    },
    debtLabel: {
        color: "#64748b",
        fontSize: 12,
    },
    debtRight: {
        alignItems: "flex-end",
    },
    debtAmount: {
        color: "#38bdf8",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    payButton: {
        backgroundColor: "#0ea5e9",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    payButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "bold",
    },
    expenseCard: {
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.03)"
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        color: "#f1f5f9",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    expenseSubtext: {
        color: "#94a3b8",
        fontSize: 13,
    },
    expenseRight: {
        alignItems: "flex-end",
    },
    expenseAmount: {
        color: "#f1f5f9",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    expenseDate: {
        color: "#64748b",
        fontSize: 12,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16
    },
    emptyText: {
        color: "#e2e8f0",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4
    },
    emptySubtext: {
        color: "#94a3b8",
        fontSize: 14
    },
    fab: {
        position: "absolute",
        right: 24,
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
    opacityPressed: {
        opacity: 0.7
    }
});
