# Marketplace (Next.js + Tailwind + shadcn/ui)

A local buy-and-sell marketplace inspired by Facebook Marketplace.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` – Today's picks grid, category sidebar and search
- `/item/[id]` – listing detail with "Send seller a message"
- `/create` – choose listing type
- `/create/item` – listing form with live preview (photo upload, title, price, category, location, email, description)
- `/your-listings` – listings you created, with delete
- `/help` – seller help

## Data

Sample listings live in `lib/data.js`. Listings you create are saved in the browser's
localStorage (see `lib/marketplace-context.jsx`), so there's no backend yet. To add photos
to the sample listings, put images in `public/` and set `image: "/your-photo.jpg"`.
To make it multi-user, replace the context's add/delete functions with calls to an API
route or a database (e.g. Supabase, Prisma + Postgres).
