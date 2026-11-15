"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ListingImage } from "@/components/listing-image";
import { EmailGateCard } from "@/components/email-gate-card";
import { Button } from "@/components/ui/button";
import { formatPrice, timeAgo } from "@/lib/format";
import { useMarketplace } from "@/lib/marketplace-context";

export default function YourListingsPage() {
  const { listings, deleteListing } = useMarketplace();

  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("marketplace:email") ?? "";
    setInput(stored);
    setEmail(stored);
  }, []);

  const userListings = email
    ? listings.filter((l) => l.seller_email === email)
    : [];

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    setEmail(trimmed);
    try { localStorage.setItem("marketplace:email", trimmed); } catch {}
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <h1 className="mb-1 text-2xl font-bold">Your listings</h1>

        {email ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing listings for <span className="font-medium text-foreground">{email}</span>
            {" · "}
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem("marketplace:email"); } catch {}
                setInput("");
                setEmail("");
              }}
              className="underline hover:text-foreground"
            >
              Logout
            </button>
          </p>
        ) : (
          <EmailGateCard
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            className="mb-6"
          />
        )}

        {!email ? null : userListings.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="mb-4 text-muted-foreground">No listings found.</p>
            <Button asChild><Link href="/create">Create new listing</Link></Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {userListings.map((l) => (
              <li key={l.id} className="flex items-center gap-4 rounded-lg border bg-white p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
                  <ListingImage src={l.image} alt={l.title} />
                </div>
                <Link href={`/item/${l.id}`} className="min-w-0 flex-1 hover:underline">
                  <p className="truncate font-semibold">{l.title}</p>
                  <p className="text-sm">{formatPrice(l.price)}</p>
                  <p className="text-xs text-muted-foreground">Listed {timeAgo(l.createdAt)}</p>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${l.title}`}
                  onClick={async () => {
                    if (window.confirm(`Delete "${l.title}"? This cannot be undone.`)) {
                      try {
                        await deleteListing(l.id);
                      } catch {
                        alert("Failed to delete listing. Please try again.");
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
