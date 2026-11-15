import { Sidebar } from "@/components/sidebar";

const faqs = [
  { q: "How do I create a listing?", a: "Choose \"Create new listing\", pick a listing type, add a photo, title, price and category, then select Publish." },
  { q: "Where are my listings saved?", a: "In this demo, listings are stored in your browser, so they stay on this device until you delete them." },
  { q: "How do I remove a listing?", a: "Open \"Your listings\" and select the trash icon next to the listing." },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:flex-row">
      <Sidebar />
      <main className="min-w-0 max-w-2xl flex-1">
        <h1 className="mb-4 text-2xl font-bold">Seller help</h1>
        <div className="space-y-3">
          {faqs.map((f) => (
            <section key={f.q} className="rounded-lg border bg-white p-4">
              <h2 className="font-semibold">{f.q}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
