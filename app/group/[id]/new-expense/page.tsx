import NewExpenseClient from "./NewExpenseClient";

export async function generateStaticParams() {
    return [];
}

export default function Page() {
    return <NewExpenseClient />;
}
