import type { CashFlowRow, IndirectAdjustmentRow, ManagerialWorkbook, NoncashRow } from '@/types/managerial';

export function roundCents(amount: number): number {
  if (!Number.isFinite(amount) || Math.abs(amount) >= 1e21) return amount;
  const [coefficient, exponent = '0'] = Math.abs(amount).toString().split('e');
  const shifted = Number(`${coefficient}e${Number(exponent) + 2}`);
  const [rounded, roundedExponent = '0'] = Math.round(shifted).toString().split('e');
  return Math.sign(amount) * Number(`${rounded}e${Number(roundedExponent) - 2}`);
}
export const isValidCashAmount = (amount: unknown): amount is number => typeof amount === 'number' && Number.isFinite(amount);
export const isValidRowAmount = (amount: unknown): amount is number => isValidCashAmount(amount) && amount >= 0;

export interface SectionTotal {
  total: number | null;
  complete: boolean;
  missingCount: number;
  invalidCount: number;
}

function totalRows<T extends { amount: number | null }>(rows: readonly T[], sign: (row: T) => number): SectionTotal {
  let cents = 0;
  let missingCount = 0;
  let invalidCount = 0;
  for (const row of rows) {
    if (row.amount === null) missingCount++;
    else if (!isValidRowAmount(row.amount) || !Number.isFinite(sign(row))) invalidCount++;
    else cents += Math.round(roundCents(row.amount) * 100) * sign(row);
  }
  const complete = missingCount === 0 && invalidCount === 0 && Number.isFinite(cents);
  return { total: complete ? cents / 100 : null, complete, missingCount, invalidCount };
}

export const calculateCashSection = (rows: readonly CashFlowRow[]): SectionTotal => totalRows(rows, row => row.direction === 'inflow' ? 1 : row.direction === 'outflow' ? -1 : NaN);
export const calculateAdjustments = (rows: readonly IndirectAdjustmentRow[]): SectionTotal => totalRows(rows, row => row.direction === 'add' ? 1 : row.direction === 'deduct' ? -1 : NaN);
export const calculateNoncash = (rows: readonly NoncashRow[]): SectionTotal => totalRows(rows, () => 1);

export interface CashReconciliation {
  complete: boolean;
  netChange: number | null;
  expectedClosingCash: number | null;
  actualChange: number | null;
  difference: number | null;
  reconciled: boolean | null;
}

function reconcile(cfo: number | null, investing: number | null, financing: number | null, opening: number | null, closing: number | null): CashReconciliation {
  const netChange = cfo !== null && investing !== null && financing !== null ? roundCents(cfo + investing + financing) : null;
  const expectedClosingCash = netChange !== null && isValidCashAmount(opening) ? roundCents(opening + netChange) : null;
  const actualChange = isValidCashAmount(opening) && isValidCashAmount(closing) ? roundCents(closing - opening) : null;
  const difference = expectedClosingCash !== null && isValidCashAmount(closing) ? roundCents(closing - expectedClosingCash) : null;
  return { complete: difference !== null, netChange, expectedClosingCash, actualChange, difference, reconciled: difference === null ? null : difference === 0 };
}

export function calculateCashFlow(workbook: ManagerialWorkbook) {
  const directOperating = calculateCashSection(workbook.directOperating);
  const indirectAdjustments = calculateAdjustments(workbook.indirectAdjustments);
  const investing = calculateCashSection(workbook.investing);
  const financing = calculateCashSection(workbook.financing);
  const noncash = calculateNoncash(workbook.noncash);
  const CFOdirect = directOperating.total;
  const CFOindirect = isValidCashAmount(workbook.netIncome) && indirectAdjustments.total !== null ? roundCents(roundCents(workbook.netIncome) + indirectAdjustments.total) : null;
  const comparisonDifference = CFOdirect !== null && CFOindirect !== null ? roundCents(CFOdirect - CFOindirect) : null;
  return {
    directOperating, indirectAdjustments, investing, financing, noncash,
    CFOdirect, CFOindirect,
    direct: reconcile(CFOdirect, investing.total, financing.total, workbook.openingCash, workbook.closingCash),
    indirect: reconcile(CFOindirect, investing.total, financing.total, workbook.openingCash, workbook.closingCash),
    comparisonDifference,
    methodsAgree: comparisonDifference === null ? null : comparisonDifference === 0,
  };
}
