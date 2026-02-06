/**
 * Calculator Utilities
 * 
 * Re-exports all utility functions for clean imports:
 * import { calculateTotals, getNextEstimateNumberAtomic } from './utils';
 */

export { calculateTotals } from './calculations';
export type { CalculationInputs, CalculationResults } from './calculations';
export { getNextEstimateNumberAtomic } from './estimateNumber';
