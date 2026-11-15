import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingImage({ src, alt, className }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-200", className)}>
      <ImageIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <span className="sr-only">No photo</span>
    </div>
  );
}
