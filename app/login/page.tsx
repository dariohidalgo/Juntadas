"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn, Sparkles } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function LoginPage() {
    const { user, loginWithGoogle, loading } = useAuth();
    const { t } = useLang();
    const router = useRouter();

    useEffect(() => {
        if (user && !loading) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) return <div className="flex-center" style={{ height: "100vh" }}>{t('loading')}</div>;

    return (
        <div className="flex-center flex-col animate-in" style={{ height: "80vh", gap: "2rem" }}>
            <div className="text-center">
                <div className="flex-center" style={{
                    width: 80, height: 80,
                    background: "var(--primary-glow)",
                    borderRadius: "50%",
                    margin: "0 auto 20px"
                }}>
                    <Sparkles size={40} color="var(--primary)" />
                </div>
                <h1 style={{ fontSize: "2.5rem" }}>Juntadas</h1>
                <p>{t('welcome')}</p>
            </div>

            <div style={{ width: "100%", maxWidth: 320 }}>
                <button className="btn btn-primary" onClick={loginWithGoogle}>
                    <LogIn size={20} style={{ marginRight: 10 }} />
                    {t('login_google')}
                </button>
            </div>
        </div>
    );
}
