"use client";

import { useState } from "react";

interface AddContentProps {
    onAddContent: (values: {
        title: string;
        imageUrl: string;
        audioUrl: string;
    }) => Promise<void>;
}

export default function AddContent({ onAddContent }: AddContentProps) {
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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
            await onAddContent({ title, imageUrl, audioUrl });
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
                <p className="mt-2 text-sm text-slate-400">Add title, image URL, and audio URL.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
