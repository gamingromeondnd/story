export interface Database {
    public: {
        Tables: {
            content: {
                Row: {
                    id: string;
                    topic_name: string;
                    title: string;
                    image_url: string;
                    audio_url: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    topic_name: string;
                    title: string;
                    image_url: string;
                    audio_url: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    topic_name?: string;
                    title?: string;
                    image_url?: string;
                    audio_url?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    plan_type: string;
                    access_locked: boolean;
                    access_expires_at: string | null;
                    background_play_enabled: boolean;
                    screen_off_playback_enabled: boolean;
                    all_topics_unlocked: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string;
                    plan_type?: string;
                    access_locked?: boolean;
                    access_expires_at?: string | null;
                    background_play_enabled?: boolean;
                    screen_off_playback_enabled?: boolean;
                    all_topics_unlocked?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    plan_type?: string;
                    access_locked?: boolean;
                    access_expires_at?: string | null;
                    background_play_enabled?: boolean;
                    screen_off_playback_enabled?: boolean;
                    all_topics_unlocked?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            settings: {
                Row: {
                    id: string;
                    paypal_email: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    paypal_email?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    paypal_email?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}
