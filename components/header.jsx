import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">Marketplace</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Account">
<Button variant="ghost" size="icon" aria-label="Profile" asChild>
            <Link href="/your-listings"><User className="h-5 w-5" /></Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
