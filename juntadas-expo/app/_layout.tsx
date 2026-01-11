import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { DataProvider } from "../context/DataContext";
import { LanguageProvider } from "../context/LanguageContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
    'style props are deprecated. Use "boxShadow"',
    'props.pointerEvents is deprecated. Use style.pointerEvents',
]);

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <LanguageProvider>
                <AuthProvider>
                    <DataProvider>
                        <SubscriptionProvider>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="login" />
                                <Stack.Screen name="(tabs)" />
                            </Stack>
                        </SubscriptionProvider>
                    </DataProvider>
                </AuthProvider>
            </LanguageProvider>
        </SafeAreaProvider>
    );
}
