"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, CircleDashed, CreditCard, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

function fmt(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "—";
}

export default function ListingOrdersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("marketplace:email") ?? "";
    if (!email) { setError("no_email"); setLoading(false); return; }

    fetch(`/api/listings/${id}/orders?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setData(d); }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error === "no_email") {
    return (
      <main className="p-8 text-center space-y-3">
        <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">No email saved. Go back and view a listing first.</p>
        <Button asChild variant="outline"><Link href="/">Back to Marketplace</Link></Button>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8 text-center space-y-3">
        <ShieldAlert className="mx-auto h-8 w-8 text-red-400" />
        <p className="text-muted-foreground">{error === "Unauthorized." ? "You are not the owner of this listing." : error}</p>
        <Button asChild variant="outline"><Link href="/">Back to Marketplace</Link></Button>
      </main>
    );
  }

  const { listing, orders } = data;
  const paidOrder = orders.find((o) => o.status === "paid");

  return (
    <main className="flex flex-col gap-y-6 p-4 max-w-xl mx-auto">
      <div>
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold">{listing.title}</h1>
        <p className="text-sm text-muted-foreground">Listed at {fmt(Math.round(listing.price * 100))}</p>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-lg p-4 ${listing.sold ? "bg-green-50 border border-green-200" : "bg-slate-50 border"}`}>
        {listing.sold
          ? <BadgeCheck className="h-5 w-5 text-green-600 shrink-0" />
          : <CircleDashed className="h-5 w-5 text-muted-foreground shrink-0" />}
        <div>
          <p className={`font-semibold ${listing.sold ? "text-green-800" : "text-slate-700"}`}>
            {listing.sold ? "Sold" : "Available"}
          </p>
          <p className="text-xs text-muted-foreground">
            {listing.sold ? "Payment confirmed." : "No confirmed payment yet."}
          </p>
        </div>
      </div>

      {/* Payment breakdown */}
      {paidOrder && (
        <div className="rounded-lg border bg-white p-5 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Payment Details</h2>
          </div>

          <div className="divide-y text-sm">
            <Row label="Item price" value={fmt(paidOrder.amount)} />
            <Row label="Platform fee (10%)" value={`− ${fmt(paidOrder.platform_fee)}`} muted />
            <Row label="You receive" value={fmt(paidOrder.amount - paidOrder.platform_fee)} bold />
          </div>

          {paidOrder.stripe && (
            <div className="divide-y text-sm">
              <Row label="Buyer email" value={paidOrder.stripe.buyer_email ?? "—"} />
              <Row
                label="Card"
                value={
                  paidOrder.stripe.card_brand && paidOrder.stripe.card_last4
                    ? `${capitalize(paidOrder.stripe.card_brand)} •••• ${paidOrder.stripe.card_last4}`
                    : "—"
                }
              />
              <Row
                label="Paid at"
                value={
                  paidOrder.stripe.paid_at
                    ? new Date(paidOrder.stripe.paid_at * 1000).toLocaleString()
                    : "—"
                }
              />
              <Row label="Payment status" value={capitalize(paidOrder.stripe.payment_status)} />
              <Row label="Transfer ID" value={paidOrder.stripe.transfer_id ?? "—"} mono />
              <Row label="Session ID" value={paidOrder.stripe_session_id} mono truncate />
            </div>
          )}
        </div>
      )}

      {orders.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No orders yet.</p>
      )}

      {orders.length > 0 && !paidOrder && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Orders exist but none are confirmed as paid yet.
        </p>
      )}
    </main>
  );
}

function Row({ label, value, muted, bold, mono, truncate }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={[
        mono ? "font-mono text-xs" : "",
        bold ? "font-semibold" : "",
        muted ? "text-muted-foreground" : "",
        truncate ? "truncate max-w-[180px]" : "",
      ].join(" ").trim()}>
        {value}
      </span>
    </div>
  );
}
