"use client";

import { ACCESS_UNLOCK_DAYS } from "@/src/lib/appConstants";
import { type FeatureKey } from "@/src/lib/subscriptionPlans";
import type { PlatformUser } from "@/src/types/platform";

interface UserListProps {
    users: PlatformUser[];
    onAccessToggle: (userId: string, currentValue: boolean) => Promise<void>;
    onFeatureToggle: (userId: string, featureKey: FeatureKey, currentValue: boolean) => Promise<void>;
}

const featureLabels: Record<FeatureKey, string> = {
    backgroundPlayEnabled: "Background Audio",
    screenOffPlaybackEnabled: "Screen-Off Audio",
    allTopicsUnlocked: "All Topics Unlock",
};

function getAccessExpiryMeta(accessExpiresAt: string | null) {
    const expiresAtMs = accessExpiresAt ? Date.parse(accessExpiresAt) : Number.NaN;

    if (!Number.isFinite(expiresAtMs)) {
        return {
            hasExpiry: false,
            expired: false,
            label: "",
            daysLeft: null as number | null,
        };
    }

    const now = Date.now();

    return {
        hasExpiry: true,
        expired: expiresAtMs <= now,
        label: new Date(expiresAtMs).toLocaleString(),
        daysLeft: Math.max(0, Math.ceil((expiresAtMs - now) / 86400000)),
    };
}

export default function UserList({ users, onAccessToggle, onFeatureToggle }: UserListProps) {
    return (
        <section className="glass-panel p-6 sm:p-8">
            <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300">User List</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Email lock and unlock control</h2>
                <p className="mt-2 text-sm text-slate-400">Lock or unlock users from this email list.</p>
            </div>

            <div className="space-y-4">
                {users.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center text-sm text-slate-400">
                        No users have signed up yet.
                    </div>
                ) : (
                    users.map((user) => {
                        const accessExpiry = getAccessExpiryMeta(user.accessExpiresAt);

                        return (
                            <div key={user.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="break-all text-base font-semibold text-white">{user.email}</p>
                                            <p className="mt-2 text-xs text-slate-400">
                                                {user.accessLocked
                                                    ? accessExpiry.hasExpiry
                                                        ? `Last unlock expired on ${accessExpiry.label}.`
                                                        : `Unlock starts ${ACCESS_UNLOCK_DAYS} days access.`
                                                    : accessExpiry.hasExpiry
                                                      ? `Unlocked till ${accessExpiry.label} (${accessExpiry.daysLeft} day(s) left).`
                                                      : "Unlocked."}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                                    user.accessLocked
                                                        ? "border-red-500/40 bg-red-500/10 text-red-100"
                                                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                                                }`}
                                            >
                                                {user.accessLocked ? "Locked" : "Unlocked"}
                                            </span>
                                            <button
                                                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                                    user.accessLocked
                                                        ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                                        : "bg-red-500/10 text-red-100 hover:bg-red-500/20"
                                                }`}
                                                onClick={() => void onAccessToggle(user.id, user.accessLocked)}
                                                type="button"
                                            >
                                                {user.accessLocked ? `Unlock ${ACCESS_UNLOCK_DAYS} Days` : "Lock Access"}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400">
                                        {user.accessLocked
                                            ? `User is locked. Unlock to activate audio access for ${ACCESS_UNLOCK_DAYS} days.`
                                            : accessExpiry.expired
                                              ? "Access expired. Unlock to start a new cycle."
                                              : "User is unlocked. Audio access is active."}
                                    </p>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {(Object.keys(featureLabels) as FeatureKey[]).map((featureKey) => (
                                            <button
                                                key={featureKey}
                                                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                                    user[featureKey]
                                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                                                        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                                }`}
                                                disabled={user.accessLocked}
                                                onClick={() => void onFeatureToggle(user.id, featureKey, user[featureKey])}
                                                type="button"
                                            >
                                                {featureLabels[featureKey]}: {user[featureKey] ? "On" : "Off"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
