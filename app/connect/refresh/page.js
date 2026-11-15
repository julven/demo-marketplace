"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RefreshContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  useEffect(() => {
    if (!email) return;
    fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.url) window.location.href = d.url; });
  }, [email]);

  return <p className="text-muted-foreground">Refreshing your onboarding link…</p>;
}

export default function ConnectRefreshPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-8">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <RefreshContent />
      </Suspense>
    </main>
  );
}
