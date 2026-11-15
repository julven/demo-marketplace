import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatPrice, timeAgo } from "@/lib/format";

// Title, price, location and seller block, shared by the item page and the create preview.
export function ListingDetails({ listing, placeholder = false }) {
  const initials = (listing.seller || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold leading-tight">{listing.title || (placeholder ? "Title" : "")}</h1>
        <p className="text-xl font-semibold">
          {listing.price === "" || listing.price === undefined ? (placeholder ? "Price" : "") : formatPrice(Number(listing.price))}
        </p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Listed {timeAgo(listing.createdAt ?? Date.now())} in {listing.location || "your area"}
        </p>
      </div>

      {listing.category && (
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">{listing.category}</span>
      )}

      <Separator />

      <div className="space-y-2">
        <h2 className="font-semibold">Description</h2>
        <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
          {listing.description || (placeholder ? "Your description will appear here." : "No description.")}
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h2 className="font-semibold">Seller information</h2>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{listing.seller}</span>
        </div>
      </div>
    </div>
  );
}
