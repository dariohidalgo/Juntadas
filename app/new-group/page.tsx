"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useLang } from "@/context/LanguageContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { AlertCircle, Mail, PlusCircle, Copy, X } from "lucide-react";

export default function NewGroup() {
    const router = useRouter();
    const { addGroup, groups } = useData();
    const { t } = useLang();
    const { isPro, upgradeToPro } = useSubscription();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emails, setEmails] = useState<string[]>([]);

    const isLimitReached = !isPro && groups.length >= 3;

    const addEmail = () => {
        if (email && !emails.includes(email)) {
            setEmails([...emails, email]);
            setEmail("");
        }
    };

    const removeEmail = (e: string) => {
        setEmails(emails.filter(item => item !== e));
    };

    const handleCreate = () => {
        if (!name || isLimitReached) return;
        addGroup(name, emails);
        router.push("/");
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(window.location.origin);
        alert(t('link_copied') || "Link copiado!");
    };

    return (
        <div className="flex-col animate-in" style={{ minHeight: "100vh", position: "relative", paddingBottom: 100 }}>
            {/* Header */}
            <div className="flex-between" style={{ padding: "20px 0" }}>
                <button onClick={() => router.back()} className="btn btn-ghost" style={{ width: 40, padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <h3>{t('dashboard_title')}</h3>
                <div style={{ width: 40 }}></div>
            </div>

            {isLimitReached && (
                <div className="card flex-col gap-4 animate-in" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 20 }}>
                    <div className="flex-center gap-3 text-danger">
                        <AlertCircle size={24} />
                        <h3 style={{ fontSize: '1.1rem' }}>{t('limit_reached')}</h3>
                    </div>
                    <p className="text-sm">{t('group_limit_msg')}</p>
                    <button onClick={upgradeToPro} className="btn btn-primary" style={{ marginTop: 8 }}>
                        {t('upgrade_pro')}
                    </button>
                </div>
            )}

            <div className="flex-col gap-6" style={{ marginTop: 20, opacity: isLimitReached ? 0.5 : 1, pointerEvents: isLimitReached ? 'none' : 'auto' }}>
                <div className="flex-col gap-2">
                    <label className="text-sm text-muted">{t('group_name')}</label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('group_placeholder')}
                        className="input"
                    />
                </div>

                <div className="flex-col gap-4">
                    <label className="text-sm text-muted">{t('invite_friends')}</label>

                    <div className="flex-center gap-2">
                        <div className="flex-1" style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="gmail@ejemplo.com"
                                className="input"
                                style={{ paddingLeft: 40 }}
                                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                            />
                        </div>
                        <button onClick={addEmail} className="btn btn-ghost" style={{ width: 48, padding: 0 }}>
                            <PlusCircle className="text-primary" />
                        </button>
                    </div>

                    <div className="flex-col gap-2">
                        {emails.map(e => (
                            <div key={e} className="card flex-between" style={{ padding: "8px 16px" }}>
                                <span className="text-sm">{e}</span>
                                <button onClick={() => removeEmail(e)} className="btn btn-ghost text-danger" style={{ width: 'auto', padding: 4 }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="card flex-col gap-3" style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px dashed rgba(6, 182, 212, 0.2)', marginTop: 10 }}>
                        <p className="text-sm text-muted text-center">{t('invite_msg') || "Si no tienen la app, envíales este link para que se unan al descargarla:"}</p>
                        <button onClick={copyInviteLink} className="btn btn-ghost text-primary flex-center gap-2" style={{ height: 'auto', padding: 10 }}>
                            <Copy size={16} /> {t('copy_app_link') || "Copiar Link de la App"}
                        </button>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleCreate}
                    disabled={!name}
                    style={{
                        opacity: name ? 1 : 0.5,
                        marginTop: 16,
                        position: "fixed",
                        bottom: 24,
                        width: "calc(100% - 48px)",
                        left: 24
                    }}
                >
                    {t('save')}
                </button>
            </div>
        </div>
    );
}
