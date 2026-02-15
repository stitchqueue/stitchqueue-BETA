/**
 * BOC Purchase Status
 *
 * Checks if the current user has purchased the BOC add-on.
 *
 * @module lib/storage/boc-stripe
 */

import { supabase } from "../supabase";

export interface BOCPurchaseStatus {
  hasPurchased: boolean;
  purchaseDate: string | null;
}

/**
 * Check if a user has purchased the BOC add-on.
 * When NEXT_PUBLIC_ENABLE_BETA_MODE is "true", bypasses the purchase
 * check and grants full access to all users.
 */
export async function getBOCPurchaseStatus(
  userId: string
): Promise<BOCPurchaseStatus> {
  if (process.env.NEXT_PUBLIC_ENABLE_BETA_MODE === "true") {
    return { hasPurchased: true, purchaseDate: null };
  }

  const { data, error } = await supabase
    .from("boc_purchases")
    .select("purchase_date")
    .eq("user_id", userId)
    .order("purchase_date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { hasPurchased: false, purchaseDate: null };
  }

  return {
    hasPurchased: true,
    purchaseDate: data.purchase_date as string,
  };
}
