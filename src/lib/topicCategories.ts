export interface TopicCategoryGroup {
    label: string;
    topics: string[];
}

export interface TopicEntry {
    label: string;
    topic: string;
    sortKey: string;
    number: number;
}

export const topicCategoryGroups: TopicCategoryGroup[] = [
    {
        label: "Sleep / Relax / ASMR Style",
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
        label: "Horror / Dark / Scary",
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
        label: "Mystery / Thriller / Crime",
        topics: [
            "Mystery Story",
            "Detective Story",
            "Crime Story",
            "True Crime",
            "Thriller",
            "Psychological Thriller",
            "Suspense Story",
            "Investigation Story",
            "Domestic Thriller",
            "Cozy Mystery",
            "Noir / Hardboiled Detective",
            "Legal Thriller",
            "Dark Academia Thriller",
        ],
    },
    {
        label: "Fantasy / Magic / Romantasy",
        topics: [
            "Fantasy Story",
            "Fairy Tale",
            "Magical Story",
            "Epic Fantasy",
            "Dark Fantasy (Grimdark)",
            "Mythology Story",
            "Wizard / Witch Story",
            "Dragon Story",
            "Romantasy",
            "High Fantasy",
            "Low Fantasy",
            "Urban Fantasy",
            "YA Fantasy",
            "Spicy Romantasy / Enemies to Lovers",
            "Cozy Fantasy",
        ],
    },
    {
        label: "Sci-Fi / Futuristic",
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
        label: "Adventure / Action",
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
        label: "Romance / Love / Drama",
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
        label: "Comedy / Light / Fun",
        topics: [
            "Comedy Story",
            "Humorous Story",
            "Satire Story",
            "Slice of Life Comedy",
            "Absurdist Story",
        ],
    },
    {
        label: "Real / Inspirational / Educational",
        topics: [
            "History Story",
            "Biography / Memoir Story",
            "Motivational Story",
            "Self-Improvement / Personal Development",
            "Educational Story",
            "Inspirational Story",
            "True Story Narratives",
            "Philosophical Story",
            "Myth Retold",
            "Celebrity Memoir / Music Memoir",
            "Docu-drama Audio Story",
            "Epistolary Story",
        ],
    },
    {
        label: "Other Popular / Emerging Styles (2025-2026 Trends)",
        topics: [
            "Audio Drama",
            "NoSleep Style Horror",
            "Cozy Stories",
            "Coming of Age",
            "Family Saga / Drama",
            "Historical Fiction Story",
            "Alternate History",
            "Children's Bedtime / Moral Stories",
            "Superhero Story",
            "Apocalyptic Survival",
            "Serialised Short-Form Stories",
            "Soundscape-Enhanced Stories",
            "Anthology Stories",
            "Interactive Stories",
            "Immersive Binaural Audio Story",
        ],
    },
];

export const topicEntries: TopicEntry[] = topicCategoryGroups
    .flatMap((group) =>
        group.topics.map((topic, indexWithinGroup) => ({
            label: group.label,
            topic,
            sortKey: `${group.label}-${indexWithinGroup}`,
        })),
    )
    .map((entry, index) => ({
        ...entry,
        number: index + 1,
    }));
