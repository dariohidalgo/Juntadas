"use client";
import React, { createContext, useContext, useState } from "react";

const translations = {
    es: {
        welcome: "Divida cuentas, mantenga amistades.",
        login_google: "Entrar con Google",
        dashboard_title: "Tus Grupos",
        view_all: "Ver todos",
        owe: "Debes",
        owed: "Te deben",
        save: "Guardar",
        new_expense: "Nuevo Gasto",
        total: "Total",
        total_value: "VALOR TOTAL",
        description: "DESCRIPCIÓN",
        who_paid: "¿Quién pagó?",
        how_split: "¿Cómo dividir?",
        add_participant: "Añadir Participante",
        equal: "Igual",
        details_owe: "Debes a",
        details_receive: "Te debe",
        balances_debts: "Saldos y Deudas",
        activities: "Actividades",
        today: "HOY",
        yesterday: "AYER",
        loading: "Cargando...",
        hello: "Hola",
        bills: "facturas",
        group_name: "NOMBRE DEL GRUPO",
        invite_friends: "INVITAR AMIGOS",
        group_placeholder: "Ej: Viaje a París",
        you_owe_upper: "DEBES",
        you_receive_upper: "TE DEBEN",
        to_members: "A los miembros del grupo",
        from_members: "De los miembros del grupo",
        pay_now: "Pagar ahora",
        all_settled: "¡Todo listo! Nadie debe nada.",
        no_expenses: "No hay gastos todavía.",
        paid_by: "Pagado por",
        you: "Tú",
        percent: "Porcentaje",
        exact: "Valor Exacto",
        splitting_equally: "Dividiendo igualmente",
        currency: "$",
        number_format: "es-ES",
        upgrade_pro: "Mejorar a Pro",
        limit_reached: "Límite de grupos alcanzado",
        group_limit_msg: "Has alcanzado el límite de 3 grupos para la versión gratuita.",
        remove_ads: "Eliminar anuncios",
        sponsored: "Patrocinado",
        pro_version: "Versión Pro",
        ad_title: "Antigravity AI",
        ad_desc: "Potencia tu flujo de trabajo con IA avanzada.",
        view: "Ver",
        edit_expense: "Editar Gasto",
        confirm_delete_expense: "¿Eliminar este gasto?",
        invite_msg: "Si no tienen la app, envíales este link para que se unan al descargarla:",
        copy_app_link: "Copiar Link de la App",
        link_copied: "¡Link copiado!",
        not_included: "No incluido",
        owes: "debe a",
        split_between: "Dividir entre",
        delete_group: "Eliminar Grupo",
        confirm_delete_group: "¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.",
        cancel: "Cancelar",
        delete: "Eliminar"
    },
    pt: {
        welcome: "Divida contas, mantenha amizades.",
        login_google: "Entrar com Google",
        dashboard_title: "Seus Grupos",
        view_all: "Ver todos",
        owe: "Você deve",
        owed: "Te devem",
        save: "Salvar",
        new_expense: "Nova Despesa",
        total: "Total",
        total_value: "VALOR TOTAL",
        description: "DESCRIÇÃO",
        who_paid: "Quem pagou?",
        how_split: "Como dividir?",
        add_participant: "Adicionar Participante",
        equal: "Igual",
        details_owe: "Você deve a",
        details_receive: "Deve a você",
        balances_debts: "Saldos e Dívidas",
        activities: "Atividades",
        today: "HOJE",
        yesterday: "ONTEM",
        loading: "Carregando...",
        hello: "Olá",
        bills: "faturas",
        group_name: "NOME DO GRUPO",
        invite_friends: "CONVIDAR AMIGOS",
        group_placeholder: "Ex: Viagem Paris",
        you_owe_upper: "VOCÊ DEVE",
        you_receive_upper: "VOCÊ RECEBE",
        to_members: "Para os membros do grupo",
        from_members: "Dos membros do grupo",
        pay_now: "Pagar agora",
        all_settled: "Tudo certo! Ninguém deve nada.",
        no_expenses: "Nenhuma despesa ainda.",
        paid_by: "Pago por",
        you: "Você",
        percent: "Porcentagem",
        exact: "Valor Exato",
        splitting_equally: "Dividindo igualmente",
        currency: "R$",
        number_format: "pt-BR",
        upgrade_pro: "Melhore para Pro",
        limit_reached: "Limite de grupos atingido",
        group_limit_msg: "Você atingiu o limite de 3 grupos para a versão gratuita.",
        remove_ads: "Remover anúncios",
        sponsored: "Patrocinado",
        pro_version: "Versão Pro",
        ad_title: "Antigravity AI",
        ad_desc: "Aumente sua produtividade com IA avançada.",
        view: "Ver",
        edit_expense: "Editar Despesa",
        confirm_delete_expense: "Excluir esta despesa?",
        invite_msg: "Se eles não tiverem o app, envie este link para que se juntem ao baixá-lo:",
        copy_app_link: "Copiar Link do App",
        link_copied: "Link copiado!",
        not_included: "Não incluído",
        owes: "deve a",
        split_between: "Dividir entre",
        delete_group: "Excluir Grupo",
        confirm_delete_group: "Tem certeza de que deseja excluir este grupo? Esta ação não pode ser desfeita.",
        cancel: "Cancelar",
        delete: "Excluir"
    }
};

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<"es" | "pt">("es");

    const t = (key: string) => {
        return translations[lang][key as keyof typeof translations["pt"]] || key;
    };

    const toggleLang = () => {
        setLang(prev => prev === "es" ? "pt" : "es");
    };

    return (
        <LanguageContext.Provider value={{ lang, t, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLang = () => useContext(LanguageContext);
