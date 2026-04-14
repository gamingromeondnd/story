"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeadphones, FaShieldAlt } from "react-icons/fa";
import ContentList from "@/src/components/ContentList";
import PaymentInfo from "@/src/components/PaymentInfo";
import SubscriptionPlansOverview from "@/src/components/SubscriptionPlansOverview";
import { useAuth } from "@/src/contexts/AuthContext";
import { GUEST_SESSION_KEY } from "@/src/lib/appConstants";
import { getAllowedTopicsForPlan, getResolvedFeatures, subscriptionPlans } from "@/src/lib/subscriptionPlans";
import { fetchContent, fetchPayPalEmail } from "@/src/lib/supabaseData";
import type { ContentItem } from "@/src/types/platform";

export default function UserDashboard() {
    const { user, profile, loading, logout } = useAuth();
    const [content, setContent] = useState<ContentItem[]>([]);
    const [paypalEmail, setPaypalEmail] = useState("");
    const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
    const [guestMode, setGuestMode] = useState(
        () => typeof window !== "undefined" && sessionStorage.getItem(GUEST_SESSION_KEY) === "true",
    );

    useEffect(() => {
        let isActive = true;

        const loadDashboardData = async () => {
            try {
                const [nextContent, nextPayPalEmail] = await Promise.all([fetchContent(), fetchPayPalEmail()]);

                if (!isActive) {
                    return;
                }

                setContent(nextContent);
                setPaypalEmail(nextPayPalEmail);
            } catch (error) {
                console.error("Error loading Supabase dashboard data:", error);
            }
        };

        void loadDashboardData();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTimeMs(Date.now());
        }, 60000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4 text-slate-200">
                Loading your dashboard...
            </main>
        );
    }

    const accessExpiryMs = profile?.accessExpiresAt ? Date.parse(profile.accessExpiresAt) : Number.NaN;
    const hasAccessExpiry = Number.isFinite(accessExpiryMs);
    const isAccessExpired = hasAccessExpiry ? accessExpiryMs <= currentTimeMs : false;
    const assignedPlan = user ? profile?.planType ?? "guest" : "guest";
    const isAccessLocked = Boolean(user && (profile?.accessLocked || isAccessExpired));
    const currentPlan = isAccessLocked ? "guest" : assignedPlan;
    const resolvedFeatures = getResolvedFeatures(currentPlan, {
        backgroundPlayEnabled: profile?.backgroundPlayEnabled,
        screenOffPlaybackEnabled: profile?.screenOffPlaybackEnabled,
        allTopicsUnlocked: profile?.allTopicsUnlocked,
    });
    const allowedTopics = getAllowedTopicsForPlan(currentPlan);
    const displayEmail = user ? profile?.email || user.email || "Signed in user" : "Guest Listener";
    const accessExpiryLabel = hasAccessExpiry ? new Date(accessExpiryMs).toLocaleString() : "";
    const accessDaysLeft = hasAccessExpiry ? Math.max(0, Math.ceil((accessExpiryMs - currentTimeMs) / 86400000)) : null;
    const handleExitGuestMode = () => {
        sessionStorage.removeItem(GUEST_SESSION_KEY);
        setGuestMode(false);
    };

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="glass-panel overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-4 flex items-center gap-3 text-emerald-300">
                            <FaHeadphones />
                            <span className="text-sm uppercase tracking-[0.3em]">User Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back, {displayEmail}</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                            {user
                                ? "Your plan and features update automatically."
                                : "You are in guest mode. Login for full access."}
                        </p>
                        {user ? (
                            <p className="mt-2 max-w-2xl text-xs text-slate-400">
                                {isAccessLocked
                                    ? hasAccessExpiry
                                        ? `Access expired on ${accessExpiryLabel}.`
                                        : `Access is locked.`
                                    : hasAccessExpiry
                                      ? `Valid till ${accessExpiryLabel} (${accessDaysLeft} day(s) left).`
                                      : `Access is active.`}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                        <span
                            className={`status-pill ${
                                isAccessLocked
                                    ? "border-red-500/40 bg-red-500/10 text-red-100"
                                    : currentPlan !== "guest"
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                                    : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                            }`}
                        >
                            {isAccessLocked
                                ? "Access Locked"
                                : currentPlan !== "guest"
                                ? `${subscriptionPlans[currentPlan].name} Active`
                                : "Guest Plan"}
                        </span>
                        <Link className="secondary-button w-full sm:w-auto" href="/admin">
                            <FaShieldAlt />
                            <span className="ml-2">Admin Panel</span>
                        </Link>
                        {user ? (
                            <button className="secondary-button w-full sm:w-auto" onClick={logout} type="button">
                                Logout
                            </button>
                        ) : guestMode ? (
                            <button className="secondary-button w-full sm:w-auto" onClick={handleExitGuestMode} type="button">
                                Exit Guest Mode
                            </button>
                        ) : (
                            <Link className="secondary-button w-full sm:w-auto" href="/auth">
                                Login / Sign Up
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <div className="mt-8 space-y-6">
                <PaymentInfo currentPlan={currentPlan} paypalEmail={paypalEmail} />

                <SubscriptionPlansOverview currentPlan={currentPlan} enabledFeatures={resolvedFeatures} />

                <section className="glass-panel p-6 sm:p-8">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Audio Library</p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Available content</h2>
                        </div>
                        <span className="text-sm text-slate-400">{content.length} item(s)</span>
                    </div>

                    <ContentList
                        allTopicsUnlocked={resolvedFeatures.allTopicsUnlocked}
                        allowedTopics={allowedTopics}
                        backgroundPlayEnabled={resolvedFeatures.backgroundPlayEnabled}
                        currentPlan={currentPlan}
                        emptyMessage="No content has been published yet. Ask the admin to add audio."
                        items={content}
                        screenOffPlaybackEnabled={resolvedFeatures.screenOffPlaybackEnabled}
                    />
                </section>
            </div>
        </main>
    );
}
