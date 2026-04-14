"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GUEST_SESSION_KEY } from "@/src/lib/appConstants";
import { ensureUserProfile } from "@/src/lib/supabaseData";

type AuthMode = "login" | "signup";

interface LoginProps {
    standalone?: boolean;
}

function getAuthErrorMessage(code: string) {
    switch (code) {
        case "user_already_exists":
        case "email_exists":
            return "This email is already registered.";
        case "invalid_email":
        case "email_address_invalid":
            return "Please enter a valid email address.";
        case "weak_password":
            return "Password should be at least 6 characters long.";
        case "invalid_credentials":
        case "Invalid login credentials":
            return "Incorrect email or password.";
        case "email_not_confirmed":
        case "email_not_confirmed_or_verified":
            return "Please verify your email first, then login.";
        case "oauth_provider_not_enabled":
            return "Google sign-in is not enabled yet. Ask admin to enable Google in Supabase Auth Providers.";
        case "over_request_rate_limit":
        case "over_email_send_rate_limit":
        case "email_rate_limit_exceeded":
            return "Too many attempts right now. Try again in a few minutes.";
        default:
            return "Something went wrong. Please try again.";
    }
}

export default function Login({ standalone = false }: LoginProps) {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const resolveAuthErrorCode = (authError: unknown) => {
        if (!(authError instanceof Error)) {
            return "";
        }

        const code = "code" in authError ? String(authError.code) : "";
        const message = authError.message.toLowerCase();

        if (message.includes("unsupported provider")) {
            return "oauth_provider_not_enabled";
        }

        return code || authError.message;
    };

    const ensureGoogleProviderEnabled = async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return;
        }

        const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
            headers: {
                apikey: supabaseKey,
            },
        });

        if (!response.ok) {
            return;
        }

        const settings = (await response.json()) as { external?: { google?: boolean } };

        if (settings.external?.google === false) {
            throw new Error("unsupported provider");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setInfoMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            setLoading(false);
            return;
        }

        if (mode === "signup" && password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            sessionStorage.removeItem(GUEST_SESSION_KEY);

            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email: normalizedEmail,
                    password,
                    options: {
                        emailRedirectTo:
                            typeof window !== "undefined" ? `${window.location.origin}/settings` : undefined,
                    },
                });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    try {
                        await ensureUserProfile(data.user);
                    } catch (profileError) {
                        console.error("Error ensuring Supabase profile after sign-up:", profileError);
                    }
                }

                if (!data.session) {
                    setInfoMessage("Account created. Please check your email and verify your account, then login.");
                    setMode("login");
                    setPassword("");
                    setConfirmPassword("");
                    return;
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password,
                });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    try {
                        await ensureUserProfile(data.user);
                    } catch (profileError) {
                        console.error("Error ensuring Supabase profile after login:", profileError);
                    }
                }
            }

            router.push("/settings");
        } catch (authError) {
            setError(getAuthErrorMessage(resolveAuthErrorCode(authError)));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError("");
        setInfoMessage("");

        try {
            sessionStorage.removeItem(GUEST_SESSION_KEY);
            await ensureGoogleProviderEnabled();

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/settings` : undefined,
                    skipBrowserRedirect: true,
                },
            });

            if (error) {
                throw error;
            }

            if (!data?.url) {
                throw new Error("oauth_url_missing");
            }

            window.location.assign(data.url);
        } catch (authError) {
            setError(getAuthErrorMessage(resolveAuthErrorCode(authError)));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Enter your email first to reset your password.");
            setInfoMessage("");
            return;
        }

        setLoading(true);
        setError("");
        setInfoMessage("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
                redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
            });

            if (error) {
                throw error;
            }

            setInfoMessage("A password reset email has been sent.");
        } catch (authError) {
            setError(getAuthErrorMessage(resolveAuthErrorCode(authError)));
        } finally {
            setLoading(false);
        }
    };

    const handleContinueAsGuest = () => {
        sessionStorage.setItem(GUEST_SESSION_KEY, "true");
        router.push("/settings");
    };

    return (
        <section className={`glass-panel w-full ${standalone ? "max-w-md" : "max-w-lg"} p-6 sm:p-8`}>
            <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Supabase Auth</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">Login or Sign Up</h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">Use email/password or Google to continue.</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        mode === "login" ? "bg-emerald-500 text-slate-950" : "text-slate-300"
                    }`}
                    onClick={() => {
                        setMode("login");
                        setError("");
                    }}
                    type="button"
                >
                    Login
                </button>
                <button
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        mode === "signup" ? "bg-emerald-500 text-slate-950" : "text-slate-300"
                    }`}
                    onClick={() => {
                        setMode("signup");
                        setError("");
                    }}
                    type="button"
                >
                    Sign Up
                </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="user-email">
                        Email
                    </label>
                    <input
                        id="user-email"
                        className="field"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="user-password">
                        Password
                    </label>
                    <input
                        id="user-password"
                        className="field"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter password"
                        required
                    />
                </div>

                {mode === "signup" ? (
                    <div>
                        <label className="mb-2 block text-sm text-slate-300" htmlFor="confirm-password">
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            className="field"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Repeat password"
                            required
                        />
                    </div>
                ) : null}

                {error ? (
                    <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                ) : null}

                <button className="primary-button w-full" disabled={loading} type="submit">
                    {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
                </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                <span>Plans are assigned by admin after payment.</span>
                <Link className="text-emerald-300 transition hover:text-emerald-200" href="/admin">
                    Admin Panel
                </Link>
            </div>

            <div className="mt-4 space-y-3">
                <button className="secondary-button w-full" onClick={handleGoogleAuth} type="button">
                    Continue with Google
                </button>
                <button
                    className="w-full text-sm font-medium text-slate-300 transition hover:text-emerald-300"
                    onClick={handleForgotPassword}
                    type="button"
                >
                    Forgot Password?
                </button>
            </div>

            {infoMessage ? (
                <p className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                    {infoMessage}
                </p>
            ) : null}

            <div className="mt-4 border-t border-white/10 pt-4">
                <button className="secondary-button w-full" onClick={handleContinueAsGuest} type="button">
                    Continue as Guest
                </button>
            </div>
        </section>
    );
}
