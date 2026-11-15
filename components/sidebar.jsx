"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, PlusCircle, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useMarketplace } from "@/lib/marketplace-context";

const sellLinks = [
  { href: "/create", label: "Create new listing", icon: PlusCircle },
  { href: "/your-listings", label: "Your listings", icon: Tag },
  { href: "/help", label: "Seller help", icon: CircleHelp },
];

const itemClass = "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary";

export function Sidebar({ activeCategory, onSelectCategory }) {
  const pathname = usePathname();
  const { listings } = useMarketplace();
  const categories = [...new Set(listings.map((l) => l.category))].sort();

  return (
    <aside className="w-full shrink-0 rounded-lg border bg-white p-3 md:sticky md:top-20 md:w-60 md:self-start">
      <h2 className="px-3 pb-2 pt-1 text-lg font-bold">Sell</h2>
      <nav aria-label="Selling">
        {sellLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(itemClass, pathname === href && "bg-accent font-medium text-accent-foreground")}
          >
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      {onSelectCategory && (
        <>
          <Separator className="my-3" />
          <h2 className="px-3 pb-2 text-lg font-bold">Categories</h2>
          <nav aria-label="Categories" className="flex gap-1 overflow-x-auto pb-1 md:block md:overflow-visible md:pb-0">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              aria-pressed={!activeCategory}
              className={cn(itemClass, "shrink-0 md:w-full", !activeCategory && "bg-accent font-medium text-accent-foreground")}
            >
              All listings
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelectCategory(c)}
                aria-pressed={activeCategory === c}
                className={cn(itemClass, "shrink-0 whitespace-nowrap text-left md:w-full", activeCategory === c && "bg-accent font-medium text-accent-foreground")}
              >
                {c}
              </button>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
