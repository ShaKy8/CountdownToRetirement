/*
 * Where a month's AWS bill is heading, for scripts/spend-check.mjs.
 *
 * The first version scaled the whole month-to-date total by days, which is
 * right for charges that accrue daily and wrong for ones billed in full on
 * the 1st. Route 53's hosted zone is $0.50 on day 1, so on October 3, 2026
 * the check projected $0.51 x 31/3 = $5.27 against a $5 limit and failed a
 * month that was on course for about 60 cents. A flat charge is counted once;
 * only the rest is scaled.
 *
 * Add a usage type here only after seeing it billed whole in Cost Explorer
 * (group by USAGE_TYPE). A one-off such as the domain renewal each January
 * is real spend that month and should still be able to trip the limit.
 */
export const FIXED_MONTHLY = [/(^|-)HostedZone$/];

/**
 * rows: [service, usageType, amount] for the month so far.
 * Returns what the month comes to if the accruing part keeps its pace.
 */
export function projectAws(rows, day, daysInMonth) {
  let fixed = 0, accruing = 0;
  for (const [, usage, amount] of rows) {
    if (FIXED_MONTHLY.some((re) => re.test(usage))) fixed += amount;
    else accruing += amount;
  }
  return fixed + (accruing / day) * daysInMonth;
}
