"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarketplace } from "@/lib/marketplace-context";

export default function HomePage() {
  const { listings } = useMarketplace();
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const q = submitted.trim().toLowerCase();
  const visible = listings.filter(
    (l) =>
      (!category || l.category === category) &&
      (!q || `${l.title} ${l.description} ${l.location}`.toLowerCase().includes(q))
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:flex-row">
      <Sidebar activeCategory={category} onSelectCategory={setCategory} />

      <main className="min-w-0 flex-1">
        <h1 className="mb-3 text-2xl font-bold">{category ?? "Today's picks"}</h1>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query);
          }}
          className="mb-5 flex max-w-2xl gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              aria-label="Search listings"
              placeholder="Search listings..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) setSubmitted("");
              }}
              className="bg-white pl-9"
            />
          </div>
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Search</Button>
        </form>

        {visible.length === 0 ? (
          <p className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            No listings found{category ? ` in ${category}` : ""}{q ? ` for "${submitted}"` : ""}.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
