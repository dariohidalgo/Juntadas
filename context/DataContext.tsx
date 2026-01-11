"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, arrayUnion, Timestamp, getDocs, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// DataContext definition
const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [groups, setGroups] = useState<any[]>([]);
    const { user } = useAuth();

    // Listen to Firestore groups where user is a member
    useEffect(() => {
        if (!user) {
            setGroups([]);
            return;
        }

        const q = query(collection(db, "groups"), where("memberIds", "array-contains", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const groupsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGroups(groupsData);
        }, (error) => {
            console.error("Firestore Groups error:", error);
            if (error.code === 'permission-denied') {
                console.warn("Permission denied. Ensure Firestore is enabled in 'Test Mode'.");
            }
        });

        return () => unsubscribe();
    }, [user]);

    const addGroup = async (name: string, emails: string[]) => {
        if (!user) return;

        // Current member list only includes the creator
        const memberIds = [user.uid];
        const members = [{ id: user.uid, name: user.displayName || "Yo", avatar: user.photoURL || "" }];

        const newGroup = {
            name,
            balance: 0,
            owe: false,
            status: "Sin gastos",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=100&q=80",
            memberIds,
            members,
            expenses: [],
            createdAt: Timestamp.now(),
            createdBy: user.uid
        };

        try {
            const docRef = await addDoc(collection(db, "groups"), newGroup);
            const groupId = docRef.id;

            // Handle invitations for each email
            for (const email of emails) {
                await inviteUserByEmail(groupId, email);
            }
        } catch (error: any) {
            console.error("Error adding group:", error);
            if (error.code === 'permission-denied') {
                alert("Error de permisos en Firebase. Asegúrate de haber habilitado Firestore en 'Modo de Prueba' en la Consola.");
            } else {
                alert("Error al crear el grupo: " + error.message);
            }
        }
    };

    const settleBalance = async (groupId: string, fromId: string, toId: string, amount: number) => {
        try {
            const group = groups.find(g => g.id === groupId);
            if (!group) return;

            const fromUser = group.members.find((m: any) => m.id === fromId);
            const toUser = group.members.find((m: any) => m.id === toId);

            const settlementExpense = {
                id: `settle-${Date.now()}`,
                title: `Pago: de ${fromUser?.name || 'Usuario'} a ${toUser?.name || 'Usuario'}`,
                paidBy: fromUser?.name || 'Usuario',
                paidById: fromId,
                amount: amount,
                splitAmongIds: [toId], // Only the person receiving the money is "involved" in this negative share
                date: "Hoy",
                icon: "check",
                isSettlement: true,
                createdAt: Timestamp.now()
            };

            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                expenses: arrayUnion(settlementExpense)
            });

            // Note: the summary 'balance' field is now less critical as we should derive from history
            // But we'll keep updating it for the main list view.
            // We need to re-derive the current user's balance from the whole history.
        } catch (error) {
            console.error("Error settling balance:", error);
        }
    };

    const addExpense = async (groupId: string, description: string, amount: number, paidById: string, splitAmongIds: string[]) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const payer = group.members.find((m: any) => m.id === paidById);
        const paidBy = payer ? payer.name : "Usuario";

        const newExpense = {
            id: Date.now().toString(),
            title: description,
            paidBy,
            paidById,
            amount,
            splitAmongIds,
            date: "Ahora",
            icon: "receipt",
            createdAt: Timestamp.now()
        };

        // Derive new summary balances for the whole group from history
        const debts = getGroupDebts(groupId);
        // This is a bit complex since 'balance' in the doc is 'for the current user'.
        // We'll keep updating the 'balance' and 'owe' for the person who performed the action,
        // but ideally we should update it for everyone or just remove it.
        // For now, let's stay consistent with the 'getUserBalanceInGroup' logic.
        const { balance: newerBalance, owe: newerOwe } = getUserBalanceInGroup(groupId);

        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                expenses: arrayUnion(newExpense),
                balance: parseFloat(newerBalance.toFixed(2)),
                owe: newerOwe,
                status: null
            });
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const deleteExpense = async (groupId: string, expenseId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const updatedExpenses = group.expenses.filter((e: any) => e.id !== expenseId);

        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                expenses: updatedExpenses
            });
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const updateExpense = async (groupId: string, expenseId: string, description: string, amount: number, paidById: string, splitAmongIds: string[]) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const payer = group.members.find((m: any) => m.id === paidById);
        const paidBy = payer ? payer.name : "Usuario";

        const updatedExpenses = group.expenses.map((e: any) =>
            e.id === expenseId ? {
                ...e,
                title: description,
                amount,
                paidBy,
                paidById,
                splitAmongIds,
                // keep icon and createdAt
            } : e
        );

        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                expenses: updatedExpenses,
                status: null
            });
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };

    const calculateNewBalance = (group: any, amount: number, paidById: string, splitAmongIds: string[], action: "add" | "remove") => {
        let currentBalance = group.balance || 0;
        let currentOwe = group.owe || false;

        if (!user) return { balance: currentBalance, owe: currentOwe };

        const isMePayer = paidById === user.uid;
        const isMeIncluded = splitAmongIds.includes(user.uid);

        if (!isMePayer && !isMeIncluded) {
            return { balance: currentBalance, owe: currentOwe };
        }

        const share = amount / (splitAmongIds.length || 1);

        let diff = 0;
        if (isMePayer && isMeIncluded) {
            // I paid for myself and others. Others owe me (Total - MyShare)
            diff = amount - share;
        } else if (isMePayer && !isMeIncluded) {
            // I paid for others only. Others owe me Total.
            diff = amount;
        } else if (!isMePayer && isMeIncluded) {
            // Someone else paid for me. I owe them MyShare.
            diff = -share;
        }

        const change = action === "add" ? diff : -diff;

        if (change > 0) {
            // Positive change: others owe me more or I owe them less
            if (currentOwe) {
                const net = currentBalance - change;
                if (net < 0) {
                    currentBalance = Math.abs(net);
                    currentOwe = false;
                } else {
                    currentBalance = net;
                }
            } else {
                currentBalance += change;
            }
        } else if (change < 0) {
            // Negative change: I owe others more or they owe me less
            const absChange = Math.abs(change);
            if (!currentOwe) {
                const net = currentBalance - absChange;
                if (net < 0) {
                    currentBalance = Math.abs(net);
                    currentOwe = true;
                } else {
                    currentBalance = net;
                }
            } else {
                currentBalance += absChange;
            }
        }

        return { balance: currentBalance, owe: currentOwe };
    };

    const getGroupDebts = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return [];

        const netBalances: { [key: string]: number } = {};
        group.members.forEach((m: any) => netBalances[m.id] = 0);

        group.expenses.forEach((e: any) => {
            let payerId = e.paidById;

            // Fallback for older expenses without paidById
            if (!payerId) {
                const isMe = e.paidBy === "Yo" || e.paidBy === "Tú" || e.paidBy === "Você" || e.paidBy === user?.displayName;
                if (isMe) {
                    payerId = user?.uid;
                } else {
                    const found = group.members.find((m: any) => m.name === e.paidBy);
                    payerId = found?.id;
                }
            }

            if (!payerId) return;

            const splitAmong = e.splitAmongIds || group.memberIds;
            const amount = e.amount;

            if (e.isSettlement) {
                // Settlement: Payer gave money to someone.
                // Payer balance increases (they gave), Recipient balance decreases (they received).
                const recipientId = splitAmong[0];
                if (netBalances[payerId] !== undefined) netBalances[payerId] += amount;
                if (netBalances[recipientId] !== undefined) netBalances[recipientId] -= amount;
            } else {
                const share = amount / (splitAmong.length || 1);
                if (netBalances[payerId] !== undefined) netBalances[payerId] += amount;
                splitAmong.forEach((uid: string) => {
                    if (netBalances[uid] !== undefined) netBalances[uid] -= share;
                });
            }
        });

        const creditors = Object.entries(netBalances)
            .filter(([_, bal]) => (bal as number) > 0.1)
            .sort((a, b) => (b[1] as number) - (a[1] as number));
        const debtors = Object.entries(netBalances)
            .filter(([_, bal]) => (bal as number) < -0.1)
            .map(([id, bal]) => [id, Math.abs(bal as number)])
            .sort((a, b) => (b[1] as number) - (a[1] as number));

        const debts = [];
        let i = 0, j = 0;
        const tempCreditors = creditors.map(c => [c[0], Number(c[1])]);
        const tempDebtors = debtors.map(d => [d[0], Number(d[1])]);

        while (i < tempCreditors.length && j < tempDebtors.length) {
            const creditor = tempCreditors[i];
            const debtor = tempDebtors[j];
            const amount = Math.min(Number(creditor[1]), Number(debtor[1]));

            debts.push({
                from: String(debtor[0]),
                to: String(creditor[0]),
                amount: parseFloat(amount.toFixed(2))
            });

            const newCreditorBal = Number(creditor[1]) - amount;
            const newDebtorBal = Number(debtor[1]) - amount;

            creditor[1] = newCreditorBal;
            debtor[1] = newDebtorBal;

            if (newCreditorBal < 0.1) i++;
            if (newDebtorBal < 0.1) j++;
        }

        return debts;
    };

    const getUserBalanceInGroup = (groupId: string) => {
        if (!user) return { balance: 0, owe: false };
        const debts = getGroupDebts(groupId);

        let myTotalOwe = 0;
        let myTotalOwed = 0;

        debts.forEach((d: any) => {
            if (d.from === user.uid) myTotalOwe += d.amount;
            if (d.to === user.uid) myTotalOwed += d.amount;
        });

        if (myTotalOwe >= myTotalOwed) {
            return { balance: myTotalOwe - myTotalOwed, owe: true };
        } else {
            return { balance: myTotalOwed - myTotalOwe, owe: false };
        }
    };

    const inviteUserByEmail = async (groupId: string, email: string) => {
        try {
            // 1. Check if user exists
            const q = query(collection(db, "users"), where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // User exists, add to group directly
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const groupRef = doc(db, "groups", groupId);
                await updateDoc(groupRef, {
                    memberIds: arrayUnion(userData.uid),
                    members: arrayUnion({
                        id: userData.uid,
                        name: userData.displayName || "Usuario",
                        avatar: userData.photoURL || ""
                    })
                });
                return { success: true, message: "Usuario añadido al grupo" };
            } else {
                // User doesn't exist, create pending invitation
                await addDoc(collection(db, "invitations"), {
                    email,
                    groupId,
                    createdAt: Timestamp.now()
                });
                return { success: true, message: "Invitación pendiente enviada" };
            }
        } catch (error: any) {
            console.error("Error inviting user:", error);
            alert("Error al invitar: " + error.message);
            return { success: false, message: "Error al invitar al usuario" };
        }
    };

    const deleteGroup = async (groupId: string) => {
        try {
            await deleteDoc(doc(db, "groups", groupId));
        } catch (error) {
            console.error("Error deleting group:", error);
        }
    };

    const getGroup = (id: string) => groups.find(g => g.id === id);

    return (
        <DataContext.Provider value={{ groups, addGroup, addExpense, updateExpense, deleteExpense, getGroup, settleBalance, inviteUserByEmail, getGroupDebts, getUserBalanceInGroup, deleteGroup }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
