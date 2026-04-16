import { NextResponse } from "next/server";
import { SETTINGS_DOC_ID } from "@/src/lib/appConstants";
import { requireAdminRouteAccess } from "@/src/lib/adminRoute";
import {
    CONTENT_SELECT_FIELDS,
    mapContentRow,
    mapPlatformUserRow,
    PROFILE_SELECT_FIELDS,
    SETTINGS_SELECT_FIELDS,
    type ContentRow,
    type ProfileRow,
    type SettingsRow,
} from "@/src/lib/platformData";
import { getSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function GET() {
    const accessError = await requireAdminRouteAccess();

    if (accessError) {
        return accessError;
    }

    try {
        const supabase = getSupabaseAdminClient();
        const [usersResult, contentResult, settingsResult] = await Promise.all([
            supabase
                .from("profiles")
                .select(PROFILE_SELECT_FIELDS)
                .order("email", { ascending: true })
                .returns<ProfileRow[]>(),
            supabase
                .from("content")
                .select(CONTENT_SELECT_FIELDS)
                .order("created_at", { ascending: false })
                .returns<ContentRow[]>(),
            supabase
                .from("settings")
                .select(SETTINGS_SELECT_FIELDS)
                .eq("id", SETTINGS_DOC_ID)
                .maybeSingle(),
        ]);

        const firstError = usersResult.error ?? contentResult.error ?? settingsResult.error;

        if (firstError) {
            throw firstError;
        }

        const settings = settingsResult.data as SettingsRow | null;

        return NextResponse.json({
            users: (usersResult.data ?? []).map(mapPlatformUserRow),
            content: (contentResult.data ?? []).map(mapContentRow),
            paypalEmail: settings?.paypal_email ?? "",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load admin data.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
