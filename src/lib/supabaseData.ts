import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ACCESS_UNLOCK_DAYS, SETTINGS_DOC_ID } from "@/src/lib/appConstants";
import type { FeatureKey, PlanType } from "@/src/lib/subscriptionPlans";
import type { ContentItem, PlatformUser } from "@/src/types/platform";

export interface UserProfile {
    id: string;
    email: string;
    planType: PlanType;
    accessLocked: boolean;
    accessExpiresAt: string | null;
    backgroundPlayEnabled: boolean;
    screenOffPlaybackEnabled: boolean;
    allTopicsUnlocked: boolean;
}

type ProfileRow = {
    id: string;
    email: string;
    plan_type: PlanType | null;
    access_locked: boolean | null;
    access_expires_at: string | null;
    background_play_enabled: boolean | null;
    screen_off_playback_enabled: boolean | null;
    all_topics_unlocked: boolean | null;
};

type ContentRow = {
    id: string;
    topic_name: string | null;
    title: string | null;
    image_url: string | null;
    audio_url: string | null;
};

type SettingsRow = {
    id: string;
    paypal_email: string | null;
};

const ACCESS_UNLOCK_MS = ACCESS_UNLOCK_DAYS * 24 * 60 * 60 * 1000;

function isAccessExpired(accessExpiresAt: string | null): boolean {
    if (!accessExpiresAt) {
        return false;
    }

    const expiresAtMs = Date.parse(accessExpiresAt);

    if (Number.isNaN(expiresAtMs)) {
        return true;
    }

    return expiresAtMs <= Date.now();
}

function mapProfile(row: ProfileRow): UserProfile {
    const accessExpiresAt = row.access_expires_at ?? null;
    const accessLocked = Boolean(row.access_locked) || isAccessExpired(accessExpiresAt);

    return {
        id: row.id,
        email: row.email,
        planType: row.plan_type ?? "guest",
        accessLocked,
        accessExpiresAt,
        backgroundPlayEnabled: Boolean(row.background_play_enabled),
        screenOffPlaybackEnabled: Boolean(row.screen_off_playback_enabled),
        allTopicsUnlocked: Boolean(row.all_topics_unlocked),
    };
}

function mapPlatformUser(row: ProfileRow): PlatformUser {
    const profile = mapProfile(row);

    return {
        id: profile.id,
        email: profile.email,
        planType: profile.planType,
        accessLocked: profile.accessLocked,
        accessExpiresAt: profile.accessExpiresAt,
        backgroundPlayEnabled: profile.backgroundPlayEnabled,
        screenOffPlaybackEnabled: profile.screenOffPlaybackEnabled,
        allTopicsUnlocked: profile.allTopicsUnlocked,
    };
}

function mapContent(row: ContentRow): ContentItem {
    return {
        id: row.id,
        topicName: row.topic_name ?? "",
        title: row.title ?? "",
        imageUrl: row.image_url ?? "",
        audioUrl: row.audio_url ?? "",
    };
}

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
        .select("id, email, plan_type, access_locked, access_expires_at, background_play_enabled, screen_off_playback_enabled, all_topics_unlocked")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    const profile = data as ProfileRow | null;

    return profile ? mapProfile(profile) : null;
}

export async function fetchContent() {
    const { data, error } = await supabase
        .from("content")
        .select("id, topic_name, title, image_url, audio_url")
        .order("created_at", { ascending: false })
        .returns<ContentRow[]>();

    if (error) {
        throw error;
    }

    return (data ?? []).map(mapContent);
}

export async function createContent(values: {
    topicName: string;
    title: string;
    imageUrl: string;
    audioUrl: string;
}) {
    const { error } = await supabase.from("content").insert({
        topic_name: values.topicName.trim(),
        title: values.title.trim(),
        image_url: values.imageUrl.trim(),
        audio_url: values.audioUrl.trim(),
    });

    if (error) {
        throw error;
    }
}

export async function deleteContent(contentId: string) {
    const { error } = await supabase.from("content").delete().eq("id", contentId);

    if (error) {
        throw error;
    }
}

export async function fetchUsers() {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, plan_type, access_locked, access_expires_at, background_play_enabled, screen_off_playback_enabled, all_topics_unlocked")
        .order("email", { ascending: true })
        .returns<ProfileRow[]>();

    if (error) {
        throw error;
    }

    return (data ?? []).map(mapPlatformUser);
}

export async function updateUserPlan(userId: string, planType: PlanType) {
    const { error } = await supabase.from("profiles").update({ plan_type: planType }).eq("id", userId);

    if (error) {
        throw error;
    }
}

export async function setUserAccessLocked(userId: string, accessLocked: boolean) {
    const accessExpiresAt = accessLocked ? null : new Date(Date.now() + ACCESS_UNLOCK_MS).toISOString();

    const { error } = await supabase
        .from("profiles")
        .update({ access_locked: accessLocked, access_expires_at: accessExpiresAt })
        .eq("id", userId);

    if (error) {
        throw error;
    }
}

const featureToColumn: Record<FeatureKey, string> = {
    backgroundPlayEnabled: "background_play_enabled",
    screenOffPlaybackEnabled: "screen_off_playback_enabled",
    allTopicsUnlocked: "all_topics_unlocked",
};

export async function toggleUserFeature(userId: string, featureKey: FeatureKey, nextValue: boolean) {
    const { error } = await supabase
        .from("profiles")
        .update({ [featureToColumn[featureKey]]: nextValue })
        .eq("id", userId);

    if (error) {
        throw error;
    }
}

export async function fetchPayPalEmail() {
    const { data, error } = await supabase
        .from("settings")
        .select("id, paypal_email")
        .eq("id", SETTINGS_DOC_ID)
        .maybeSingle();

    if (error) {
        throw error;
    }

    const settings = data as SettingsRow | null;

    return settings?.paypal_email ?? "";
}

export async function savePayPalEmail(email: string) {
    const { error } = await supabase.from("settings").upsert({
        id: SETTINGS_DOC_ID,
        paypal_email: email.trim(),
    });

    if (error) {
        throw error;
    }
}

export async function clearPayPalEmail() {
    const { error } = await supabase.from("settings").delete().eq("id", SETTINGS_DOC_ID);

    if (error) {
        throw error;
    }
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

export function subscribeToUsers(onChange: (users: PlatformUser[]) => void) {
    const channel = supabase
        .channel("profiles-admin")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "profiles",
            },
            async () => {
                try {
                    onChange(await fetchUsers());
                } catch (error) {
                    console.error("Error syncing realtime users:", error);
                }
            },
        )
        .subscribe();

    return () => {
        void supabase.removeChannel(channel);
    };
}
