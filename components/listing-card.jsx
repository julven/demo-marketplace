import Link from "next/link";
import { ListingImage } from "@/components/listing-image";
import { formatPrice } from "@/lib/format";

export function ListingCard({ listing }) {
  return (
    <Link
      href={`/item/${listing.id}`}
      className="group block overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden">
        <ListingImage src={listing.image} alt={listing.title} className="transition-transform duration-300 group-hover:scale-105" />
        {listing.sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-800">Sold</span>
          </div>
        )}
      </div>
      <div className="space-y-0.5 p-3">
        <p className="text-base font-bold">{formatPrice(listing.price)}</p>
        <p className="truncate text-sm">{listing.title}</p>
        <p className="truncate text-xs text-muted-foreground">{listing.location}</p>
      </div>
    </Link>
  );
}
