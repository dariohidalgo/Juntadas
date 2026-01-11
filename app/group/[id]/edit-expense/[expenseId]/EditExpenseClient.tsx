"use client";
import { useRouter, useParams } from "next/navigation";
import { X, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";

export default function EditExpenseClient() {
    const router = useRouter();
    const params = useParams();
    const { id, expenseId } = params;
    const { t } = useLang();
    const { updateExpense, deleteExpense, getGroup } = useData();

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payerId, setPayerId] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSettlement, setIsSettlement] = useState(false);

    useEffect(() => {
        const group = getGroup(id as string);
        if (group) {
            const expense = group.expenses?.find((e: any) => e.id === expenseId);
            if (expense) {
                setAmount(expense.amount.toString().replace(".", ","));
                setDescription(expense.title);
                setPayerId(expense.paidById || "");
                const splitAmong = expense.splitAmongIds || group.memberIds;
                setUsers(group.members.map((m: any) => ({
                    ...m,
                    selected: splitAmong.includes(m.id)
                })));
                setIsSettlement(!!expense.isSettlement);
                setLoading(false);
            } else {
                router.back();
            }
        }
    }, [id, expenseId, getGroup, router]);

    const toggleUser = (userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, selected: !u.selected } : u
        ));
    };

    const handleSave = () => {
        const value = parseFloat(amount.replace(",", "."));
        if (isNaN(value)) return;
        const selectedIds = users.filter(u => u.selected).map(u => u.id);
        updateExpense(id as string, expenseId as string, description, value, payerId, selectedIds);
        router.push(`/group/${id}`);
    };

    const handleDelete = () => {
        if (confirm(t('confirm_delete_expense') || "¿Eliminar este gasto?")) {
            deleteExpense(id as string, expenseId as string);
            router.push(`/group/${id}`);
        }
    };

    if (loading || users.length === 0) {
        return <div className="flex-center" style={{ height: "100vh" }}>{t('loading')}</div>;
    }

    return (
        <div className="flex-col animate-in" style={{ minHeight: "100vh", position: "relative", paddingBottom: 100 }}>
            {/* Header */}
            <div className="flex-between" style={{ padding: "20px 0" }}>
                <button onClick={() => router.back()} className="btn btn-ghost" style={{ width: 40, padding: 0 }}>
                    <X size={24} />
                </button>
                <h3>{isSettlement ? (t('view_payment') || "Ver Pago") : (t('edit_expense') || "Editar Gasto")}</h3>
                <button onClick={handleDelete} className="text-danger btn btn-ghost" style={{ width: "auto" }}>
                    <Trash2 size={20} />
                </button>
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
                        readOnly={isSettlement}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', width: 'auto', minWidth: '100px', maxWidth: '300px', fontWeight: 'inherit', fontSize: 'inherit', textAlign: 'center' }}
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
                    readOnly={isSettlement}
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
                            onClick={() => !isSettlement && setPayerId(u.id)}
                            className={`flex-col flex-center gap-1 ${isSettlement ? '' : 'cursor-pointer'}`}
                            style={{ minWidth: 60, opacity: payerId === u.id ? 1 : 0.4 }}
                        >
                            <img src={u.avatar} className="avatar" style={{ width: 44, height: 44, border: payerId === u.id ? "2px solid var(--primary)" : "none" }} />
                            <span className="text-xs">{u.name.split(" ")[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Participants */}
            {!isSettlement && (
                <div className="flex-col gap-2" style={{ marginBottom: 24 }}>
                    <label className="text-sm text-muted">{t('split_among') || "Dividido entre"}</label>
                    <div className="flex-col gap-2">
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => toggleUser(u.id)}
                                className="card flex-between cursor-pointer"
                                style={{ padding: "12px 16px", background: u.selected ? "rgba(6, 182, 212, 0.1)" : "var(--bg-input)" }}
                            >
                                <div className="flex-center gap-3">
                                    <img src={u.avatar} className="avatar" style={{ width: 32, height: 32 }} />
                                    <span>{u.name}</span>
                                </div>
                                <div className={`flex-center`} style={{ width: 24, height: 24, borderRadius: "50%", background: u.selected ? "var(--primary)" : "rgba(255,255,255,0.1)" }}>
                                    {u.selected && <Check size={14} color="white" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Action Button */}
            {!isSettlement && (
                <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 24, background: "linear-gradient(to top, var(--bg-app), transparent)" }}>
                    <button onClick={handleSave} className="btn btn-primary" style={{ boxShadow: "var(--shadow-glow)" }}>
                        {t('save')}
                    </button>
                </div>
            )}

        </div>
    );
}
