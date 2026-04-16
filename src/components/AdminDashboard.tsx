"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaLock, FaShieldAlt, FaTrash } from "react-icons/fa";
import AddContent from "@/src/components/AddContent";
import AdminLogin from "@/src/components/AdminLogin";
import UserList from "@/src/components/UserList";
import { ACCESS_UNLOCK_DAYS } from "@/src/lib/appConstants";
import { type FeatureKey } from "@/src/lib/subscriptionPlans";
import type { ContentItem, PlatformUser } from "@/src/types/platform";

interface AdminDashboardProps {
    initialHasAccess?: boolean;
}

interface AdminBootstrapResponse {
    users: PlatformUser[];
    content: ContentItem[];
    paypalEmail: string;
}

async function getResponseErrorMessage(response: Response, fallbackMessage: string) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return payload?.error ?? fallbackMessage;
}

export default function AdminDashboard({ initialHasAccess = false }: AdminDashboardProps) {
    const [hasAccess, setHasAccess] = useState(initialHasAccess);
    const [accessChecked, setAccessChecked] = useState(initialHasAccess);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [adminAccessError, setAdminAccessError] = useState("");
    const [adminDataError, setAdminDataError] = useState("");
    const [paypalEmail, setPaypalEmail] = useState("");
    const [paypalDraft, setPaypalDraft] = useState("");
    const [settingsMessage, setSettingsMessage] = useState("");
    const [savingSettings, setSavingSettings] = useState(false);

    const loadAdminData = useCallback(async () => {
        try {
            setAdminDataError("");

            const response = await fetch("/api/admin/bootstrap", {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                const message = await getResponseErrorMessage(response, "Could not load admin data.");

                if (response.status === 401) {
                    setAdminAccessError(message);
                    setHasAccess(false);
                    return;
                }

                setAdminDataError(message);
                return;
            }

            const data = (await response.json()) as AdminBootstrapResponse;
            setUsers(data.users);
            setContent(data.content);
            setPaypalEmail(data.paypalEmail);
            setPaypalDraft(data.paypalEmail);
        } catch (error) {
            console.error("Error loading admin data:", error);
            setAdminDataError("Could not load admin data.");
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const checkAdminSession = async () => {
            try {
                const response = await fetch("/api/admin/session", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!response.ok) {
                    if (isActive) {
                        setHasAccess(false);
                        setAdminAccessError(await getResponseErrorMessage(response, "Could not verify admin access."));
                    }
                    return;
                }

                const data = (await response.json()) as {
                    authenticated?: boolean;
                    configured?: boolean;
                    error?: string | null;
                };

                if (isActive) {
                    setHasAccess(Boolean(data.authenticated));
                    setAdminAccessError(data.authenticated ? "" : data.error ?? "");
                }
            } catch (error) {
                console.error("Error checking admin session:", error);

                if (isActive) {
                    setHasAccess(false);
                    setAdminAccessError("Could not verify admin access.");
                }
            } finally {
                if (isActive) {
                    setAccessChecked(true);
                }
            }
        };

        void checkAdminSession();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!hasAccess) {
            return;
        }

        void loadAdminData();
    }, [hasAccess, loadAdminData]);

    const stats = useMemo(
        () => ({
            totalUsers: users.length,
            unlockedUsers: users.filter((user) => !user.accessLocked).length,
            totalContent: content.length,
        }),
        [content.length, users],
    );

    const handleAddContent = async (values: {
        title: string;
        imageUrl: string;
        audioUrl: string;
    }) => {
        const response = await fetch("/api/admin/content", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            throw new Error(await getResponseErrorMessage(response, "Could not save content."));
        }

        await loadAdminData();
    };

    const handleSavePayPalEmail = async () => {
        setSavingSettings(true);
        setSettingsMessage("");

        try {
            const response = await fetch("/api/admin/settings/paypal", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: paypalDraft }),
            });

            if (!response.ok) {
                throw new Error(await getResponseErrorMessage(response, "Could not update PayPal email."));
            }

            setPaypalEmail(paypalDraft.trim());
            setSettingsMessage("PayPal email updated.");
        } catch (error) {
            console.error("Error updating PayPal email:", error);
            setSettingsMessage(error instanceof Error ? error.message : "Could not update PayPal email.");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleDeletePayPalEmail = async () => {
        const shouldDelete = window.confirm("Delete the saved PayPal email?");

        if (!shouldDelete) {
            return;
        }

        setSavingSettings(true);
        setSettingsMessage("");

        try {
            const response = await fetch("/api/admin/settings/paypal", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(await getResponseErrorMessage(response, "Could not delete PayPal email."));
            }

            setPaypalEmail("");
            setPaypalDraft("");
            setSettingsMessage("PayPal email deleted.");
        } catch (error) {
            console.error("Error deleting PayPal email:", error);
            setSettingsMessage(error instanceof Error ? error.message : "Could not delete PayPal email.");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleAccessToggle = async (userId: string, currentValue: boolean) => {
        setAdminDataError("");
        const response = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "access",
                userId,
                accessLocked: !currentValue,
            }),
        });

        if (!response.ok) {
            setAdminDataError(await getResponseErrorMessage(response, "Could not update access state."));
            return;
        }

        await loadAdminData();
    };

    const handleFeatureToggle = async (userId: string, featureKey: FeatureKey, currentValue: boolean) => {
        setAdminDataError("");
        const response = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "feature",
                userId,
                featureKey,
                enabled: !currentValue,
            }),
        });

        if (!response.ok) {
            setAdminDataError(await getResponseErrorMessage(response, "Could not update feature access."));
            return;
        }

        await loadAdminData();
    };

    const handleDeleteContent = async (contentId: string) => {
        const shouldDelete = window.confirm("Delete this saved content item?");

        if (!shouldDelete) {
            return;
        }

        setAdminDataError("");
        const response = await fetch(`/api/admin/content?id=${encodeURIComponent(contentId)}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            setAdminDataError(await getResponseErrorMessage(response, "Could not delete content."));
            return;
        }

        await loadAdminData();
    };

    const handleAdminLogout = async () => {
        try {
            await fetch("/api/admin/session", {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Error clearing admin session:", error);
        } finally {
            setHasAccess(false);
        }
    };

    if (!accessChecked) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4 text-slate-200">
                Checking admin access...
            </main>
        );
    }

    if (!hasAccess) {
        return (
            <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
                <AdminLogin
                    initialError={adminAccessError}
                    onSuccess={() => {
                        setAdminAccessError("");
                        setHasAccess(true);
                    }}
                />
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="glass-panel mb-8 overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-4 flex items-center gap-3 text-emerald-300">
                            <FaShieldAlt />
                            <span className="text-sm uppercase tracking-[0.3em]">Admin Panel</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Admin Control Room</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                            Manage content, payment email, and user unlocks. Each unlock gives {ACCESS_UNLOCK_DAYS} days access.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                        <Link className="secondary-button w-full sm:w-auto" href="/settings">
                            <FaArrowLeft />
                            <span className="ml-2">Back to Settings</span>
                        </Link>
                        <button className="secondary-button w-full sm:w-auto" onClick={handleAdminLogout} type="button">
                            <FaLock />
                            <span className="ml-2">Lock Admin</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm text-slate-400">Registered users</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{stats.totalUsers}</p>
                    </div>
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <p className="text-sm text-emerald-200">Unlocked users</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{stats.unlockedUsers}</p>
                    </div>
                    <div className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-5">
                        <p className="text-sm text-sky-200">Published content</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{stats.totalContent}</p>
                    </div>
                </div>

                {adminDataError ? (
                    <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {adminDataError}
                    </div>
                ) : null}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-8">
                    <AddContent onAddContent={handleAddContent} />

                    <section className="glass-panel p-6 sm:p-8">
                        <div className="mb-6">
                            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Payment</p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">PayPal Email</h2>
                            <p className="mt-2 text-sm text-slate-400">Users pay to this email for manual approval.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-slate-300" htmlFor="paypal-email">
                                    PayPal Email
                                </label>
                                <input
                                    id="paypal-email"
                                    className="field"
                                    type="email"
                                    value={paypalDraft}
                                    onChange={(event) => setPaypalDraft(event.target.value)}
                                    placeholder="payments@example.com"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    className="primary-button"
                                    disabled={savingSettings}
                                    onClick={handleSavePayPalEmail}
                                    type="button"
                                >
                                    {savingSettings ? "Saving..." : "Save PayPal Email"}
                                </button>
                                <button
                                    className="secondary-button border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                                    disabled={savingSettings || !paypalEmail}
                                    onClick={handleDeletePayPalEmail}
                                    type="button"
                                >
                                    Delete PayPal Email
                                </button>
                                <span className="text-sm text-slate-400">
                                    Current public email: {paypalEmail || "Not set yet"}
                                </span>
                            </div>

                            {settingsMessage ? (
                                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                    {settingsMessage}
                                </p>
                            ) : null}
                        </div>
                    </section>
                </div>

                <UserList
                    onAccessToggle={handleAccessToggle}
                    onFeatureToggle={handleFeatureToggle}
                    users={users}
                />
            </div>

            <section className="glass-panel mt-8 p-6 sm:p-8">
                <div className="mb-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Saved Content</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Manage Saved Audio</h2>
                </div>

                {content.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center text-sm text-slate-400">
                        No audio content has been added yet.
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {content.map((item) => (
                            <article
                                key={item.id}
                                className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-lg shadow-black/10"
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <Image
                                        alt={item.title}
                                        className="object-cover"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        src={item.imageUrl}
                                        unoptimized
                                    />
                                </div>
                                <div className="space-y-4 p-5">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                        <p className="mt-2 text-sm text-slate-400">Preview and delete this item.</p>
                                    </div>

                                    <audio controls preload="none" src={item.audioUrl}>
                                        Your browser does not support the audio element.
                                    </audio>

                                    <button
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                                        onClick={() => void handleDeleteContent(item.id)}
                                        type="button"
                                    >
                                        <FaTrash className="mr-2" />
                                        Delete Content
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
