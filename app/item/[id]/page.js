"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { ListingImage } from "@/components/listing-image";
import { ListingDetails } from "@/components/listing-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMarketplace } from "@/lib/marketplace-context";

export default function ItemPage() {
  const { id } = useParams();
  const { listings, loaded } = useMarketplace();
  const listing = listings.find((l) => l.id === id);

  const [storedEmail, setStoredEmail] = useState("");

  const [message, setMessage] = useState("Is this still available?");
  const [buyerEmail, setBuyerEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("marketplace:email") ?? "";
    setStoredEmail(saved);
    setBuyerEmail(saved);
  }, []);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  if (!listing) {
    return (
      <main className="p-8 text-center">
        <p className="text-muted-foreground">{loaded ? "This listing doesn't exist or was removed." : "Loading..."}</p>
        {loaded && <Button asChild variant="outline" className="mt-4"><Link href="/">Back to Marketplace</Link></Button>}
      </main>
    );
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim() || !buyerEmail.trim()) return;
    setSending(true);
    setSendError("");

    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: listing.id,
        listing_title: listing.title,
        buyer_email: buyerEmail.trim(),
        seller_email: listing.seller_email,
        message: message.trim(),
      }),
    });

    setSending(false);
    if (!res.ok) {
      setSendError("Failed to send. Please try again.");
    } else {
      try { localStorage.setItem("marketplace:email", buyerEmail.trim()); } catch { }
      setSent(true);
    }
  }

  return (
    <main className="flex flex-col gap-y-3 p-4">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to listings
        </Link>
      </div>

      <div className="flex flex-col gap-x-6 gap-y-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-900">
            <ListingImage src={listing.image} alt={listing.title} className="object-contain" />
          </div>
        </div>

      <aside className="w-full space-y-6 rounded-lg border bg-white p-5 lg:w-96 lg:self-start">
        <ListingDetails listing={listing} />

        {storedEmail && storedEmail === listing.seller_email ? (
          <p className="rounded-md bg-secondary p-3 text-sm">This is your listing.</p>
        ) : sent ? (
          <div className="flex items-start gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Message sent to {listing.seller}.
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="buyer-email">Your email</Label>
              <Input
                id="buyer-email"
                type="email"
                placeholder="you@example.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message to seller</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            </div>
            {sendError && <p className="text-xs text-red-600">{sendError}</p>}
            <Button type="submit" className="w-full" disabled={!message.trim() || !buyerEmail.trim() || sending}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </form>
        )}
      </aside>
      </div>
    </main>
  );
}
