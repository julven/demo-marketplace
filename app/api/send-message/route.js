import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export async function POST(request) {
  const { listing_id, listing_title, buyer_email, seller_email, message } = await request.json();

  if (!listing_id || !buyer_email || !seller_email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { error: dbError } = await supabase.from("messages").insert({
    listing_id,
    buyer_email,
    seller_email,
    message,
  });

  if (dbError) {
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }

  try {
    await transporter.sendMail({
      from: `"Marketplace" <${process.env.GMAIL_USER}>`,
      to: seller_email,
      subject: `New message about your listing: ${listing_title}`,
      text: `You have a new message from ${buyer_email}:\n\n${message}\n\nReply directly to ${buyer_email} to respond.`,
      html: `
        <p>You have a new message from <strong>${buyer_email}</strong> about your listing <strong>${listing_title}</strong>:</p>
        <blockquote style="border-left:3px solid #ccc;margin:0;padding:0 1em;color:#555">${message}</blockquote>
        <p>Reply directly to <a href="mailto:${buyer_email}">${buyer_email}</a> to respond.</p>
      `,
    });
  } catch (mailError) {
    console.error("Email send failed:", mailError);
  }

  return NextResponse.json({ ok: true });
}
