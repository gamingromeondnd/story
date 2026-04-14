"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { topicEntries } from "@/src/lib/topicCategories";

interface HomeTopicCategoryPickerProps {
    query: string;
    onQueryChange: (value: string) => void;
    onTopicSelect: (value: string) => void;
}

export default function HomeTopicCategoryPicker({
    query,
    onQueryChange,
    onTopicSelect,
}: HomeTopicCategoryPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, []);

    const filteredGroups = useMemo(() => {
        const search = query.trim().toLowerCase();
        const filteredTopics = topicEntries.filter((entry) => entry.topic.toLowerCase().includes(search));

        return filteredTopics.reduce<
            Array<{ label: string; topics: Array<{ number: number; topic: string; sortKey: string }> }>
        >((groups, entry) => {
            const existingGroup = groups.find((group) => group.label === entry.label);

            if (existingGroup) {
                existingGroup.topics.push({
                    number: entry.number,
                    topic: entry.topic,
                    sortKey: entry.sortKey,
                });
                return groups;
            }

            return [
                ...groups,
                {
                    label: entry.label,
                    topics: [
                        {
                            number: entry.number,
                            topic: entry.topic,
                            sortKey: entry.sortKey,
                        },
                    ],
                },
            ];
        }, []);
    }, [query]);

    return (
        <section className="glass-panel mb-8 p-4 sm:p-6">
            <div className="flex flex-col gap-4" ref={wrapperRef}>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 transition focus-within:border-emerald-400/40 hover:border-emerald-400/40">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Browse Topics</p>
                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
                            onClick={() => setIsOpen((current) => !current)}
                            type="button"
                        >
                            <FaChevronDown
                                className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                            <FaSearch />
                        </span>
                        <input
                            className="w-full border-0 bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-500"
                            onChange={(event) => {
                                onQueryChange(event.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Search Topic"
                            type="text"
                            value={query}
                        />
                    </div>
                </div>

                {isOpen ? (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                        <div className="max-h-[32rem] space-y-5 overflow-y-auto pr-1">
                            {filteredGroups.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                                    No matching topics found.
                                </div>
                            ) : (
                                filteredGroups.map((group) => (
                                    <div key={group.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                            {group.label}
                                        </h3>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                            {group.topics.map((entry) => {
                                                return (
                                                    <button
                                                        key={entry.sortKey}
                                                        className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-3 text-left text-sm text-slate-200 transition hover:border-emerald-400/40 hover:bg-slate-900"
                                                        onClick={() => {
                                                            onTopicSelect(entry.topic);
                                                            setIsOpen(false);
                                                        }}
                                                        type="button"
                                                    >
                                                        <span className="mr-2 text-emerald-300">{entry.number}.</span>
                                                        {entry.topic}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
