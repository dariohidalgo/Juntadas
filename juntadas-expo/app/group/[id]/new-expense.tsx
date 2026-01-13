import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import { useLang } from "../../../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import { processReceipt } from "../../../lib/ocrUtils";

export default function NewExpenseScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { getGroup, addExpense } = useData();
    const { t } = useLang();
    const insets = useSafeAreaInsets();

    const group = getGroup(id as string);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidById, setPaidById] = useState(user?.uid || "");
    const [splitAmongIds, setSplitAmongIds] = useState<string[]>(group?.memberIds || []);
    const [isScanning, setIsScanning] = useState(false);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.replace(`/group/${id}`);
        }
    };

    const handleSave = () => {
        if (!description || !amount || !paidById) return;
        addExpense(id as string, description, parseFloat(amount), paidById, splitAmongIds);
        handleBack();
    };

    const toggleMember = (memberId: string) => {
        if (splitAmongIds.includes(memberId)) {
            setSplitAmongIds(splitAmongIds.filter(id => id !== memberId));
        } else {
            setSplitAmongIds([...splitAmongIds, memberId]);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setIsScanning(true);
                try {
                    const data = await processReceipt(result.assets[0].uri);
                    if (data.amount) {
                        setAmount(data.amount.toString());
                    }
                    if (data.text) {
                        // Optional: Could try to set description, but let's keep it simple
                    }
                } catch (e) {
                    alert("Error al leer el ticket. Intenta ingresarlo manualmente.");
                } finally {
                    setIsScanning(false);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Error al abrir la cámara");
        }
    };

    if (!group) return null;

    return (
        <LinearGradient
            colors={["#0f172a", "#000000"]}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <StatusBar style="light" />
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>{t("new_expense")}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t("description")}</Text>
                    <TextInput
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Ej: Cena"
                        placeholderTextColor="#64748b"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t("total_value")}</Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor="#64748b"
                        keyboardType="decimal-pad"
                    />
                    <Pressable
                        onPress={pickImage}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            paddingHorizontal: 16
                        }}
                    >
                        {isScanning ? (
                            <ActivityIndicator color="#06b6d4" />
                        ) : (
                            <Text style={{ fontSize: 20 }}>📷</Text>
                        )}
                    </Pressable>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t("who_paid")}</Text>
                    <View style={styles.optionsContainer}>
                        {group.members?.map((member: any) => (
                            <Pressable
                                key={member.id}
                                style={[styles.option, paidById === member.id && styles.optionSelected]}
                                onPress={() => setPaidById(member.id)}
                            >
                                <Text style={[styles.optionText, paidById === member.id && styles.optionTextSelected]}>
                                    {member.id === user?.uid ? t("you") : member.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t("split_between")}</Text>
                    <View style={styles.optionsContainer}>
                        {group.members?.map((member: any) => (
                            <Pressable
                                key={member.id}
                                style={[styles.option, splitAmongIds.includes(member.id) && styles.optionSelected]}
                                onPress={() => toggleMember(member.id)}
                            >
                                <Text style={[styles.optionText, splitAmongIds.includes(member.id) && styles.optionTextSelected]}>
                                    {member.id === user?.uid ? t("you") : member.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <Pressable
                style={[styles.saveButton, (!description || !amount) && styles.saveButtonDisabled, { marginBottom: insets.bottom + 20 }]}
                onPress={handleSave}
                disabled={!description || !amount}
            >
                <Text style={styles.saveButtonText}>{t("save")}</Text>
            </Pressable>
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
        paddingBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    backText: {
        color: "#ffffff",
        fontSize: 24,
        marginTop: -2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: "#94a3b8",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 12,
        padding: 16,
        color: "#ffffff",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    optionsContainer: {
        gap: 8,
    },
    option: {
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    optionSelected: {
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        borderColor: "#06b6d4",
    },
    optionText: {
        color: "#cbd5e1",
        fontSize: 16,
    },
    optionTextSelected: {
        color: "#ffffff",
        fontWeight: "600",
    },
    saveButton: {
        backgroundColor: "#06b6d4",
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.5,
        backgroundColor: "#1e293b",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
