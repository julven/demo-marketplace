import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const appUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
const webhookUrl = `${appUrl}/api/stripe/webhook`;

// Delete any existing endpoint for this URL to free a slot
const { data: existing } = await stripe.webhookEndpoints.list({ limit: 100 });
const mine = existing.filter((e) => e.url === webhookUrl);
for (const e of mine) {
  await stripe.webhookEndpoints.del(e.id);
  console.log("Deleted old endpoint:", e.id);
}

const endpoint = await stripe.webhookEndpoints.create({
  url: webhookUrl,
  connect: true,
  enabled_events: ["checkout.session.completed", "account.updated"],
});

console.log("Webhook registered:", endpoint.url);
console.log("\nAdd this to .env.local and Vercel:");
console.log(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
