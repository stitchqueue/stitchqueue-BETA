/**
 * BOC Rate Calculation Engine
 *
 * Pure function — no side effects, no DB calls.
 */

export interface BOCCalculationInputs {
  targetHourlyWage: number;
  sphRate: number;
  monthlyOverhead: number;
  projectsPerMonth: number;
  incidentalsMinutes: number;
  avgProjectSize: number;
}

export interface BOCCalculationResults {
  isValid: boolean;
  overheadPerProject: number;
  quiltingTimeMinutes: number;
  totalTimeMinutes: number;
  wageNeededPerProject: number;
  totalNeededPerProject: number;
  minimumRatePerSqIn: number;
}

const EMPTY_RESULTS: BOCCalculationResults = {
  isValid: false,
  overheadPerProject: 0,
  quiltingTimeMinutes: 0,
  totalTimeMinutes: 0,
  wageNeededPerProject: 0,
  totalNeededPerProject: 0,
  minimumRatePerSqIn: 0,
};

/**
 * Calculate the minimum per-square-inch rate a quilter needs to charge.
 *
 * Returns `isValid: false` when any denominator would be zero.
 */
export function calculateMinimumRate(
  inputs: BOCCalculationInputs
): BOCCalculationResults {
  const {
    targetHourlyWage,
    sphRate,
    monthlyOverhead,
    projectsPerMonth,
    incidentalsMinutes,
    avgProjectSize,
  } = inputs;

  // Guard against division by zero
  if (projectsPerMonth <= 0 || sphRate <= 0 || avgProjectSize <= 0) {
    return EMPTY_RESULTS;
  }

  const overheadPerProject = monthlyOverhead / projectsPerMonth;
  const quiltingTimeMinutes = (avgProjectSize / sphRate) * 60;
  const totalTimeMinutes = quiltingTimeMinutes + incidentalsMinutes;
  const wageNeededPerProject = (totalTimeMinutes / 60) * targetHourlyWage;
  const totalNeededPerProject = overheadPerProject + wageNeededPerProject;
  const minimumRatePerSqIn = totalNeededPerProject / avgProjectSize;

  return {
    isValid: true,
    overheadPerProject,
    quiltingTimeMinutes,
    totalTimeMinutes,
    wageNeededPerProject,
    totalNeededPerProject,
    minimumRatePerSqIn,
  };
}
