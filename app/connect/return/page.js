"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

function ReturnContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!email) { setStatus("error"); return; }
    fetch(`/api/stripe/connect?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setStatus(d.onboarded ? "connected" : "pending"))
      .catch(() => setStatus("error"));
  }, [email]);

  if (status === "checking") {
    return <p className="text-muted-foreground">Checking your account…</p>;
  }

  if (status === "connected") {
    return (
      <div className="max-w-sm space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">You're connected!</h1>
        <p className="text-sm text-muted-foreground">
          Your listings now show a <strong>Buy Now</strong> button for buyers.
        </p>
        <Button asChild><Link href="/">Go to Marketplace</Link></Button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-sm space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Almost there</h1>
        <p className="text-sm text-muted-foreground">
          Your Stripe account is still being verified. Check back soon or complete onboarding again.
        </p>
        <Button asChild variant="outline">
          <Link href={`/connect?email=${encodeURIComponent(email)}`}>Resume onboarding</Link>
        </Button>
      </div>
    );
  }

  return <p className="text-red-600">Something went wrong. Please try again.</p>;
}

export default function ConnectReturnPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-8">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <ReturnContent />
      </Suspense>
    </main>
  );
}
