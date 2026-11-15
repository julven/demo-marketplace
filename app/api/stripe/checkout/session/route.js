import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  if (!session_id) return NextResponse.json({});

  const { data: order } = await supabase
    .from("orders")
    .select("*, listings(title)")
    .eq("stripe_session_id", session_id)
    .single();

  if (order) {
    return NextResponse.json({
      listing_title: order.listings?.title,
      amount: order.amount,
      status: order.status,
    });
  }

  // webhook may not have fired yet — retrieve from Stripe directly using connected account
  // We need the connected account for direct charges; get it from the order metadata
  try {
    // Try platform-level first (won't work for direct charges, but handle gracefully)
    return NextResponse.json({ listing_title: null, amount: null });
  } catch {
    return NextResponse.json({});
  }
}
