import { NextResponse } from "next/server";
import { SETTINGS_DOC_ID } from "@/src/lib/appConstants";
import { requireAdminRouteAccess } from "@/src/lib/adminRoute";
import { getSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function PUT(request: Request) {
    const accessError = await requireAdminRouteAccess();

    if (accessError) {
        return accessError;
    }

    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const email = body?.email?.trim() ?? "";

    if (!email) {
        return NextResponse.json({ error: "PayPal email is required." }, { status: 400 });
    }

    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from("settings").upsert({
            id: SETTINGS_DOC_ID,
            paypal_email: email,
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not update PayPal email.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE() {
    const accessError = await requireAdminRouteAccess();

    if (accessError) {
        return accessError;
    }

    try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from("settings").delete().eq("id", SETTINGS_DOC_ID);

        if (error) {
            throw error;
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not delete PayPal email.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
