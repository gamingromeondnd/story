import { ACCESS_UNLOCK_DAYS } from "@/src/lib/appConstants";
import type { PlanType } from "@/src/lib/subscriptionPlans";
import type { ContentItem, PlatformUser, UserProfile } from "@/src/types/platform";

export type ProfileRow = {
    id: string;
    email: string;
    plan_type: PlanType | null;
    access_locked: boolean | null;
    access_expires_at: string | null;
    background_play_enabled: boolean | null;
    screen_off_playback_enabled: boolean | null;
    all_topics_unlocked: boolean | null;
};

export type ContentRow = {
    id: string;
    topic_name: string | null;
    title: string | null;
    image_url: string | null;
    audio_url: string | null;
};

export type SettingsRow = {
    id: string;
    paypal_email: string | null;
};

export const PROFILE_SELECT_FIELDS =
    "id, email, plan_type, access_locked, access_expires_at, background_play_enabled, screen_off_playback_enabled, all_topics_unlocked";
export const CONTENT_SELECT_FIELDS = "id, topic_name, title, image_url, audio_url";
export const SETTINGS_SELECT_FIELDS = "id, paypal_email";

const ACCESS_UNLOCK_MS = ACCESS_UNLOCK_DAYS * 24 * 60 * 60 * 1000;

export function isAccessExpired(accessExpiresAt: string | null): boolean {
    if (!accessExpiresAt) {
        return false;
    }

    const expiresAtMs = Date.parse(accessExpiresAt);

    if (Number.isNaN(expiresAtMs)) {
        return true;
    }

    return expiresAtMs <= Date.now();
}

function hasActiveAccessWindow(accessExpiresAt: string | null): boolean {
    if (!accessExpiresAt) {
        return false;
    }

    const expiresAtMs = Date.parse(accessExpiresAt);

    if (Number.isNaN(expiresAtMs)) {
        return false;
    }

    return expiresAtMs > Date.now();
}

export function calculateAccessExpiresAt(accessLocked: boolean, nowMs = Date.now()): string | null {
    return accessLocked ? null : new Date(nowMs + ACCESS_UNLOCK_MS).toISOString();
}

export function mapProfileRow(row: ProfileRow): UserProfile {
    const accessExpiresAt = row.access_expires_at ?? null;
    const accessLocked = Boolean(row.access_locked) || !hasActiveAccessWindow(accessExpiresAt);

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

export function mapPlatformUserRow(row: ProfileRow): PlatformUser {
    return mapProfileRow(row);
}

export function mapContentRow(row: ContentRow): ContentItem {
    return {
        id: row.id,
        topicName: row.topic_name ?? "",
        title: row.title ?? "",
        imageUrl: row.image_url ?? "",
        audioUrl: row.audio_url ?? "",
    };
}
