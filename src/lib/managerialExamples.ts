import { generateId } from '@/types/accounting';
import type { CashFlowRow, IndirectAdjustmentRow, ManagerialExampleSource, ManagerialWorkbookInput, NoncashRow } from '@/types/managerial';

export interface ManagerialSourceGroup {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ManagerialExample {
  name: string;
  citation: string;
  units: string;
  directAvailable: boolean;
  groups: ManagerialSourceGroup[];
  assumptions: string[];
  expected: { operating: number; investing: number; financing: number; netChange: number; closingCash: number };
  workings: string[];
}

export const managerialExamples: Record<ManagerialExampleSource, ManagerialExample> = {
  allison: {
    name: 'Allison Company',
    citation: 'Chapter 13, slides 37–76',
    units: '$000 (1 entered = $1,000)',
    directAvailable: true,
    groups: [
      { title: 'Income statement — given', columns: ['Account', 'Amount ($000)'], rows: [
        ['Sales revenue', '900'], ['Dividends revenue', '3'], ['Interest revenue', '6'], ['Gain on plant sale', '31'],
        ['Cost of goods sold', '500'], ['Operating expenses (includes depreciation 40)', '300'], ['Interest expense', '35'],
        ['Loss on securities sale', '4'], ['Tax expense', '36'], ['Net income', '65'],
      ] },
      { title: 'Working-capital changes — Δ = ending − beginning', columns: ['Account', 'Change ($000)'], rows: [
        ['Accounts receivable', '+30'], ['Interest receivable', '−1'], ['Inventory', '+10'], ['Prepayments', '+3'],
        ['Accounts payable', '+15'], ['Other accrued expenses', '−6'], ['Interest payable', '+7'], ['Taxes payable', '−2'],
      ] },
      { title: 'Investing, financing & cash — source transactions', columns: ['Transaction / balance', 'Amount ($000)'], rows: [
        ['Securities purchased for cash', '65'], ['Securities sold: cash proceeds / cost', '40 / 44'],
        ['Loan made / principal collected', '17 / 12'], ['Plant purchased: total / note / cash portion', '200 / 40 / 160'],
        ['Plant sold: cash proceeds / book value', '75 / 44'], ['Cash borrowed / debt principal repaid', '45 / 55'],
        ['Bonds issued for cash', '100'], ['Shares issued for cash', '50'], ['Cash dividends paid', '40'],
        ['Opening / closing cash', '20 / 55'],
      ] },
    ],
    assumptions: [
      'All figures are in thousands of dollars. Net income 65 and cash balances 20 → 55 are given, not answers to fill in.',
      'Professor’s FASB convention: interest and dividends received, interest paid and taxes paid are operating; dividends paid are financing.',
      'Operating expenses 300 include depreciation 40. Prepayments and other accrued expenses relate to operating expenses; accounts payable relates to inventory.',
      'Interest receivable decreases by 1; dividends received equal dividends revenue 3. The plant purchase includes a noncash note of 40; only 160 is cash investing.',
      'Securities cost 44 less cash proceeds 40 gives loss 4. Plant proceeds 75 less book value 44 gives gain 31. Do not use book value as cash proceeds.',
    ],
    expected: { operating: 50, investing: -115, financing: 100, netChange: 35, closingCash: 55 },
    workings: [
      'Customers: 900 − 30 = 870. Interest/dividends: 6 + 1 + 3 = 10.',
      'Suppliers: 500 + 10 − 15 = 495. Operating expenses: 300 − 40 + 3 − (−6) = 269.',
      'Interest paid: 35 − 7 = 28. Taxes paid: 36 − (−2) = 38.',
      'Direct CFO: 870 + 10 − 495 − 269 − 28 − 38 = 50.',
      'Indirect CFO: 65 + 40 + 1 + 15 + 7 + 4 − 30 − 10 − 3 − 6 − 2 − 31 = 50.',
      'Investing: −65 + 40 − 17 + 12 − 160 + 75 = −115. Financing: 45 − 55 + 100 + 50 − 40 = 100.',
      'Net change: 50 − 115 + 100 = 35. Closing cash: 20 + 35 = 55.',
    ],
  },
  'auto-supply': {
    name: 'Auto Supply Company',
    citation: 'Chapter 13, slides 78–81',
    units: '$000 (1 entered = $1,000)',
    directAvailable: false,
    groups: [
      { title: 'Comparative balances — given', columns: ['Account', 'Opening ($000)', 'Closing ($000)'], rows: [
        ['Cash', '50', '45'], ['Securities', '40', '25'], ['Accounts receivable', '320', '330'], ['Inventory', '240', '235'],
        ['Net plant', '600', '640'], ['Accounts payable', '150', '160'], ['Accrued expenses', '60', '45'],
        ['Mortgage payable', '0', '70'], ['Bonds payable', '500', '350'], ['Retained earnings', '380', '490'],
      ] },
      { title: 'Additional information — given', columns: ['Item', 'Amount ($000)'], rows: [
        ['Net income', '250'], ['Depreciation', '60'], ['Gain on securities sale', '20'], ['Securities sale cash proceeds', '35'],
        ['Plant purchased: total / cash / mortgage', '100 / 30 / 70'], ['Cash dividends paid', '140'], ['Bonds redeemed for cash', '150'],
      ] },
    ],
    assumptions: [
      'All figures are in thousands of dollars. Net income 250 and cash balances 50 → 45 are given.',
      'This source supports the indirect method only: no sales, expense or customer/supplier cash data are provided. Do not invent a direct statement.',
      'Plant costing 100 is acquired for cash 30 and a noncash mortgage 70. Disclose the mortgage separately; never include it in cash flows.',
      'Securities proceeds 35 include gain 20; remove the gain from operating cash flow and include the full proceeds in investing.',
      'Professor’s FASB convention applies; cash dividends paid are financing.',
    ],
    expected: { operating: 280, investing: 5, financing: -290, netChange: -5, closingCash: 45 },
    workings: [
      'Changes (ending − beginning): receivables +10; inventory −5; payables +10; accrued expenses −15.',
      'Indirect CFO: 250 + 60 + 5 + 10 − 10 − 15 − 20 = 280.',
      'Investing: 35 − 30 = 5. Financing: −140 − 150 = −290.',
      'Net change: 280 + 5 − 290 = −5. Closing cash: 50 − 5 = 45.',
      'Noncash disclosure: plant acquired with mortgage 70. Direct CFO remains unavailable.',
    ],
  },
};

const cash = (title: string, direction: CashFlowRow['direction'], value: number, solved: boolean): CashFlowRow => ({ id: generateId(), title, direction, amount: solved ? value : null });
const adjustment = (title: string, direction: IndirectAdjustmentRow['direction'], value: number, solved: boolean): IndirectAdjustmentRow => ({ id: generateId(), title, direction, amount: solved ? value : null });
const noncash = (title: string, value: number, solved: boolean): NoncashRow => ({ id: generateId(), title, amount: solved ? value : null });

export function createManagerialExampleInput(source: ManagerialExampleSource, solved = false): ManagerialWorkbookInput {
  const common: ManagerialWorkbookInput = {
    sourceExample: source,
    exampleMode: solved ? 'reveal' : 'practice',
    periodLabel: 'Year ended — professor example',
    description: `${managerialExamples[source].citation} · All amounts in $000 · ${solved ? 'Explicit solved copy' : 'Manual practice; row amounts left blank'}`,
    notes: '',
  };
  if (source === 'allison') return {
    ...common, openingCash: 20, closingCash: 55, netIncome: 65,
    directOperating: [cash('Cash received from customers', 'inflow', 870, solved), cash('Interest and dividends received', 'inflow', 10, solved), cash('Cash paid to suppliers', 'outflow', 495, solved), cash('Cash paid for operating expenses', 'outflow', 269, solved), cash('Interest paid', 'outflow', 28, solved), cash('Income taxes paid', 'outflow', 38, solved)],
    indirectAdjustments: [adjustment('Depreciation', 'add', 40, solved), adjustment('Decrease in interest receivable', 'add', 1, solved), adjustment('Increase in accounts payable', 'add', 15, solved), adjustment('Increase in interest payable', 'add', 7, solved), adjustment('Loss on securities sale', 'add', 4, solved), adjustment('Increase in accounts receivable', 'deduct', 30, solved), adjustment('Increase in inventory', 'deduct', 10, solved), adjustment('Increase in prepayments', 'deduct', 3, solved), adjustment('Decrease in other accrued expenses', 'deduct', 6, solved), adjustment('Decrease in taxes payable', 'deduct', 2, solved), adjustment('Gain on plant sale', 'deduct', 31, solved)],
    investing: [cash('Purchase of securities', 'outflow', 65, solved), cash('Sale of securities — proceeds', 'inflow', 40, solved), cash('Loan made', 'outflow', 17, solved), cash('Loan principal collected', 'inflow', 12, solved), cash('Purchase of plant — cash portion', 'outflow', 160, solved), cash('Sale of plant — proceeds', 'inflow', 75, solved)],
    financing: [cash('Cash borrowing', 'inflow', 45, solved), cash('Debt principal repayment', 'outflow', 55, solved), cash('Bonds issued', 'inflow', 100, solved), cash('Shares issued', 'inflow', 50, solved), cash('Cash dividends paid', 'outflow', 40, solved)],
    noncash: [noncash('Plant acquired by issuing a note (total cost 200; cash 160)', 40, solved)],
  };
  return {
    ...common, openingCash: 50, closingCash: 45, netIncome: 250,
    directOperating: [{ id: generateId(), title: 'Direct cash receipts/payments not provided in this source', direction: 'inflow', amount: null }],
    indirectAdjustments: [adjustment('Depreciation', 'add', 60, solved), adjustment('Decrease in inventory', 'add', 5, solved), adjustment('Increase in accounts payable', 'add', 10, solved), adjustment('Increase in accounts receivable', 'deduct', 10, solved), adjustment('Decrease in accrued expenses', 'deduct', 15, solved), adjustment('Gain on securities sale', 'deduct', 20, solved)],
    investing: [cash('Sale of securities — proceeds', 'inflow', 35, solved), cash('Purchase of plant — cash portion', 'outflow', 30, solved)],
    financing: [cash('Cash dividends paid', 'outflow', 140, solved), cash('Bonds redeemed', 'outflow', 150, solved)],
    noncash: [noncash('Plant acquired with mortgage (total cost 100; cash 30)', 70, solved)],
  };
}
