import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#06b6d4" />
            </View>
        );
    }

    return <Redirect href={user ? "/(tabs)" : "/login"} />;
}
