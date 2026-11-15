"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmailGateCard({ value, onChange, onSubmit, buttonLabel = "View", className = "" }) {
  return (
    <div className={`max-w-md rounded-lg border bg-white p-5 ${className}`}>
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="gate-email">Your email</Label>
          <Input
            id="gate-email"
            type="email"
            placeholder="you@example.com"
            value={value}
            onChange={onChange}
            required
            autoFocus
          />
        </div>
        <Button type="submit" className="self-end">{buttonLabel}</Button>
      </form>
    </div>
  );
}
