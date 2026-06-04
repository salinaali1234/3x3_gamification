/** Base wheel spin unlocks when every main quest journey step is complete. */
export function computeWheelSpinsEarned(
  completedJourneySteps: number,
  totalJourneySteps: number,
  spinAgainCount: number
): number {
  const base =
    totalJourneySteps > 0 && completedJourneySteps >= totalJourneySteps ? 1 : 0;
  return base + spinAgainCount;
}

export function journeyStepsUntilWheelSpin(
  completedJourneySteps: number,
  totalJourneySteps: number
): number {
  if (totalJourneySteps <= 0) return 0;
  if (completedJourneySteps >= totalJourneySteps) return 0;
  return totalJourneySteps - completedJourneySteps;
}
