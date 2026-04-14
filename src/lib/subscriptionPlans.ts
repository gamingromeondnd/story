export type PlanType = "guest" | "basic" | "premium" | "pro" | "elite";

export type FeatureKey = "backgroundPlayEnabled" | "screenOffPlaybackEnabled" | "allTopicsUnlocked";

export interface SubscriptionPlanSection {
    title: string;
    topics: string[];
}

export interface SubscriptionPlanDefinition {
    name: string;
    price: string;
    badge: string;
    summary: string;
    sections: SubscriptionPlanSection[];
    unlockedTopics: string[];
    includedFeatures: FeatureKey[];
}

function createPlanDefinition(config: Omit<SubscriptionPlanDefinition, "unlockedTopics">): SubscriptionPlanDefinition {
    return {
        ...config,
        unlockedTopics: config.sections.flatMap((section) => section.topics),
    };
}

export const subscriptionPlans: Record<PlanType, SubscriptionPlanDefinition> = {
    guest: createPlanDefinition({
        name: "Guest",
        price: "$0.00",
        badge: "Preview",
        summary: "Preview the platform until the admin assigns a paid plan.",
        sections: [],
        includedFeatures: [],
    }),
    basic: createPlanDefinition({
        name: "Basic",
        price: "$2.99",
        badge: "Entry",
        summary: "Entry + free-type content",
        sections: [
            {
                title: "Sleep / Relax / ASMR",
                topics: [
                    "Sleep Story",
                    "Bedtime Story",
                    "Guided Sleep Meditation / Story",
                    "Relaxation Story",
                    "Nature Sound Story",
                    "ASMR Storytelling",
                    "Whispered Story",
                    "Calm Narration / Lofi Story",
                    "White Noise + Story",
                ],
            },
            {
                title: "Comedy / Light / Fun",
                topics: [
                    "Comedy Story",
                    "Humorous Story",
                    "Satire Story",
                    "Slice of Life Comedy",
                    "Absurdist Story",
                ],
            },
            {
                title: "Basic Educational",
                topics: [
                    "Motivational Story",
                    "Inspirational Story",
                    "Educational Story",
                ],
            },
        ],
        includedFeatures: [],
    }),
    premium: createPlanDefinition({
        name: "Premium",
        price: "$9.99",
        badge: "Main Money",
        summary: "Viral + addictive",
        sections: [
            {
                title: "Horror / Dark / Scary",
                topics: [
                    "Horror Story",
                    "Ghost Story",
                    "Paranormal Story",
                    "Haunted Story",
                    "Creepypasta",
                    "Urban Legend",
                    "Dark Fantasy",
                    "Supernatural Story",
                    "Monster Story",
                    "Demon Story",
                    "Vampire Story",
                    "Zombie Story",
                    "Psychological Horror",
                    "Cosmic Horror",
                    "Highbrow / Literary Horror",
                    "Found Footage Horror",
                    "Folk Horror",
                    "Campfire Stories",
                ],
            },
            {
                title: "Romance / Love / Drama",
                topics: [
                    "Romance Story",
                    "Love Story",
                    "Contemporary Romance",
                    "Historical Romance",
                    "Paranormal Romance",
                    "Spicy Romance / Erotica",
                    "Enemies to Lovers",
                    "Rom-Com (Comedy Romance)",
                    "LGBTQ+ Romance",
                    "Second Chance Romance",
                    "Sports Romance",
                    "Billionaire Romance",
                ],
            },
            {
                title: "Fantasy (Basic)",
                topics: [
                    "Fantasy Story",
                    "Fairy Tale",
                    "Magical Story",
                    "Romantasy",
                    "YA Fantasy",
                    "Cozy Fantasy",
                ],
            },
            {
                title: "Mystery / Thriller (Basic)",
                topics: [
                    "Mystery Story",
                    "Crime Story",
                    "True Crime",
                    "Thriller",
                    "Suspense Story",
                ],
            },
        ],
        includedFeatures: [],
    }),
    pro: createPlanDefinition({
        name: "Pro",
        price: "$14.99",
        badge: "Advanced",
        summary: "Advanced + full access (except VIP features)",
        sections: [
            {
                title: "Fantasy (Advanced)",
                topics: [
                    "Epic Fantasy",
                    "Dark Fantasy (Grimdark)",
                    "Mythology Story",
                    "Wizard / Witch Story",
                    "Dragon Story",
                    "High Fantasy",
                    "Low Fantasy",
                    "Urban Fantasy",
                    "Spicy Romantasy / Enemies to Lovers",
                ],
            },
            {
                title: "Mystery / Thriller (Advanced)",
                topics: [
                    "Detective Story",
                    "Psychological Thriller",
                    "Investigation Story",
                    "Domestic Thriller",
                    "Cozy Mystery",
                    "Noir / Hardboiled Detective",
                    "Legal Thriller",
                    "Dark Academia Thriller",
                ],
            },
            {
                title: "Sci-Fi / Futuristic",
                topics: [
                    "Science Fiction (Sci-Fi)",
                    "Space Adventure / Opera",
                    "Alien Story",
                    "Time Travel Story",
                    "Cyberpunk",
                    "Futuristic Story",
                    "Robot / AI Story",
                    "Dystopian",
                    "Post-Apocalyptic",
                    "Hard Sci-Fi",
                    "Soft Sci-Fi",
                    "LitRPG / GameLit",
                ],
            },
            {
                title: "Adventure / Action",
                topics: [
                    "Adventure Story",
                    "Survival Story",
                    "Exploration Story",
                    "Treasure Hunt",
                    "Pirate Story",
                    "War Story",
                    "Military Adventure",
                    "Steampunk Adventure",
                    "Historical Adventure",
                ],
            },
            {
                title: "Educational (Full)",
                topics: [
                    "History Story",
                    "Biography / Memoir Story",
                    "Self-Improvement / Personal Development",
                    "True Story Narratives",
                    "Philosophical Story",
                    "Myth Retold",
                    "Celebrity Memoir / Music Memoir",
                    "Docu-drama Audio Story",
                    "Epistolary Story",
                ],
            },
        ],
        includedFeatures: [],
    }),
    elite: createPlanDefinition({
        name: "Elite / Ultimate",
        price: "$29.99",
        badge: "VIP",
        summary: "Full topic unlock plus premium playback features",
        sections: [
            {
                title: "Elite / Ultimate",
                topics: [],
            },
        ],
        includedFeatures: ["backgroundPlayEnabled", "screenOffPlaybackEnabled", "allTopicsUnlocked"],
    }),
};

export function getResolvedFeatures(
    planType: PlanType,
    overrides?: Partial<Record<FeatureKey, boolean>>,
) {
    const included = new Set(subscriptionPlans[planType].includedFeatures);

    return {
        backgroundPlayEnabled: included.has("backgroundPlayEnabled") || Boolean(overrides?.backgroundPlayEnabled),
        screenOffPlaybackEnabled:
            included.has("screenOffPlaybackEnabled") || Boolean(overrides?.screenOffPlaybackEnabled),
        allTopicsUnlocked: included.has("allTopicsUnlocked") || Boolean(overrides?.allTopicsUnlocked),
    };
}

export function getAllowedTopicsForPlan(planType: PlanType) {
    if (planType === "elite") {
        return [] as string[];
    }

    const orderedPlans: PlanType[] = ["basic", "premium", "pro"];
    const planIndex = orderedPlans.indexOf(planType);

    if (planIndex === -1) {
        return [];
    }

    return orderedPlans.slice(0, planIndex + 1).flatMap((currentPlan) => subscriptionPlans[currentPlan].unlockedTopics);
}

export function getRequiredPlanForTopic(topicName: string): PlanType {
    const orderedPlans: PlanType[] = ["basic", "premium", "pro"];
    const normalizedTopic = topicName.trim().toLowerCase();

    const matchedPlan = orderedPlans.find((planType) =>
        subscriptionPlans[planType].unlockedTopics.some((topic) => topic.toLowerCase() === normalizedTopic),
    );

    return matchedPlan ?? "elite";
}
