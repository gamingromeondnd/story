"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
    ensureUserProfile,
    fetchUserProfile,
    subscribeToUserProfile,
} from "@/src/lib/supabaseData";
import type { PlanType } from "@/src/lib/subscriptionPlans";
import type { UserProfile } from "@/src/types/platform";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;
        let stopProfileSubscription: (() => void) | null = null;

        const fallbackProfile = (activeUser: User): UserProfile => ({
            id: activeUser.id,
            email: activeUser.email ?? "",
            planType: "guest" as PlanType,
            accessLocked: false,
            accessExpiresAt: null,
            backgroundPlayEnabled: false,
            screenOffPlaybackEnabled: false,
            allTopicsUnlocked: false,
        });

        const stopLiveProfile = () => {
            if (stopProfileSubscription) {
                stopProfileSubscription();
                stopProfileSubscription = null;
            }
        };

        const refreshProfile = async (activeUser: User) => {
            try {
                const nextProfile = await fetchUserProfile(activeUser.id);

                if (!isActive) {
                    return;
                }

                setProfile(nextProfile ?? fallbackProfile(activeUser));
            } catch (error) {
                console.error("Error loading Supabase profile:", error);

                if (isActive) {
                    setProfile(fallbackProfile(activeUser));
                }
            }
        };

        const syncUserState = async (nextUser: User | null) => {
            stopLiveProfile();
            setUser(nextUser);

            if (!nextUser) {
                setProfile(null);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                await ensureUserProfile(nextUser);
                await refreshProfile(nextUser);
            } catch (error) {
                console.error("Error preparing Supabase profile:", error);

                if (isActive) {
                    setProfile(fallbackProfile(nextUser));
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }

            stopProfileSubscription = subscribeToUserProfile(nextUser.id, (nextProfile) => {
                if (!isActive) {
                    return;
                }

                setProfile(nextProfile ?? fallbackProfile(nextUser));
            });
        };

        void supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error("Error loading Supabase session:", error);
                setLoading(false);
                return;
            }

            void syncUserState(data.session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            void syncUserState(session?.user ?? null);
        });

        return () => {
            isActive = false;
            stopLiveProfile();
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
