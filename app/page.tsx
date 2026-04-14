"use client";

import Link from "next/link";
import { useState } from "react";
import HomeContentGrid from "@/src/components/HomeContentGrid";
import HomeTopicCategoryPicker from "@/src/components/HomeTopicCategoryPicker";

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Story</p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Audio Library</h1>
        </div>
        <Link className="secondary-button shrink-0" href="/settings">
          Settings
        </Link>
      </div>
      <HomeTopicCategoryPicker
        onQueryChange={setQuery}
        onTopicSelect={setQuery}
        query={query}
      />
      <HomeContentGrid searchTerm={query} />
    </main>
  );
}
