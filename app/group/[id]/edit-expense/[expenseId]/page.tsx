import EditExpenseClient from "./EditExpenseClient";

export async function generateStaticParams() {
    return [];
}

export default function Page() {
    return <EditExpenseClient />;
}
