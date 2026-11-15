"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { ListingImage } from "@/components/listing-image";
import { ListingDetails } from "@/components/listing-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, LISTING_TYPES } from "@/lib/data";
import { resizeImage } from "@/lib/format";
import { useMarketplace } from "@/lib/marketplace-context";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function CreateItemForm() {
  const router = useRouter();
  const params = useSearchParams();
  const type = LISTING_TYPES.find((t) => t.id === params.get("type")) ?? LISTING_TYPES[0];
  const { addListing } = useMarketplace();
  const fileInput = useRef(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: type.category,
    location: "Palo Alto, CA",
    email: "",
    description: "",
    image: "",
    imageFile: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("marketplace:email") ?? "";
    if (saved) setForm((f) => ({ ...f, email: saved }));
  }, []);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await resizeImage(file);
    setForm((f) => ({ ...f, image, imageFile: file }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Add a title";
    if (form.price === "" || Number(form.price) < 0) next.price = "Add a price (0 for free)";
    if (!form.category) next.category = "Choose a category";
    if (!form.email.trim()) next.email = "Add your email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const listing = await addListing(form);
      router.push(`/item/${listing.id}`);
    } catch {
      setErrors({ submit: "Failed to publish. Please try again." });
      setSubmitting(false);
    }
  }

  const preview = { ...form, seller: form.email ? form.email.split("@")[0] : "You", createdAt: Date.now() };

  return (
    <main className="grid gap-6 p-4 lg:grid-cols-[320px_minmax(0,1fr)_300px]">
      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border bg-white p-4 lg:self-start">
        <div>
          <p className="text-xs text-muted-foreground">Marketplace</p>
          <h1 className="text-xl font-bold">{type.title}</h1>
        </div>

        <div>
          <input ref={fileInput} type="file" accept="image/*" onChange={handlePhoto} className="sr-only" id="photo" />
          {form.image ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border">
              <ListingImage src={form.image} alt="Uploaded photo" />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                aria-label="Remove photo"
                onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="absolute right-2 top-2 h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-secondary text-sm font-medium transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              Add photos
            </button>
          )}
        </div>

        <Field id="title" label="Title" error={errors.title}>
          <Input id="title" value={form.title} onChange={update("title")} maxLength={80} />
        </Field>
        <Field id="price" label="Price ($)" error={errors.price}>
          <Input id="price" type="number" min="0" inputMode="numeric" value={form.price} onChange={update("price")} />
        </Field>
        <Field id="category" label="Category" error={errors.category}>
          <select id="category" value={form.category} onChange={update("category")} className={selectClass}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="location" label="Location">
          <Input id="location" value={form.location} onChange={update("location")} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" type="email" value={form.email} onChange={update("email")} />
        </Field>
        <Field id="description" label="Description">
          <Textarea id="description" rows={4} value={form.description} onChange={update("description")} />
        </Field>

        {errors.submit && <p className="text-xs text-red-600">{errors.submit}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Publishing…" : "Publish"}
        </Button>
      </form>

      {/* Preview image */}
      <section aria-label="Preview" className="min-w-0">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Preview</h2>
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-900 lg:aspect-auto lg:h-[calc(100vh-9rem)]">
          <ListingImage src={form.image} alt="Preview" className="object-contain" />
        </div>
      </section>

      {/* Preview details */}
      <aside className="rounded-lg border bg-white p-5 lg:mt-7 lg:self-start">
        <ListingDetails listing={preview} placeholder />
      </aside>
    </main>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
