"use client";

import { useMemo, useState } from "react";
import { subscriptionPlans, type FeatureKey, type PlanType } from "@/src/lib/subscriptionPlans";
import { topicEntries } from "@/src/lib/topicCategories";

interface SubscriptionPlansOverviewProps {
    currentPlan: PlanType;
    enabledFeatures: Record<FeatureKey, boolean>;
}

const featureLabels: Record<FeatureKey, string> = {
    backgroundPlayEnabled: "Background Audio",
    screenOffPlaybackEnabled: "Screen-Off Audio",
    allTopicsUnlocked: "All Topics Unlock",
};

export default function SubscriptionPlansOverview({
    currentPlan,
    enabledFeatures,
}: SubscriptionPlansOverviewProps) {
    const planOrder: PlanType[] = ["basic", "premium", "pro", "elite"];
    const [selectedPlan, setSelectedPlan] = useState<PlanType>("basic");

    const selectedPlanDefinition = subscriptionPlans[selectedPlan];
    const selectedPlanTopics = useMemo(() => {
        if (selectedPlan === "elite") {
            return topicEntries.map((entry) => `${entry.number}. ${entry.topic}`);
        }

        return selectedPlanDefinition.unlockedTopics;
    }, [selectedPlan, selectedPlanDefinition.unlockedTopics]);
    const selectedPlanSections =
        selectedPlan === "elite"
            ? [
                  {
                      title: "Elite / Ultimate",
                      topics: topicEntries.map((entry) => `${entry.number}. ${entry.topic}`),
                  },
              ]
            : selectedPlanDefinition.sections;

    return (
        <section className="glass-panel p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Subscription Plans</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Plan Overview</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Tap a plan to view unlocked topics.</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                    {Object.entries(enabledFeatures)
                        .filter(([, enabled]) => enabled)
                        .map(([featureKey]) => (
                            <span
                                key={featureKey}
                                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-100"
                            >
                                {featureLabels[featureKey as FeatureKey]}
                            </span>
                        ))}
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-4">
                {planOrder.map((planType) => {
                    const plan = subscriptionPlans[planType];
                    const isCurrentPlan = currentPlan === planType;
                    const isSelectedPlan = selectedPlan === planType;

                    return (
                        <button
                            key={planType}
                            className={`rounded-3xl border p-5 text-left transition ${
                                isSelectedPlan
                                    ? "border-sky-400/50 bg-sky-500/10"
                                    : isCurrentPlan
                                      ? "border-emerald-500/40 bg-emerald-500/10"
                                      : "border-white/10 bg-slate-950/60 hover:border-white/20"
                            }`}
                            onClick={() => setSelectedPlan(planType)}
                            type="button"
                        >
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{plan.badge}</p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">{plan.name}</h3>
                            <p className="mt-2 text-lg font-medium text-emerald-300">{plan.price}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-400">{plan.summary}</p>
                            <p className="mt-4 text-sm text-slate-300">
                                Topic unlocks: {planType === "elite" ? "All topics" : plan.unlockedTopics.length}
                            </p>
                            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-sky-200">
                                {isSelectedPlan ? "List below" : "Tap to view"}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Selected Plan</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">
                            {selectedPlanDefinition.name} {selectedPlanDefinition.price}
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">{selectedPlanDefinition.summary}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                        {selectedPlanTopics.length} item(s)
                    </span>
                </div>

                <div className="mt-5 space-y-5">
                    {selectedPlanSections.map((section) => (
                        <div key={`${selectedPlan}-${section.title}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                                {section.title}
                            </h4>
                            {section.topics.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-400">
                                    Full topic unlock is included with this plan.
                                </p>
                            ) : (
                                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                    {section.topics.map((topic) => (
                                        <div
                                            key={`${selectedPlan}-${section.title}-${topic}`}
                                            className="rounded-2xl border border-white/8 bg-slate-900/70 px-3 py-3 text-sm text-slate-200"
                                        >
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
