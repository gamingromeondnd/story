import { cookies } from "next/headers";
import AdminDashboard from "@/src/components/AdminDashboard";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/src/lib/adminSession";

export default async function AdminPage() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const initialHasAccess = verifyAdminSessionValue(sessionValue);

    return <AdminDashboard initialHasAccess={initialHasAccess} />;
}
