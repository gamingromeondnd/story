"use client";

import Image from "next/image";
import { FaLock, FaLockOpen } from "react-icons/fa";
import type { ContentItem } from "@/src/types/platform";

interface ContentListProps {
    items: ContentItem[];
    canAccessContent: boolean;
    emptyMessage?: string;
}

export default function ContentList({
    items,
    canAccessContent,
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
                            <div
                                className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg shadow-black/30 backdrop-blur-sm ${
                                    canAccessContent
                                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                                        : "border-red-500/40 bg-slate-950/75 text-red-100"
                                }`}
                            >
                                {canAccessContent ? <FaLockOpen size={14} /> : <FaLock size={14} />}
                            </div>
                            {!canAccessContent ? (
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
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                            </div>

                            {canAccessContent ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-emerald-200">Unlocked. Audio is ready to play.</p>
                                    <audio controls preload="none" src={item.audioUrl}>
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            ) : (
                                <button
                                    className="secondary-button w-full cursor-not-allowed border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/10"
                                    disabled
                                    type="button"
                                >
                                    Locked
                                </button>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
