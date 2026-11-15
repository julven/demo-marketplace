"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Zap } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ConnectPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onboarded, setOnboarded] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("marketplace:email") ?? "";
    setEmail(saved);
    if (!saved) return;
    fetch(`/api/stripe/connect?email=${encodeURIComponent(saved)}`)
      .then((r) => r.json())
      .then((d) => setOnboarded(d.onboarded))
      .catch(() => setOnboarded(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    let data;
    try { data = await res.json(); } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    if (!res.ok || !data.url) {
      setError(data?.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    try { localStorage.setItem("marketplace:email", email.trim()); } catch {}
    window.location.href = data.url;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:flex-row">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col justify-center pt-2 pb-10">
        <div className="max-w-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${onboarded ? "bg-green-600" : "bg-primary"}`}>
              {onboarded ? <CheckCircle className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {onboarded ? "You're connected" : "Connect with Stripe"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {onboarded
                  ? "Your account is set up. Buyers can pay you directly."
                  : "Enter the email you use for your listings. You'll be taken to Stripe to set up payouts."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-5">
            {onboarded ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Your email</Label>
                  <p className="flex h-10 items-center rounded-md border bg-secondary px-3 text-sm text-muted-foreground">
                    {email}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Stripe account connected and active.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Your email</Label>
                  <p className="flex h-10 items-center rounded-md border bg-secondary px-3 text-sm text-muted-foreground">
                    {email || "No email saved"}
                  </p>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading || !email}>
                  {loading ? "Redirecting…" : "Connect with Stripe"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
