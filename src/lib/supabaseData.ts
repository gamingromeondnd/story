import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SETTINGS_DOC_ID } from "@/src/lib/appConstants";
import {
    CONTENT_SELECT_FIELDS,
    mapContentRow,
    mapProfileRow,
    PROFILE_SELECT_FIELDS,
    SETTINGS_SELECT_FIELDS,
    type ContentRow,
    type ProfileRow,
    type SettingsRow,
} from "@/src/lib/platformData";
import type { UserProfile } from "@/src/types/platform";

export type { UserProfile } from "@/src/types/platform";

export async function ensureUserProfile(user: User) {
    const payload = {
        id: user.id,
        email: user.email ?? "",
    };

    const { error } = await supabase.from("profiles").upsert(payload, {
        onConflict: "id",
        ignoreDuplicates: false,
    });

    if (error) {
        throw error;
    }
}

export async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT_FIELDS)
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    const profile = data as ProfileRow | null;

    return profile ? mapProfileRow(profile) : null;
}

export async function fetchContent() {
    const { data, error } = await supabase
        .from("content")
        .select(CONTENT_SELECT_FIELDS)
        .order("created_at", { ascending: false })
        .returns<ContentRow[]>();

    if (error) {
        throw error;
    }

    return (data ?? []).map(mapContentRow);
}

export async function fetchPayPalEmail() {
    const { data, error } = await supabase
        .from("settings")
        .select(SETTINGS_SELECT_FIELDS)
        .eq("id", SETTINGS_DOC_ID)
        .maybeSingle();

    if (error) {
        throw error;
    }

    const settings = data as SettingsRow | null;

    return settings?.paypal_email ?? "";
}

export function subscribeToUserProfile(userId: string, onChange: (profile: UserProfile | null) => void) {
    const channel = supabase
        .channel(`profile-${userId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${userId}`,
            },
            async () => {
                try {
                    onChange(await fetchUserProfile(userId));
                } catch (error) {
                    console.error("Error syncing realtime profile:", error);
                }
            },
        )
        .subscribe();

    return () => {
        void supabase.removeChannel(channel);
    };
}
