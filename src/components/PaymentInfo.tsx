"use client";

import { FaCheckCircle, FaLock, FaPaypal } from "react-icons/fa";
import { subscriptionPlans, type PlanType } from "@/src/lib/subscriptionPlans";

interface PaymentInfoProps {
    paypalEmail: string;
    currentPlan: PlanType;
}

export default function PaymentInfo({ paypalEmail, currentPlan }: PaymentInfoProps) {
    const isUnlocked = currentPlan !== "guest";

    return (
        <section className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Payment Info</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">PayPal Manual Payment</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Pay to the email below and wait for admin approval.</p>
                </div>

                <span
                    className={`status-pill ${
                        isUnlocked
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                    }`}
                >
                    {isUnlocked ? <FaCheckCircle className="mr-2" /> : <FaLock className="mr-2" />}
                    {isUnlocked ? "Unlocked" : "Locked"}
                </span>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3 text-slate-200">
                    <FaPaypal className="text-sky-300" size={20} />
                    <div>
                        <p className="text-sm text-slate-400">PayPal email</p>
                        <p className="mt-1 break-all text-lg font-semibold text-white">
                            {paypalEmail || "Admin has not added a PayPal email yet."}
                        </p>
                        <p className="mt-1 text-sm font-medium text-sky-200">Pay with PayPal</p>
                        <p className="mt-2 text-sm text-slate-400">
                            Current plan: {subscriptionPlans[currentPlan].name} ({subscriptionPlans[currentPlan].price})
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-semibold text-white">1. Pay</p>
                        <p className="mt-2 text-slate-400">Send USD manually to the PayPal email.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-semibold text-white">2. Review</p>
                        <p className="mt-2 text-slate-400">Admin checks payment and matches your email.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-semibold text-white">3. Unlock</p>
                        <p className="mt-2 text-slate-400">Your plan updates automatically after assignment.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
