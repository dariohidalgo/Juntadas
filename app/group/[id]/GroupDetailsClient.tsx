"use client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MoreVertical, Plus, Receipt, UserPlus, Mail, X as CloseIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useLang } from "@/context/LanguageContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import AdBanner from "@/components/AdBanner";

export default function GroupDetailsClient() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { user } = useAuth();
    const { getGroup, settleBalance, inviteUserByEmail, getGroupDebts, getUserBalanceInGroup, deleteGroup } = useData();
    const { t } = useLang();
    const { isPro } = useSubscription();
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const group = getGroup(id as string);

    const handleInvite = async () => {
        if (!newMemberEmail || inviting) return;
        setInviting(true);
        const result = await inviteUserByEmail(id as string, newMemberEmail);
        setInviting(false);
        if (result.success) {
            setNewMemberEmail("");
            setShowAddMember(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm(t('confirm_delete_group'))) {
            await deleteGroup(id as string);
            router.push("/");
        }
    };

    // If group not found
    if (!group) return <div className="flex-center" style={{ height: "100vh" }}>Loading...</div>;

    const activities = group.expenses;
    const debts = getGroupDebts(id as string);
    const { balance, owe } = getUserBalanceInGroup(id as string);

    return (
        <div className="flex-col gap-6 animate-in" style={{ paddingBottom: 80 }}>
            {/* Header */}
            <div className="flex-between" style={{ padding: "10px 0", position: 'relative' }}>
                <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: 8, width: "auto" }}>
                    <ArrowLeft size={24} />
                </button>
                <h3>{group.name}</h3>
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowDeleteMenu(!showDeleteMenu)} className="btn btn-ghost" style={{ padding: 8, width: "auto" }}>
                        <MoreVertical size={24} />
                    </button>
                    {showDeleteMenu && (
                        <div className="card animate-in" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            zIndex: 100,
                            minWidth: 150,
                            padding: '8px 0',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow-lg)',
                            border: '1px solid var(--primary-glow)'
                        }}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(true);
                                    setShowDeleteMenu(false);
                                }}
                                className="btn btn-ghost text-danger"
                                style={{ width: '100%', borderRadius: 0, justifyContent: 'flex-start', padding: '12px 16px', fontSize: '0.9rem' }}
                            >
                                {t('delete_group')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="flex-center" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    padding: 20,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card flex-col gap-6 animate-in" style={{ maxWidth: 400, width: '100%', background: 'var(--bg-card)' }}>
                        <div className="flex-col gap-2">
                            <h3 style={{ fontSize: '1.25rem' }}>{t('delete_group')}</h3>
                            <p className="text-muted" style={{ lineHeight: 1.5 }}>{t('confirm_delete_group')}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-ghost flex-1"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleDeleteGroup}
                                className="btn btn-primary flex-1"
                                style={{ background: 'var(--danger)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)' }}
                            >
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Members Section */}
            <div className="flex-col gap-3">
                <div className="flex-between">
                    <h3 style={{ fontSize: "1rem" }}>Participantes</h3>
                    {!showAddMember && (
                        <button
                            onClick={() => setShowAddMember(true)}
                            className="btn btn-ghost text-primary flex-center gap-2"
                            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.9rem' }}
                        >
                            <UserPlus size={18} /> {t('add_participant')}
                        </button>
                    )}
                </div>

                {showAddMember && (
                    <div className="card flex-col gap-3 animate-in" style={{ background: 'var(--bg-input)', border: '1px solid var(--primary-glow)' }}>
                        <div className="flex-between">
                            <span className="text-sm font-semibold">Invitar por email</span>
                            <button onClick={() => setShowAddMember(false)} className="btn btn-ghost" style={{ width: 24, height: 24, padding: 0 }}>
                                <CloseIcon size={16} />
                            </button>
                        </div>
                        <div className="flex-center gap-2">
                            <div className="flex-1" style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="ejemplo@gmail.com"
                                    className="input"
                                    style={{ paddingLeft: 35, height: 40, fontSize: '0.9rem' }}
                                />
                            </div>
                            <button
                                onClick={handleInvite}
                                className="btn btn-primary"
                                style={{ width: 'auto', padding: '0 16px', height: 40 }}
                                disabled={inviting}
                            >
                                {inviting ? '...' : 'Invitar'}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 5 }}>
                    {group.members?.map((m: any) => (
                        <div key={m.id} className="flex-col flex-center gap-1" style={{ minWidth: 60 }}>
                            <img src={m.avatar || "https://github.com/shadcn.png"} className="avatar" style={{ width: 44, height: 44, border: '2px solid var(--bg-card)' }} />
                            <span className="text-xs text-center" style={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.name.split(" ")[0]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="flex-col gap-4">
                {balance > 0.1 ? (
                    <div className="card flex-between" style={{ background: "var(--bg-card)", alignItems: "flex-start", border: owe ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(6, 182, 212, 0.2)" }}>
                        <div>
                            <span className="text-sm text-muted">{owe ? t('you_owe_upper') : t('you_receive_upper')}</span>
                            <h2 className={owe ? "text-danger" : "text-primary"} style={{ fontSize: "1.25rem" }}>
                                {t('currency')} {balance.toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}
                            </h2>
                            <p className="text-sm">{owe ? t('to_members') : t('from_members')}</p>
                        </div>
                        <img
                            src={group.image || "https://images.unsplash.com/photo-1549144511-30858b343425?auto=format&fit=crop&w=100&q=80"}
                            alt={group.name}
                            style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }}
                        />
                    </div>
                ) : (
                    <div className="card flex-center" style={{ background: "var(--bg-card)", height: 100 }}>
                        <p className="text-muted">{t('all_settled')}</p>
                    </div>
                )}
            </div>

            {!isPro && <AdBanner />}

            {/* Activities & Debts */}
            <div className="flex-col gap-6">
                {debts.length > 0 && (
                    <div>
                        <h3 style={{ marginBottom: 16 }}>{t('balances_debts')}</h3>
                        <div className="flex-col gap-2">
                            {debts.map((debt: any, idx: number) => {
                                const from = group.members.find((m: any) => m.id === debt.from);
                                const to = group.members.find((m: any) => m.id === debt.to);

                                const AvatarFallback = ({ user }: { user: any }) => (
                                    <div className="avatar flex-center" style={{ width: 32, height: 32, background: 'var(--bg-input)', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {user?.avatar ? (
                                            <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        ) : null}
                                        <span style={{ position: 'absolute' }}>{user?.name?.[0] || '?'}</span>
                                    </div>
                                );

                                return (
                                    <div key={idx} className="card flex-between" style={{ padding: "12px 16px" }}>
                                        <div className="flex-center gap-4">
                                            <div className="flex-center gap-2">
                                                <AvatarFallback user={from} />
                                                <span className="text-sm font-semibold">{from?.id === user?.uid ? t('you') : from?.name.split(" ")[0]}</span>
                                            </div>
                                            <span className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 }}>{t('owes')}</span>
                                            <div className="flex-center gap-2">
                                                <AvatarFallback user={to} />
                                                <span className="text-sm font-semibold">{to?.id === user?.uid ? t('you') : to?.name.split(" ")[0]}</span>
                                            </div>
                                        </div>
                                        <div className="flex-center gap-3">
                                            <span className="text-primary font-bold" style={{ fontSize: '1rem' }}>{t('currency')} {debt.amount.toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}</span>
                                            {debt.from === user?.uid && (
                                                <button
                                                    onClick={() => settleBalance(id as string, debt.from, debt.to, debt.amount)}
                                                    className="btn btn-primary"
                                                    style={{ margin: '0 9px', padding: '6px 12px', fontSize: '0.75rem', width: 'auto', height: 'auto', boxShadow: 'none' }}
                                                >
                                                    {t('pay_now')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div>
                    <h3 style={{ marginBottom: 16 }}>{t('activities')}</h3>
                    <div className="flex-col gap-4">
                        {activities.length === 0 && <p className="text-muted text-center" style={{ marginTop: 20 }}>{t('no_expenses')}</p>}
                        {activities.map((item: any) => (
                            <div
                                key={item.id}
                                className="card flex-between"
                                style={{ padding: 16, cursor: "pointer" }}
                                onClick={() => router.push(`/group/${id}/edit-expense/${item.id}`)}
                            >
                                <div className="flex-center gap-4" style={{ minWidth: 0, flex: 1 }}>
                                    <div className="flex-center" style={{ width: 48, height: 48, background: "var(--bg-input)", borderRadius: "50%" }}>
                                        <Receipt size={20} className="text-primary" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: "1rem", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                        <p className="text-sm text-muted">
                                            {t('paid_by')} {(() => {
                                                if (item.paidById === user?.uid) return t('you');

                                                // 1. Try by ID
                                                let payer = group.members.find((m: any) => m.id === item.paidById);

                                                // 2. Try by Name (fallback for historical data without ID)
                                                if (!payer && item.paidBy && item.paidBy !== "Usuario") {
                                                    payer = group.members.find((m: any) => m.name === item.paidBy);
                                                }

                                                if (payer) return payer.name.split(" ")[0];
                                                return item.paidBy || "Usuario";
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-col" style={{ alignItems: "flex-end", flexShrink: 0, minWidth: 'fit-content' }}>
                                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t('currency')} {item.amount.toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}</span>
                                    <span className="text-sm text-muted" style={{ marginTop: 4 }}>{item.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAB */}
            <button
                className="btn btn-primary"
                onClick={() => router.push(`/group/${id}/new-expense`)}
                style={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    width: "auto",
                    padding: "0 24px",
                    height: 56,
                    borderRadius: "var(--radius-full)",
                    boxShadow: "var(--shadow-glow)"
                }}
            >
                <Plus size={24} style={{ marginRight: 8 }} />
                {t('new_expense')}
            </button>
        </div>
    );
}
