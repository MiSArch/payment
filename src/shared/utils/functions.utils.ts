/**
 * Calculates a date that is x days back from the current date.
 * @param x The number of days to go back.
 * @returns The calculated date.
 */
export const xDaysBackFromNow = (x: number): Date => {
  const now = new Date();
  now.setDate(now.getDate() - x);
  return now;
};
