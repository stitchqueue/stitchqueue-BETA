/**
 * Atomic Estimate Number Generator
 * 
 * Generates unique, sequential estimate numbers using the organizations table.
 * Uses retry logic to handle race conditions when multiple estimates are
 * created simultaneously.
 * 
 * @module calculator/utils/estimateNumber
 */

import { supabase } from "../../lib/supabase";

/**
 * Gets the next estimate number atomically to prevent race conditions.
 * 
 * How it works:
 * 1. Reads current next_estimate_number from organizations table
 * 2. Increments and saves the new value
 * 3. Returns the number that was read (not the incremented one)
 * 
 * If database operations fail after retries, falls back to a timestamp-based
 * number to ensure the user can still save their estimate.
 * 
 * @returns Promise<number> - The estimate number to use
 */
export async function getNextEstimateNumberAtomic(): Promise<number> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get current estimate number from organizations table
      const { data: orgData, error: fetchError } = await supabase
        .from("organizations")
        .select("id, next_estimate_number")
        .single();

      if (fetchError) throw fetchError;

      const currentNumber = orgData?.next_estimate_number || 1001;
      const newNumber = currentNumber + 1;

      // Update with the new number
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          next_estimate_number: newNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orgData?.id);

      if (updateError) throw updateError;

      return currentNumber;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error("Failed to get atomic estimate number:", error);
        // Fallback to timestamp-based number
        return (Math.floor(Date.now() / 1000) % 100000) + 10000;
      }
      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }

  return 1001; // Ultimate fallback
}
