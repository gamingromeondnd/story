import { NextResponse } from "next/server";
import { requireAdminRouteAccess } from "@/src/lib/adminRoute";
import { calculateAccessExpiresAt } from "@/src/lib/platformData";
import { type FeatureKey, type PlanType } from "@/src/lib/subscriptionPlans";
import { getSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import type { Database } from "@/src/types/supabase";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function isPlanType(value: string): value is PlanType {
    return ["guest", "basic", "premium", "pro", "elite"].includes(value);
}

function isFeatureKey(value: string): value is FeatureKey {
    return ["backgroundPlayEnabled", "screenOffPlaybackEnabled", "allTopicsUnlocked"].includes(value);
}

export async function PATCH(request: Request) {
    const accessError = await requireAdminRouteAccess();

    if (accessError) {
        return accessError;
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const action = typeof body?.action === "string" ? body.action : "";
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

    if (!userId) {
        return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    try {
        const supabase = getSupabaseAdminClient();

        if (action === "plan") {
            const planType = typeof body?.planType === "string" ? body.planType : "";

            if (!isPlanType(planType)) {
                return NextResponse.json({ error: "Valid plan type is required." }, { status: 400 });
            }

            const { error } = await supabase.from("profiles").update({ plan_type: planType }).eq("id", userId);

            if (error) {
                throw error;
            }

            return NextResponse.json({ ok: true });
        }

        if (action === "access") {
            const accessLocked = typeof body?.accessLocked === "boolean" ? body.accessLocked : null;

            if (accessLocked === null) {
                return NextResponse.json({ error: "accessLocked must be true or false." }, { status: 400 });
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    access_locked: accessLocked,
                    access_expires_at: calculateAccessExpiresAt(accessLocked),
                })
                .eq("id", userId);

            if (error) {
                throw error;
            }

            return NextResponse.json({ ok: true });
        }

        if (action === "feature") {
            const featureKey = typeof body?.featureKey === "string" ? body.featureKey : "";
            const enabled = typeof body?.enabled === "boolean" ? body.enabled : null;

            if (!isFeatureKey(featureKey) || enabled === null) {
                return NextResponse.json({ error: "Valid feature update is required." }, { status: 400 });
            }

            const featureUpdate: ProfileUpdate =
                featureKey === "backgroundPlayEnabled"
                    ? { background_play_enabled: enabled }
                    : featureKey === "screenOffPlaybackEnabled"
                      ? { screen_off_playback_enabled: enabled }
                      : { all_topics_unlocked: enabled };

            const { error } = await supabase.from("profiles").update(featureUpdate).eq("id", userId);

            if (error) {
                throw error;
            }

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Unsupported admin user action." }, { status: 400 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not update user.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
