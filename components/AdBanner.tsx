"use client";
import React from "react";
import { useLang } from "@/context/LanguageContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { ExternalLink } from "lucide-react";

export default function AdBanner() {
    const { isPro, upgradeToPro } = useSubscription();
    const { t } = useLang();

    if (isPro) return null;

    return (
        <div
            className="card animate-in"
            style={{
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "16px",
                marginTop: "16px",
                marginBottom: "16px",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div style={{ position: "absolute", top: 8, right: 12, fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                {t('sponsored').toUpperCase()}
            </div>

            <div className="flex-between" style={{ gap: 16 }}>
                <div className="flex-col gap-1">
                    <h4 style={{ color: "var(--primary)", fontSize: "0.95rem" }}>{t('ad_title')}</h4>
                    <p className="text-sm" style={{ color: "var(--text-white)", opacity: 0.8 }}>
                        {t('ad_desc')}
                    </p>
                </div>
                <button
                    className="btn btn-ghost"
                    style={{
                        width: "auto",
                        padding: "8px 12px",
                        fontSize: "0.8rem",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}
                >
                    <ExternalLink size={14} style={{ marginRight: 6 }} />
                    {t('view')}
                </button>
            </div>

            <div
                onClick={upgradeToPro}
                style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    textAlign: "center"
                }}
            >
                <span className="text-sm text-primary" style={{ cursor: "pointer", fontWeight: 500 }}>
                    {t('remove_ads')} →
                </span>
            </div>
        </div>
    );
}
