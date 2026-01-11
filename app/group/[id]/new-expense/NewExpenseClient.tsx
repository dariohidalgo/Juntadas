"use client";
import { useRouter, useParams } from "next/navigation";
import { X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function NewExpenseClient() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { t } = useLang();
    const { addExpense, getGroup } = useData();
    const { user } = useAuth();

    const [amount, setAmount] = useState("0");
    const [description, setDescription] = useState("Carne/Ensalada/Carnada/Nafta");
    const [splitMode, setSplitMode] = useState("equal"); // equal, percent, exact
    const [payerId, setPayerId] = useState("");
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const group = getGroup(id as string);
        if (group && group.members) {
            setUsers(group.members.map((m: any) => ({ ...m, selected: true })));
            if (user && !payerId) setPayerId(user.uid);
        }
    }, [id, getGroup, user, payerId]);

    const toggleUser = (userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, selected: !u.selected } : u
        ));
    };

    const handleSave = () => {
        if (!user) return;
        const value = parseFloat(amount.replace(",", "."));
        if (isNaN(value)) return;
        const selectedIds = users.filter(u => u.selected).map(u => u.id);
        addExpense(id as string, description, value, payerId, selectedIds);
        router.back();
    };

    const selectedCount = users.filter(u => u.selected).length;
    const splitAmount = selectedCount > 0
        ? (parseFloat(amount.replace(",", ".")) || 0) / selectedCount
        : 0;

    if (users.length === 0) {
        return <div className="flex-center" style={{ height: "100vh" }}>{t('loading')}</div>;
    }

    return (
        <div className="flex-col animate-in" style={{ minHeight: "100vh", position: "relative", paddingBottom: 100 }}>
            {/* Header */}
            <div className="flex-between" style={{ padding: "20px 0" }}>
                <button onClick={() => router.back()} className="btn btn-ghost" style={{ width: 40, padding: 0 }}>
                    <X size={24} />
                </button>
                <h3>{t('new_expense')}</h3>
                <button onClick={handleSave} className="text-primary btn btn-ghost" style={{ width: "auto" }}>{t('save')}</button>
            </div>

            {/* Amount Display */}
            <div className="flex-center flex-col" style={{ margin: "20px 0" }}>
                <span className="text-primary text-sm">{t('total_value')}</span>
                <div style={{ fontSize: "3rem", fontWeight: 700, display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: "1.5rem", marginRight: 5 }}>{t('currency')}</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "inherit",
                            width: "200px",
                            fontWeight: "inherit",
                            fontSize: "inherit",
                            textAlign: "center",
                            outline: "none"
                        }}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="flex-col gap-2" style={{ marginBottom: 24 }}>
                <label className="text-sm text-muted">{t('description')}</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                />
            </div>

            {/* Who Paid */}
            <div className="flex-col gap-2" style={{ marginBottom: 24 }}>
                <label className="text-sm text-muted">{t('paid_by')}</label>
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {users.map(u => (
                        <div
                            key={u.id}
                            onClick={() => setPayerId(u.id)}
                            className="flex-col flex-center gap-1 cursor-pointer"
                            style={{ minWidth: 60, opacity: payerId === u.id ? 1 : 0.4 }}
                        >
                            <img src={u.avatar} className="avatar" style={{ width: 44, height: 44, border: payerId === u.id ? "2px solid var(--primary)" : "none" }} />
                            <span className="text-xs">{u.name.split(" ")[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Split Equal Section */}
            <div className="card flex-col gap-4" style={{ padding: 20, marginBottom: 24 }}>
                <div className="flex-between">
                    <span className="text-sm">{t('split_between')}</span>
                    <span className="text-primary font-bold">
                        {t('currency')} {splitAmount.toLocaleString(t('number_format'), { minimumFractionDigits: 2 })} / {t('person')}
                    </span>
                </div>

                <div className="flex-col gap-3">
                    {users.map(u => (
                        <div key={u.id} className="flex-between" onClick={() => toggleUser(u.id)} style={{ cursor: "pointer" }}>
                            <div className="flex-center gap-3">
                                <img src={u.avatar} className="avatar" style={{ width: 32, height: 32 }} />
                                <span className={u.selected ? "" : "text-muted"}>{u.name} {u.selected ? "" : `(${t('not_included')})`}</span>
                            </div>
                            <div className={`flex-center`} style={{ width: 24, height: 24, borderRadius: "50%", background: u.selected ? "var(--primary)" : "rgba(255,255,255,0.1)" }}>
                                {u.selected && <Check size={14} color="black" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Action Button */}
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 24, background: "linear-gradient(to top, var(--bg-app), transparent)" }}>
                <button onClick={handleSave} className="btn btn-primary" style={{ boxShadow: "var(--shadow-glow)" }}>
                    {t('save')}
                </button>
            </div>
        </div>
    );
}
