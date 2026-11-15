import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, price, sold, seller_email")
    .eq("id", id)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (!email || listing.seller_email !== email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("listing_id", id)
    .order("created_at", { ascending: false });

  const enriched = await Promise.all(
    (orders ?? []).map(async (order) => {
      if (order.status !== "paid" || !order.stripe_account_id) return { ...order };

      try {
        const pi = await stripe.paymentIntents.retrieve(
          order.stripe_payment_intent_id,
          {},
          { stripeAccount: order.stripe_account_id }
        );

        let charge = null;
        if (pi.latest_charge) {
          charge = await stripe.charges.retrieve(
            pi.latest_charge,
            {},
            { stripeAccount: order.stripe_account_id }
          );
        }

        return {
          ...order,
          stripe: {
            payment_status: pi.status,
            buyer_email: charge?.billing_details?.email ?? null,
            card_last4: charge?.payment_method_details?.card?.last4 ?? null,
            card_brand: charge?.payment_method_details?.card?.brand ?? null,
            transfer_id: charge?.transfer ?? null,
            paid_at: pi.created,
          },
        };
      } catch {
        return { ...order };
      }
    })
  );

  return NextResponse.json({ listing, orders: enriched });
}
