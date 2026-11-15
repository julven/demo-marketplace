"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    fetch(`/api/stripe/checkout/confirm?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <p className="text-muted-foreground">Loading your order…</p>;

  return (
    <div className="max-w-sm space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold">Payment successful!</h1>
      {order?.listing_title && (
        <p className="text-muted-foreground">
          You purchased <strong>{order.listing_title}</strong>
          {order.amount && ` for ${formatPrice(order.amount / 100)}`}.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        The seller has been notified and will be in touch.
      </p>
      <Button asChild className="w-full"><Link href="/">Back to Marketplace</Link></Button>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-8">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
