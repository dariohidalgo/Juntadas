import NewExpenseClient from "./NewExpenseClient";

export async function generateStaticParams() {
    return [{ id: 'dummy' }];
}

export default function Page() {
    return <NewExpenseClient />;
}
