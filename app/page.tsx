"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Search, LogOut, Bell, User, Globe } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { useSubscription } from "@/context/SubscriptionContext";
import AdBanner from "@/components/AdBanner";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const { t, toggleLang, lang } = useLang();
  const { groups, getUserBalanceInGroup } = useData();
  const { isPro, upgradeToPro } = useSubscription();
  const router = useRouter();



  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex-center" style={{ height: "100vh" }}>Loading...</div>;

  return (
    <div className="flex-col gap-6 animate-in" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="flex-between">
        <div className="flex-center gap-2">
          <img src={user.photoURL || "https://github.com/shadcn.png"} alt="User" className="avatar" />
          <div>
            <div className="flex-center gap-2">
              <p className="text-sm">{t('hello')}, {user.displayName?.split(" ")[0]}</p>
              {isPro && <span style={{ fontSize: '0.6rem', padding: '1px 4px', background: 'var(--primary)', color: 'black', borderRadius: 4, fontWeight: 'bold' }}>PRO</span>}
            </div>
            <h3>Juntadas</h3>
          </div>
        </div>
        <div className="flex-center gap-4">
          {!isPro && (
            <button
              onClick={upgradeToPro}
              className="text-primary"
              style={{ background: 'transparent', border: '1px solid var(--primary)', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {t('upgrade_pro').toUpperCase()}
            </button>
          )}
          <button onClick={toggleLang} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer" }} className="flex-center gap-1">
            <Globe size={16} /> {lang.toUpperCase()}
          </button>
          <Bell size={24} className="text-muted" />
          <User size={24} className="text-muted" onClick={logout} />
        </div>
      </div>

      {!isPro && <AdBanner />}

      {/* Balance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card flex-col gap-2" style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
          <span className="text-sm text-primary">{t('owed')}</span>
          <h2 className="text-primary">{t('currency')} {groups.reduce((acc: number, g: any) => {
            const { balance, owe } = getUserBalanceInGroup(g.id);
            return owe ? acc : acc + balance;
          }, 0).toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}</h2>
          <span className="text-sm text-success">↗ {groups.filter((g: any) => !getUserBalanceInGroup(g.id).owe && getUserBalanceInGroup(g.id).balance > 0.1).length} {t('bills')}</span>
        </div>
        <div className="card flex-col gap-2" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <span className="text-sm text-danger">{t('owe')}</span>
          <h2 className="text-danger">{t('currency')} {groups.reduce((acc: number, g: any) => {
            const { balance, owe } = getUserBalanceInGroup(g.id);
            return owe ? acc + balance : acc;
          }, 0).toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}</h2>
          <span className="text-sm text-danger">↘ {groups.filter((g: any) => getUserBalanceInGroup(g.id).owe && getUserBalanceInGroup(g.id).balance > 0.1).length} {t('bills')}</span>
        </div>
      </div>

      {/* Groups Section */}
      <div>
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h2>{t('dashboard_title')}</h2>
          <a href="#" className="text-sm text-primary">{t('view_all')}</a>
        </div>

        <div className="flex-col gap-4">
          {groups.map((group: any) => (
            <div key={group.id} className="card flex-between" style={{ padding: 16, cursor: "pointer" }} onClick={() => router.push(`/group/${group.id}`)}>
              <div className="flex-center gap-4">
                <img src={group.image} alt={group.name} style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }} />
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>{group.name}</h3>
                  <div className="flex-col gap-1">
                    <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      {t('total')}: {t('currency')} {(group.expenses || []).reduce((acc: number, e: any) => acc + e.amount, 0).toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}
                    </p>
                    {(() => {
                      const { balance, owe } = getUserBalanceInGroup(group.id);
                      return group.status ? (
                        <p className="text-muted" style={{ fontSize: "0.85rem" }}>{group.status}</p>
                      ) : (
                        balance > 0.1 ? (
                          <p style={{ color: owe ? "var(--danger)" : "var(--primary)", fontSize: "0.85rem", fontWeight: 500 }}>
                            {owe ? `${t('owe')} ${t('currency')} ${balance.toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}` : `${t('owed')} ${t('currency')} ${balance.toLocaleString(t('number_format'), { minimumFractionDigits: 2 })}`}
                          </p>
                        ) : (
                          <p className="text-success" style={{ fontSize: "0.85rem" }}>{t('all_settled')}</p>
                        )
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex-center">
                {/* Avatars from members */}
                <div style={{ display: "flex", marginLeft: 10 }}>
                  {group.members?.slice(0, 3).map((member: any, idx: number) => (
                    <img
                      key={idx}
                      src={member.avatar || "https://github.com/shadcn.png"}
                      className="avatar"
                      style={{ width: 24, height: 24, marginLeft: -10, border: "2px solid var(--bg-card)" }}
                      alt={member.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push("/new-group")}
        className="btn btn-primary"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          padding: 0,
          boxShadow: "var(--shadow-glow)"
        }}
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
