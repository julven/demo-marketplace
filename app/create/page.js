"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Home, Layers, Tag } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { EmailGateCard } from "@/components/email-gate-card";
import { LISTING_TYPES } from "@/lib/data";

const ICONS = { item: Tag, multiple: Layers, vehicle: Car, home: Home };

export default function CreatePage() {
  const [email, setEmail] = useState(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("marketplace:email") ?? "";
    setEmail(saved);
    setInput(saved);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    try { localStorage.setItem("marketplace:email", trimmed); } catch {}
    setEmail(trimmed);
  }

  if (email === null) return null;

  if (!email) {
    return (
      <div className="flex flex-col gap-6 p-4 md:flex-row">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col justify-center pb-10">
          <h1 className="mb-1 text-2xl font-bold">Create new listing</h1>
          <EmailGateCard
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            buttonLabel="Continue"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:flex-row">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col justify-center py-10">
        <h1 className="mb-5 text-2xl font-bold">Choose listing type</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {LISTING_TYPES.map((t) => {
            const Icon = ICONS[t.id];
            return (
              <Link
                key={t.id}
                href={`/create/item?type=${t.id}`}
                className="flex flex-col items-center gap-3 rounded-xl border bg-white p-6 text-center shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="font-semibold">{t.title}</span>
                <span className="text-sm text-muted-foreground">{t.description}</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
