"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchContent } from "@/src/lib/supabaseData";
import type { ContentItem } from "@/src/types/platform";

interface HomeContentGridProps {
    searchTerm: string;
}

export default function HomeContentGrid({ searchTerm }: HomeContentGridProps) {
    const [content, setContent] = useState<ContentItem[]>([]);

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

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredContent = useMemo(() => {
        if (!normalizedSearchTerm) {
            return content;
        }

        return content.filter((item) => item.topicName.toLowerCase().includes(normalizedSearchTerm));
    }, [content, normalizedSearchTerm]);

    return (
        <>
            {content.length === 0 ? (
                <section className="glass-panel px-6 py-16 text-center text-sm text-slate-400">
                    Content will appear here after admin upload.
                </section>
            ) : filteredContent.length === 0 ? (
                <section className="glass-panel px-6 py-16 text-center text-sm text-slate-400">
                    No content found for this topic.
                </section>
            ) : (
                <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredContent.map((item) => (
                        <Link
                            key={item.id}
                            className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 text-left shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-emerald-400/40"
                            href="/settings"
                        >
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <Image
                                    alt={item.title}
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    src={item.imageUrl}
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                                            {item.topicName || "Untitled Topic"}
                                        </p>
                                        <h2 className="mt-2 text-xl font-semibold text-white">{item.title}</h2>
                                    </div>
                                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                                        Unlock to Play
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>
            )}
        </>
    );
}
