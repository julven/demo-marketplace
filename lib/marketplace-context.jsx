"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const USER_EMAIL_KEY = "marketplace:email";
const MarketplaceContext = createContext(null);

function emailToName(email) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function rowToListing(row, userEmail) {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    category: row.category,
    location: row.location,
    seller: emailToName(row.seller_email),
    seller_email: row.seller_email,
    image: row.image_url ?? "",
    description: row.description ?? "",
    createdAt: new Date(row.created_at).getTime(),
    sold: row.sold ?? false,
    mine: userEmail ? row.seller_email === userEmail : false,
  };
}

export function MarketplaceProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_EMAIL_KEY);
      if (stored) setUserEmail(stored);
    } catch {}
  }, []);

  useEffect(() => {
    fetchListings();
  }, [userEmail]);

  async function fetchListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setListings(data.map((row) => rowToListing(row, userEmail)));
    }
    setLoaded(true);
  }

  async function refreshListings() {
    await fetchListings();
  }

  async function addListing(form) {
    let imageUrl = null;

    if (form.imageFile) {
      const path = `${Date.now()}-${form.imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, form.imageFile, { contentType: form.imageFile.type, upsert: false });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        title: form.title.trim(),
        price: Number(form.price),
        category: form.category,
        location: form.location,
        seller_email: form.email,
        description: form.description,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;

    try {
      localStorage.setItem(USER_EMAIL_KEY, form.email);
    } catch {}
    setUserEmail(form.email);

    const newListing = { ...rowToListing(data, form.email), mine: true };
    setListings((prev) => [newListing, ...prev]);
    return newListing;
  }

  async function deleteListing(id) {
    const listing = listings.find((l) => l.id === id);

    if (listing?.image) {
      const parts = listing.image.split("/listing-images/");
      if (parts[1]) {
        await supabase.storage.from("listing-images").remove([parts[1]]);
      }
    }

    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  const userListings = listings.filter((l) => l.mine);

  return (
    <MarketplaceContext.Provider value={{ listings, userListings, addListing, deleteListing, refreshListings, loaded }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error("useMarketplace must be used inside MarketplaceProvider");
  return ctx;
}
