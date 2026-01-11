"use client";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { DataProvider } from "@/context/DataContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <SubscriptionProvider>
                    <DataProvider>
                        {children}
                    </DataProvider>
                </SubscriptionProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
