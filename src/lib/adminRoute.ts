import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    ADMIN_SESSION_COOKIE,
    getAdminAuthConfigError,
    verifyAdminSessionValue,
} from "@/src/lib/adminSession";

export async function requireAdminRouteAccess() {
    const configError = getAdminAuthConfigError();

    if (configError) {
        return NextResponse.json(
            {
                authenticated: false,
                error: configError,
                code: "admin_auth_not_configured",
            },
            { status: 503 },
        );
    }

    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!verifyAdminSessionValue(sessionValue)) {
        return NextResponse.json(
            {
                authenticated: false,
                error: "Admin authentication required.",
                code: "admin_auth_required",
            },
            { status: 401 },
        );
    }

    return null;
}
