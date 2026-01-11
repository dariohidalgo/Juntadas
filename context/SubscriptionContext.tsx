"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const SubscriptionContext = createContext<any>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("is_pro");
        if (stored === "true") {
            setIsPro(true);
        }
    }, []);

    const upgradeToPro = () => {
        setIsPro(true);
        localStorage.setItem("is_pro", "true");
    };

    const downgradeToFree = () => {
        setIsPro(false);
        localStorage.removeItem("is_pro");
    };

    return (
        <SubscriptionContext.Provider value={{ isPro, upgradeToPro, downgradeToFree }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export const useSubscription = () => useContext(SubscriptionContext);
