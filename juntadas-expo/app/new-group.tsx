import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LanguageContext";
import { useSubscription } from "../context/SubscriptionContext";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function NewGroupScreen() {
    const router = useRouter();
    const { addGroup, groups } = useData();
    const { t } = useLang();
    const { isPro } = useSubscription();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emails, setEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const isLimitReached = !isPro && groups.length >= 3;

    const addEmail = () => {
        if (email && email.includes("@") && !emails.includes(email)) {
            setEmails([...emails, email]);
            setEmail("");
        }
    };

    const removeEmail = (e: string) => {
        setEmails(emails.filter(item => item !== e));
    };

    const handleCreate = async () => {
        if (!name || isLimitReached) return;
        setLoading(true);
        try {
            await addGroup(name, emails);
            router.back();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={["#0f172a", "#000000"]}
            style={styles.container}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <View style={styles.backButtonCircle}>
                        <Text style={styles.backText}>←</Text>
                    </View>
                </Pressable>
                <Text style={styles.headerTitle}>Nuevo Grupo</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {isLimitReached && (
                    <LinearGradient
                        colors={["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"]}
                        style={styles.limitCard}
                    >
                        <Text style={styles.limitTitle}>{t("limit_reached")}</Text>
                        <Text style={styles.limitText}>{t("group_limit_msg")}</Text>
                    </LinearGradient>
                )}

                <View style={[styles.form, isLimitReached && styles.formDisabled]}>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t("group_name")}</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder={t("group_placeholder")}
                                placeholderTextColor="#64748b"
                                editable={!isLimitReached}
                            />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Invitar amigos</Text>

                            <View style={styles.emailInputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ejemplo@correo.com"
                                    placeholderTextColor="#64748b"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLimitReached}
                                    onSubmitEditing={addEmail}
                                />
                                <Pressable
                                    onPress={addEmail}
                                    style={({ pressed }) => [styles.addButton, pressed && styles.opacityPressed]}
                                >
                                    <LinearGradient
                                        colors={["#06b6d4", "#3b82f6"]}
                                        style={styles.addButtonGradient}
                                    >
                                        <Text style={styles.addButtonText}>+</Text>
                                    </LinearGradient>
                                </Pressable>
                            </View>

                            {emails.length > 0 && (
                                <View style={styles.chipContainer}>
                                    {emails.map(e => (
                                        <View key={e} style={styles.emailChip}>
                                            <Text style={styles.emailText}>{e}</Text>
                                            <Pressable onPress={() => removeEmail(e)} style={styles.removeButton}>
                                                <Text style={styles.removeButtonText}>×</Text>
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {emails.length === 0 && (
                                <Text style={styles.helperText}>
                                    Agrega los emails de tus amigos para invitarlos al grupo.
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.saveButton,
                        (!name || isLimitReached || loading) && styles.saveButtonDisabled,
                        pressed && styles.opacityPressed
                    ]}
                    onPress={handleCreate}
                    disabled={!name || isLimitReached || loading}
                >
                    <LinearGradient
                        colors={(!name || isLimitReached) ? ["#334155", "#1e293b"] : ["#06b6d4", "#3b82f6"]}
                        style={styles.saveButtonGradient}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? "Creando..." : t("save")}
                        </Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    backText: {
        color: "#ffffff",
        fontSize: 24,
        marginTop: -4
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    content: {
        flex: 1,
        padding: 24,
    },
    limitCard: {
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.3)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    limitTitle: {
        color: "#f87171",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    limitText: {
        color: "#cbd5e1",
        fontSize: 14,
        lineHeight: 20,
    },
    form: {
        gap: 24,
    },
    formDisabled: {
        opacity: 0.5,
    },
    card: {
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    inputGroup: {
        gap: 12,
    },
    label: {
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginLeft: 4
    },
    input: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: "#ffffff",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    emailInputRow: {
        flexDirection: "row",
        gap: 12,
    },
    inputFlex: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: "#ffffff",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    addButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)",
            }
        }),
    },
    addButtonGradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "300",
        marginTop: -2
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8
    },
    emailChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(6, 182, 212, 0.15)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(6, 182, 212, 0.3)",
    },
    emailText: {
        color: "#bae6fd",
        fontSize: 14,
        marginRight: 6,
    },
    removeButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    removeButtonText: {
        color: "#bae6fd",
        fontSize: 12,
        fontWeight: "bold",
        marginTop: -1
    },
    helperText: {
        color: "#64748b",
        fontSize: 13,
        fontStyle: "italic",
        marginTop: 4,
        marginLeft: 4
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    saveButton: {
        borderRadius: 16,
        overflow: "hidden",
        width: "100%",
        height: 56,
        ...Platform.select({
            ios: {
                shadowColor: "#06b6d4",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: "0px 4px 12px rgba(6, 182, 212, 0.3)",
            }
        }),
    },
    saveButtonGradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.7,
        ...Platform.select({
            ios: { shadowOpacity: 0 },
            android: { elevation: 0 },
            web: { boxShadow: "none" }
        })
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
    },
    opacityPressed: {
        opacity: 0.8
    }
});
