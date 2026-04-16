import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    ADMIN_SESSION_COOKIE,
    createAdminSessionValue,
    getAdminAuthConfigError,
    getAdminSessionMaxAge,
    verifyAdminPassword,
    verifyAdminSessionValue,
} from "@/src/lib/adminSession";

export async function GET() {
    const configError = getAdminAuthConfigError();
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const authenticated = !configError && verifyAdminSessionValue(sessionValue);

    return NextResponse.json({
        authenticated,
        configured: !configError,
        error: configError,
    });
}

export async function POST(request: Request) {
    const configError = getAdminAuthConfigError();

    if (configError) {
        return NextResponse.json({ error: configError }, { status: 503 });
    }

    const body = (await request.json().catch(() => null)) as { password?: string } | null;
    const password = body?.password?.trim() ?? "";

    if (!verifyAdminPassword(password)) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
    }

    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: getAdminSessionMaxAge(),
    });

    return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);

    return NextResponse.json({ authenticated: false });
}
