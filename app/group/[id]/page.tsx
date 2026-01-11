import GroupDetailsClient from "./GroupDetailsClient";

export async function generateStaticParams() {
    return [{ id: 'dummy' }];
}

export default function Page() {
    return <GroupDetailsClient />;
}
