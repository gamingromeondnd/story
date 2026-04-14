import type { PlanType } from "@/src/lib/subscriptionPlans";

export interface PlatformUser {
    id: string;
    email: string;
    planType: PlanType;
    accessLocked: boolean;
    accessExpiresAt: string | null;
    backgroundPlayEnabled: boolean;
    screenOffPlaybackEnabled: boolean;
    allTopicsUnlocked: boolean;
}

export interface ContentItem {
    id: string;
    topicName: string;
    title: string;
    imageUrl: string;
    audioUrl: string;
}
