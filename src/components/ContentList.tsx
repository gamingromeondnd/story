"use client";

import Image from "next/image";
import { FaLock } from "react-icons/fa";
import { getRequiredPlanForTopic, subscriptionPlans, type PlanType } from "@/src/lib/subscriptionPlans";
import type { ContentItem } from "@/src/types/platform";

interface ContentListProps {
    items: ContentItem[];
    currentPlan: PlanType;
    backgroundPlayEnabled: boolean;
    screenOffPlaybackEnabled: boolean;
    allTopicsUnlocked: boolean;
    allowedTopics: string[];
    emptyMessage?: string;
}

export default function ContentList({
    items,
    currentPlan,
    backgroundPlayEnabled,
    screenOffPlaybackEnabled,
    allTopicsUnlocked,
    allowedTopics,
    emptyMessage = "No content available yet.",
}: ContentListProps) {
    if (items.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center text-sm text-slate-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
                const topicUnlocked =
                    allTopicsUnlocked || allowedTopics.some((topic) => topic.toLowerCase() === item.topicName.toLowerCase());
                const requiredPlan = getRequiredPlanForTopic(item.topicName);

                return (
                    <article
                        key={item.id}
                        className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-lg shadow-black/10"
                    >
                        <div className="relative aspect-[16/10] overflow-hidden">
                            <Image
                                alt={item.title}
                                className="h-full w-full object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                src={item.imageUrl}
                                unoptimized
                            />
                            {!topicUnlocked ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                                    <span className="status-pill border-red-500/40 bg-red-500/10 text-red-100">
                                        <FaLock className="mr-2" />
                                        Locked
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-4 p-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                                    {item.topicName || "Untitled Topic"}
                                </p>
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {topicUnlocked
                                        ? `${subscriptionPlans[currentPlan].name} plan active for this audio.`
                                        : `${subscriptionPlans[requiredPlan].name} or higher required.`}
                                </p>
                            </div>

                            {topicUnlocked ? (
                                <div className="space-y-3">
                                    <audio controls preload="none" src={item.audioUrl}>
                                        Your browser does not support the audio element.
                                    </audio>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                            Plan: {subscriptionPlans[currentPlan].name}
                                        </span>
                                        {backgroundPlayEnabled ? (
                                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                                                Background Audio
                                            </span>
                                        ) : null}
                                        {screenOffPlaybackEnabled ? (
                                            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-100">
                                                Screen-Off Style Playback
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="secondary-button w-full cursor-not-allowed border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/10"
                                    disabled
                                    type="button"
                                >
                                    Locked for {subscriptionPlans[requiredPlan].name}
                                </button>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
