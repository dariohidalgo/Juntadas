import EditExpenseClient from "./EditExpenseClient";

export async function generateStaticParams() {
    return [{ id: 'dummy', expenseId: 'dummy' }];
}

export default function Page() {
    return <EditExpenseClient />;
}
