"use client";

import { useMemo, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { topicEntries } from "@/src/lib/topicCategories";

interface AddContentProps {
    onAddContent: (values: {
        topicName: string;
        title: string;
        imageUrl: string;
        audioUrl: string;
    }) => Promise<void>;
}

export default function AddContent({ onAddContent }: AddContentProps) {
    const [isTopicListOpen, setIsTopicListOpen] = useState(false);
    const [topicQuery, setTopicQuery] = useState("");
    const [topicName, setTopicName] = useState("");
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const filteredTopics = useMemo(() => {
        const normalizedQuery = topicQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return topicEntries;
        }

        return topicEntries.filter((entry) => entry.topic.toLowerCase().includes(normalizedQuery));
    }, [topicQuery]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage("");
        setError("");

        const normalizedImageUrl = imageUrl.trim().toLowerCase();
        const normalizedAudioUrl = audioUrl.trim().toLowerCase();

        if (normalizedImageUrl.includes("example.com") || normalizedAudioUrl.includes("example.com")) {
            setError("Use real public image/audio URLs. example.com links are only placeholders.");
            setSubmitting(false);
            return;
        }

        try {
            await onAddContent({ topicName, title, imageUrl, audioUrl });
            setTopicQuery("");
            setIsTopicListOpen(false);
            setTopicName("");
            setTitle("");
            setImageUrl("");
            setAudioUrl("");
            setMessage("Content saved to Supabase.");
        } catch (submitError) {
            const errorMessage =
                submitError instanceof Error ? submitError.message : "Unable to save content right now.";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="glass-panel p-6 sm:p-8">
            <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Add Content</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Upload Audio</h2>
                <p className="mt-2 text-sm text-slate-400">Add topic, title, image URL, and audio URL.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                    <button
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-left text-slate-200 transition hover:border-emerald-400/40"
                        onClick={() => setIsTopicListOpen((current) => !current)}
                        type="button"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                                <FaSearch />
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Category List</p>
                                <p className="mt-1 text-base font-semibold text-white">Topics</p>
                            </div>
                        </div>

                        <FaChevronDown
                            className={`text-slate-400 transition-transform ${isTopicListOpen ? "rotate-180" : "rotate-0"}`}
                        />
                    </button>

                    {isTopicListOpen ? (
                        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                            <input
                                className="field"
                                onChange={(event) => setTopicQuery(event.target.value)}
                                placeholder="Search topics"
                                type="text"
                                value={topicQuery}
                            />

                            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                                {filteredTopics.map((entry) => (
                                    <button
                                        key={entry.sortKey}
                                        className="flex w-full items-center rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-3 text-left text-sm text-slate-200 transition hover:border-emerald-400/40 hover:bg-slate-900"
                                        onClick={() => {
                                            setTopicName(entry.topic);
                                            setTopicQuery(entry.topic);
                                            setIsTopicListOpen(false);
                                        }}
                                        type="button"
                                    >
                                        <span className="mr-3 text-emerald-300">{entry.number}.</span>
                                        <span>{entry.topic}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="content-topic-name">
                        Topic Name
                    </label>
                    <input
                        id="content-topic-name"
                        className="field"
                        value={topicName}
                        onChange={(event) => setTopicName(event.target.value)}
                        placeholder="Sleep Story"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="content-title">
                        Title
                    </label>
                    <input
                        id="content-title"
                        className="field"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Midnight Rain Stories"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="content-image-url">
                        Image URL
                    </label>
                    <input
                        id="content-image-url"
                        className="field"
                        type="url"
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        placeholder="https://your-cdn.com/cover.jpg"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300" htmlFor="content-audio-url">
                        Audio URL
                    </label>
                    <input
                        id="content-audio-url"
                        className="field"
                        type="url"
                        value={audioUrl}
                        onChange={(event) => setAudioUrl(event.target.value)}
                        placeholder="https://your-cdn.com/story.mp3"
                        required
                    />
                </div>

                {message ? (
                    <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {message}
                    </p>
                ) : null}

                {error ? (
                    <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                ) : null}

                <button className="primary-button w-full sm:w-auto" disabled={submitting} type="submit">
                    {submitting ? "Saving..." : "Save Content"}
                </button>
            </form>
        </section>
    );
}
