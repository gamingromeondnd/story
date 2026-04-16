"use client";

import { useEffect, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";

interface AdminLoginProps {
    onSuccess: () => void;
    initialError?: string;
}

export default function AdminLogin({ onSuccess, initialError = "" }: AdminLoginProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError(initialError);
    }, [initialError]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as { error?: string } | null;
                setError(data?.error ?? "Incorrect admin password.");
                return;
            }

            setPassword("");
            onSuccess();
        } catch (requestError) {
            console.error("Error validating admin session:", requestError);
            setError("Could not verify admin access. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="glass-panel w-full max-w-md p-6 sm:p-8">
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                    <FaShieldAlt size={22} />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Admin Access</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">Admin Login</h1>
                <p className="mt-3 text-sm text-slate-400">Enter password to manage users and content.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="admin-password">
                        Admin password
                    </label>
                    <input
                        id="admin-password"
                        className="field"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter admin password"
                        required
                    />
                </div>

                {error ? (
                    <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                ) : null}

                <button className="primary-button w-full" disabled={loading} type="submit">
                    {loading ? "Checking..." : "Unlock Admin Panel"}
                </button>
            </form>
        </section>
    );
}
