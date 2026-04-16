"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { useAuth } from "@/src/contexts/AuthContext";
import { fetchContent } from "@/src/lib/supabaseData";
import type { ContentItem } from "@/src/types/platform";

export default function HomeContentGrid() {
    const { user, profile, loading } = useAuth();
    const [content, setContent] = useState<ContentItem[]>([]);
    const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

    useEffect(() => {
        let isActive = true;

        const loadContent = async () => {
            try {
                const nextContent = await fetchContent();

                if (isActive) {
                    setContent(nextContent);
                }
            } catch (error) {
                console.error("Error loading Supabase content:", error);
            }
        };

        void loadContent();
        const refreshId = setInterval(() => {
            void loadContent();
        }, 10000);

        return () => {
            isActive = false;
            clearInterval(refreshId);
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
    const accessExpiryMs = profile?.accessExpiresAt ? Date.parse(profile.accessExpiresAt) : Number.NaN;
    const isAccessExpired = Number.isFinite(accessExpiryMs) ? accessExpiryMs <= currentTimeMs : false;
    const isContentLocked = !loading && (!user || Boolean(profile?.accessLocked || isAccessExpired));

    return (
        <>
            {content.length === 0 ? (
                <section className="glass-panel px-6 py-16 text-center text-sm text-slate-400">
                    Content will appear here after admin upload.
                </section>
            ) : (
                <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {content.map((item) => {
                        const canOpenAudio = !isContentLocked && !loading && Boolean(item.audioUrl);
                        const cardClassName = `group overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 text-left shadow-xl shadow-black/10 transition ${
                            canOpenAudio
                                ? "cursor-pointer hover:-translate-y-1 hover:border-emerald-400/40"
                                : "cursor-not-allowed"
                        }`;
                        const cardContent = (
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <Image
                                    alt={item.title}
                                    className={`object-cover transition duration-300 ${
                                        canOpenAudio ? "group-hover:scale-105" : ""
                                    }`}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    src={item.imageUrl}
                                    unoptimized
                                />
                                {!loading ? (
                                    <div
                                        className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg shadow-black/30 backdrop-blur-sm ${
                                            isContentLocked
                                                ? "border-red-500/40 bg-slate-950/75 text-red-100"
                                                : "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                                        }`}
                                    >
                                        {isContentLocked ? <FaLock size={14} /> : <FaLockOpen size={14} />}
                                    </div>
                                ) : null}
                                {isContentLocked ? (
                                    <div className="absolute inset-0 bg-slate-950/45" />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                                        {isContentLocked ? "Locked" : "Unlocked"}
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                                    {isContentLocked ? (
                                        <p className="mt-2 text-sm text-slate-200/80">
                                            Unlock access to open this audio.
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        );

                        if (!canOpenAudio) {
                            return (
                                <article
                                    key={item.id}
                                    className={cardClassName}
                                >
                                    {cardContent}
                                </article>
                            );
                        }

                        return (
                            <a
                                key={item.id}
                                className={cardClassName}
                                href={item.audioUrl}
                                rel="noreferrer"
                                target="_blank"
                            >
                                {cardContent}
                            </a>
                        );
                    })}
                </section>
            )}
        </>
    );
}
