import { useState } from 'react';
import { useManagerialContext } from '@/hooks/ManagerialContext';
import { useNavigation } from '@/hooks/NavigationContext';
import { calculateCashFlow, roundCents } from '@/lib/cashFlow';
import { createManagerialExampleInput, managerialExamples } from '@/lib/managerialExamples';
import { generateId } from '@/types/accounting';
import { createBlankManagerialWorkbook, type CashFlowRow, type IndirectAdjustmentRow, type ManagerialWorkbook, type ManagerialWorkbookUpdates, type NoncashRow } from '@/types/managerial';
import { ManagerialSaveNotice } from './ManagerialSaveNotice';
import { ManagerialSelect } from './ManagerialSelect';
import './ManagerialPractice.css';

type RowKey = 'directOperating' | 'indirectAdjustments' | 'investing' | 'financing' | 'noncash';
type PracticeRow = CashFlowRow | IndirectAdjustmentRow | NoncashRow;
type Direction = CashFlowRow['direction'] | IndirectAdjustmentRow['direction'];
const format = (amount: number | null) => amount === null ? 'Missing' : amount.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const directionLabel = (direction: Direction) => ({ inflow: '+ Inflow / receipt', outflow: '− Outflow / payment', add: '+ Add to net income', deduct: '− Deduct from net income' })[direction];
const errorText = (reason: unknown, fallback: string) => reason instanceof Error ? reason.message : fallback;

function NumberField({ label, value, onChange, nonnegative = false }: { label: string; value: number | null; onChange: (value: number | null) => void; nonnegative?: boolean }) {
  const [error, setError] = useState('');
  return <label>{label}<input type="number" step="any" min={nonnegative ? 0 : undefined} value={value ?? ''} aria-invalid={!!error} placeholder="Missing" onChange={event => {
    const text = event.target.value;
    const amount = text === '' ? null : Number(text);
    if (amount !== null && (!Number.isFinite(amount) || (nonnegative && amount < 0))) { setError(nonnegative ? 'Use a nonnegative magnitude; choose the direction separately.' : 'Enter a finite number.'); return; }
    setError(''); onChange(amount);
  }} />{error && <span className="mp-field-error" role="alert">{error}</span>}</label>;
}

function RowEditor({ title, help, rows, kind, onTitle, onAmount, onDirection, onRemove, onAdd }: {
  title: string; help: string; rows: PracticeRow[]; kind: 'cash' | 'adjustment' | 'noncash';
  onTitle: (id: string, title: string) => void; onAmount: (id: string, amount: number | null) => void;
  onDirection: (id: string, direction: Direction) => void; onRemove: (id: string) => void; onAdd: () => void;
}) {
  const directions: Direction[] = kind === 'adjustment' ? ['add', 'deduct'] : ['inflow', 'outflow'];
  return <section className="mp-panel mp-row-editor"><h2>{title}</h2><p className="mp-help">{help}</p>
    <div className={`mp-entry-heading ${kind === 'noncash' ? 'mp-noncash-grid' : ''}`} aria-hidden="true"><span>Account / line title</span>{kind !== 'noncash' && <span>Explicit direction</span>}<span>Magnitude</span><span>Action</span></div>
    {rows.length === 0 && <p className="mp-empty">No rows — this section totals 0. Add a row if the assignment includes an item; a blank amount is missing, not zero.</p>}
    {rows.map((row, index) => <div className={`mp-entry-row ${kind === 'noncash' ? 'mp-noncash-grid' : ''}`} key={row.id}>
      <label>Line title<input aria-label={`${title} line ${index + 1} title`} value={row.title} onChange={event => onTitle(row.id, event.target.value)} /></label>
      {kind !== 'noncash' && 'direction' in row && <ManagerialSelect label="Direction" accessibleLabel={`${title}: ${row.title || `line ${index + 1}`} direction`} value={row.direction} onChange={direction => onDirection(row.id, direction)} options={directions.map(direction => ({ value: direction, label: directionLabel(direction) }))} />}
      <NumberField label={`${row.title || `Line ${index + 1}`} amount`} value={row.amount} nonnegative onChange={amount => onAmount(row.id, amount)} />
      <button type="button" className="mp-remove" aria-label={`Remove ${row.title || `line ${index + 1}`} from ${title}`} onClick={() => onRemove(row.id)}>Remove</button>
    </div>)}
    <button type="button" className="mp-add-row" onClick={onAdd}>+ Add {kind === 'noncash' ? 'noncash disclosure' : kind === 'adjustment' ? 'adjustment' : 'cash-flow line'} to {title.toLowerCase()}</button>
  </section>;
}

function StatementRows({ title, rows, total }: { title: string; rows: PracticeRow[]; total?: number | null }) {
  return <table className="mp-statement-table"><caption>{title}</caption><thead><tr><th scope="col">Line / direction</th><th scope="col">Amount</th></tr></thead><tbody>
    {rows.length ? rows.map(row => <tr key={row.id}><td>{row.title || 'Untitled line'}{'direction' in row && <small>{directionLabel(row.direction)}</small>}</td><td>{row.amount === null ? 'Missing' : `${'direction' in row && (row.direction === 'outflow' || row.direction === 'deduct') ? '−' : '+'}${format(row.amount)}`}</td></tr>) : <tr><td>No rows</td><td>0</td></tr>}
    {total !== undefined && <tr className="mp-total"><th scope="row">{title} subtotal</th><td>{format(total)}</td></tr>}
  </tbody></table>;
}

function DirectHelpers() {
  const [beginning, setBeginning] = useState<number | null>(null);
  const [ending, setEnding] = useState<number | null>(null);
  const delta = beginning !== null && ending !== null ? roundCents(ending - beginning) : null;
  return <details className="mp-panel mp-formula"><summary>Direct-method formula helper — separate scratchpad</summary>
    <p>Δ = ending − beginning. These calculations never fill workbook rows; choose the title, magnitude and direction yourself.</p>
    <div className="mp-meta-grid"><NumberField label="Scratchpad beginning balance" value={beginning} onChange={setBeginning} /><NumberField label="Scratchpad ending balance" value={ending} onChange={setEnding} /><p className="mp-scratch-result">Δ = <strong>{format(delta)}</strong></p></div>
    <dl className="mp-formula-list"><dt>Customers</dt><dd>Sales − Δ accounts receivable</dd><dt>Suppliers — merchandiser only</dt><dd>COGS + Δ inventory − Δ accounts payable</dd><dt>Operating expenses paid</dt><dd>Expense − noncash expense + Δ prepayments − Δ accrued expenses</dd><dt>Interest / taxes paid</dt><dd>Expense − Δ related payable</dd><dt>Interest / dividends received</dt><dd>Revenue − Δ related receivable</dd></dl>
    <p className="mp-help">Operating account changes must relate to the named line. Separate noncash changes; for manufacturing, analyze materials, payroll and overhead — not COGM as cash.</p>
  </details>;
}

export function CashFlowWorkbook() {
  const { route, navigate } = useNavigation();
  const { currentWorkbook: workbook, loading, loadSucceeded, loadError, updateWorkbook, createWorkbook } = useManagerialContext();
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const method = route.view === 'cashflow-indirect' ? 'indirect' : 'direct';
  if (!workbook) return <section className="managerial-practice"><h1>{loading ? 'Loading workbook…' : loadSucceeded ? 'Workbook not found' : 'Workbook not available on this device'}</h1><p>{loadError ? loadError.message : 'Return to the studio to select a workbook or create a local practice draft.'}</p><ManagerialSaveNotice /><button type="button" onClick={() => navigate('managerial-dashboard')}>Back to cash-flow studio</button></section>;
  const source = workbook.sourceExample ? managerialExamples[workbook.sourceExample] : null;
  const directUnavailable = source?.directAvailable === false;
  const result = calculateCashFlow(workbook);
  const cfo = method === 'direct' ? (directUnavailable ? null : result.CFOdirect) : result.CFOindirect;
  const reconciliation = method === 'direct' && directUnavailable ? { netChange: null, expectedClosingCash: null, difference: null, actualChange: result.direct.actualChange, reconciled: null } : result[method];
  const units = source ? source.units : 'Custom assignment — use one consistent currency unit';
  function update(patch: ManagerialWorkbookUpdates | ((current: ManagerialWorkbook) => ManagerialWorkbookUpdates)) {
    try { updateWorkbook(workbook!.id, patch); setError(''); } catch (reason) { setError(errorText(reason, 'Could not update this workbook. Keep the page open and try again.')); }
  }
  function patchRow(key: RowKey, id: string, patch: { title?: string; amount?: number | null; direction?: Direction }) {
    update(current => {
      if (key === 'noncash') return { noncash: current.noncash.map(row => row.id === id ? { ...row, ...(patch.title !== undefined ? { title: patch.title } : {}), ...(patch.amount !== undefined ? { amount: patch.amount } : {}) } : row) };
      if (key === 'indirectAdjustments') return { indirectAdjustments: current.indirectAdjustments.map(row => row.id === id ? { ...row, ...patch, direction: patch.direction === 'add' || patch.direction === 'deduct' ? patch.direction : row.direction } : row) };
      return { [key]: current[key].map(row => row.id === id ? { ...row, ...patch, direction: patch.direction === 'inflow' || patch.direction === 'outflow' ? patch.direction : row.direction } : row) };
    });
  }
  function addRow(key: RowKey) {
    try {
      const row = { id: generateId(), title: '', amount: null };
      update(current => key === 'noncash' ? { noncash: [...current.noncash, row] } : key === 'indirectAdjustments' ? { indirectAdjustments: [...current.indirectAdjustments, { ...row, direction: 'add' }] } : { [key]: [...current[key], { ...row, direction: 'inflow' }] });
    } catch (reason) { setError(errorText(reason, 'Could not add a line. Please try again.')); }
  }
  function editor(key: RowKey, title: string, help: string) {
    return <RowEditor key={key} title={title} help={help} rows={workbook![key]} kind={key === 'noncash' ? 'noncash' : key === 'indirectAdjustments' ? 'adjustment' : 'cash'}
      onTitle={(id, title) => patchRow(key, id, { title })} onAmount={(id, amount) => patchRow(key, id, { amount })} onDirection={(id, direction) => patchRow(key, id, { direction })}
      onRemove={id => update(current => ({ [key]: current[key].filter(row => row.id !== id) }))} onAdd={() => addRow(key)} />;
  }
  function solvedCopy() {
    if (!workbook!.sourceExample) return;
    try {
      const id = createWorkbook(`${source!.name} — solved copy`, createManagerialExampleInput(workbook!.sourceExample, true));
      navigate(directUnavailable ? 'cashflow-indirect' : 'cashflow-direct', { workbookId: id });
      setChecked(false); setRevealed(false);
    } catch (reason) { setError(errorText(reason, 'Could not create a solved copy. Your practice input is unchanged.')); }
  }
  const checkItems: [string, number | null, number][] = source ? [['Operating CFO', cfo, source.expected.operating], ['Investing CFI', result.investing.total, source.expected.investing], ['Financing CFF', result.financing.total, source.expected.financing], ['Net cash change', reconciliation.netChange, source.expected.netChange], ['Expected closing cash', reconciliation.expectedClosingCash, source.expected.closingCash]] : [];
  const solved = revealed && workbook.sourceExample ? createBlankManagerialWorkbook('Worked solution', createManagerialExampleInput(workbook.sourceExample, true)) : null;
  return <section className="managerial-practice mp-workbook">
    <div className="mp-edit-only">
      <header className="mp-page-header"><button type="button" onClick={() => navigate('managerial-dashboard')}>← Cash-flow studio</button><p className="mp-eyebrow">Manual practice · {method} method</p><h1>{workbook.name}</h1><p>{units}{workbook.exampleMode === 'reveal' ? ' · Solved copy' : ''}</p></header>
      <ManagerialSaveNotice workbookId={workbook.id} />
      <div className="mp-method-tabs" aria-label="Cash-flow method"><button type="button" aria-pressed={method === 'direct'} onClick={() => navigate('cashflow-direct', { workbookId: workbook.id })}>Direct · receipts & payments</button><button type="button" aria-pressed={method === 'indirect'} onClick={() => navigate('cashflow-indirect', { workbookId: workbook.id })}>Indirect · reconcile net income</button></div>
      <div className="mp-legend"><strong>You control classification.</strong><span>+ Inflow = cash received / + Add = increase CFO</span><span>− Outflow = cash paid / − Deduct = decrease CFO</span><span>Enter positive magnitudes only. Blank means missing; 0 means known zero. Empty sections total 0.</span></div>
      {directUnavailable && <p className="mp-notice" role="status">Auto Supply is indirect-only. The source has no direct revenue/expense data, so a direct statement and method comparison are unavailable. Do not infer missing receipts or payments from net income.</p>}
      {error && <p className="mp-alert" role="alert">{error}</p>}
      {source && <details className="mp-panel mp-source" open><summary>Assignment source data — {source.name} · $000</summary><p className="mp-help">{source.citation}. Amounts below are given source data, not auto-filled row answers.</p>
        {source.groups.map(group => <table className="mp-source-table" key={group.title}><caption>{group.title}</caption><thead><tr>{group.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{group.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>)}
        <ul>{source.assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}</ul>
      </details>}
      <section className="mp-panel"><h2>Assignment heading & given balances</h2><div className="mp-meta-grid">
        <label className="mp-wide">Workbook title<input value={workbook.name} onChange={event => update({ name: event.target.value })} onBlur={event => { if (!event.target.value.trim()) update({ name: 'Untitled cash-flow workbook' }); }} /></label>
        <label className="mp-wide">Description<input value={workbook.description ?? ''} onChange={event => update({ description: event.target.value })} /></label>
        <label className="mp-wide">Statement period<input value={workbook.periodLabel} placeholder="Year ended 31 December…" onChange={event => update({ periodLabel: event.target.value })} /></label>
        <NumberField label={`Opening cash${source ? ' ($000; given)' : ''}`} value={workbook.openingCash} onChange={openingCash => update({ openingCash })} />
        <NumberField label={`Entered closing cash${source ? ' ($000; given)' : ''}`} value={workbook.closingCash} onChange={closingCash => update({ closingCash })} />
        <NumberField label={`Net income / loss${source ? ' ($000; given)' : ''}`} value={workbook.netIncome} onChange={netIncome => update({ netIncome })} />
      </div><p className="mp-help">Net loss may be negative. Opening and closing cash are separate given balances; closing cash is never auto-filled.</p></section>
      {method === 'direct' ? <><DirectHelpers />{directUnavailable ? <p className="mp-help">Switch to indirect to practice this source. The missing direct-data placeholder is preserved.</p> : editor('directOperating', 'Operating · direct', 'Record gross cash receipts and payments. Under the professor’s FASB convention, interest/dividends received, interest paid and taxes paid are operating.')}</> : <><div className="mp-sign-helper"><strong>CFO = net income + additions − deductions</strong><p>Add depreciation/losses and decreases in operating current assets or increases in operating current liabilities. Deduct gains and increases in operating current assets or decreases in operating current liabilities. These are guides, never automatic title rules.</p><p>Exclude cash/equivalents, financing debt, dividends payable, and investment/loan principal from operating working-capital adjustments. Interest and tax payables remain operating under the professor’s FASB convention.</p></div>{editor('indirectAdjustments', 'Operating · indirect adjustments', 'Start from net income above. Enter each noncash, gain/loss or working-capital adjustment as a positive magnitude with an explicit Add or Deduct direction.')}</>}
      {editor('investing', 'Investing', 'Asset purchases/sales, securities and loan principal. Use cash proceeds, not gains or book values. Shared by both methods.')}
      {editor('financing', 'Financing', 'Borrowing, debt principal repayments, share issues and dividends paid. Shared by both methods.')}
      {editor('noncash', 'Noncash disclosures', 'Describe noncash investing/financing transactions separately. These amounts never enter CFO, CFI, CFF or net cash change.')}
      <section className="mp-panel"><label>Assignment notes<textarea value={workbook.notes} rows={3} onChange={event => update({ notes: event.target.value })} /></label></section>
    </div>
    <section className="mp-panel mp-preview" aria-label="Statement preview">
      <div className="mp-section-heading"><h2>Statement of cash flows</h2><button type="button" className="mp-edit-only" onClick={() => { try { window.print(); } catch (reason) { setError(errorText(reason, 'Printing could not start. Use your browser’s Print command.')); } }}>Print statement</button></div>
      <h3>{workbook.name}</h3><p>{workbook.periodLabel || 'Period not entered'} · {method} method</p><p className="mp-help">{units}{source ? ` · ${source.citation}` : ''}</p>
      {method === 'direct' ? directUnavailable ? <p>Direct operating cash flow unavailable — missing source data.</p> : <StatementRows title="Operating activities — direct" rows={workbook.directOperating} total={result.CFOdirect} /> : <><div className="mp-ni-line"><span>Net income / loss</span><strong>{format(workbook.netIncome)}</strong></div><StatementRows title="Operating adjustments — indirect" rows={workbook.indirectAdjustments} total={result.indirectAdjustments.total} /></>}
      <StatementRows title="Investing activities" rows={workbook.investing} total={result.investing.total} />
      <StatementRows title="Financing activities" rows={workbook.financing} total={result.financing.total} />
      <table className="mp-statement-table mp-reconciliation"><caption>Cash reconciliation</caption><tbody>{([['Net operating cash flow · CFO', cfo], ['Net investing cash flow · CFI', result.investing.total], ['Net financing cash flow · CFF', result.financing.total], ['Net change · CFO + CFI + CFF', reconciliation.netChange], ['Opening cash', workbook.openingCash], ['Expected closing · opening + net change', reconciliation.expectedClosingCash], ['Entered closing cash', workbook.closingCash], ['Actual cash change · closing − opening', reconciliation.actualChange], ['Difference · entered − expected closing', reconciliation.difference]] as [string, number | null][]).map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{format(value)}</td></tr>)}</tbody></table>
      <p className="mp-reconcile-result" role="status">{reconciliation.reconciled === null ? 'Incomplete — enter every row amount and both cash balances to check the tie.' : reconciliation.reconciled ? 'Cash reconciles: difference is 0.' : `Cash does not reconcile: difference is ${format(reconciliation.difference)}.`}</p>
      <StatementRows title="Noncash investing & financing disclosures — excluded from cash totals" rows={workbook.noncash} />
      <div className="mp-comparison"><strong>Direct vs indirect operating cash flow</strong><p>{directUnavailable ? 'Comparison unavailable: Auto Supply source supports indirect only.' : result.methodsAgree === null ? 'Comparison waits until both operating methods are complete (including net income). Empty sections count as zero; blank row amounts do not.' : `Direct ${format(result.CFOdirect)} · Indirect ${format(result.CFOindirect)} · Difference ${format(result.comparisonDifference)} — ${result.methodsAgree ? 'methods agree' : 'methods do not agree'}.`}</p></div>
      <div className="mp-supplement"><h3>{method === 'direct' ? 'Required supplementary indirect reconciliation' : 'Optional comparison: direct operating statement'}</h3>{method === 'direct' ? <><p>Net income / loss: {format(workbook.netIncome)}</p><StatementRows title="Indirect adjustments" rows={workbook.indirectAdjustments} /><p>Indirect CFO: {format(result.CFOindirect)}</p></> : directUnavailable ? <p>Direct source data unavailable.</p> : <StatementRows title="Direct operating cash flows" rows={workbook.directOperating} total={result.CFOdirect} />}</div>
      {workbook.notes && <div className="mp-preview-notes"><strong>Notes</strong><p>{workbook.notes}</p></div>}
    </section>
    {source && <section className="mp-panel mp-edit-only"><h2>Check your practice</h2><p className="mp-help">Checking compares totals. A correct total does not verify every line or classification. Revealing never changes your input.</p><div className="mp-actions"><button type="button" onClick={() => setChecked(value => !value)}>{checked ? 'Hide answer check' : 'Check answers'}</button><button type="button" onClick={() => setRevealed(value => !value)}>{revealed ? 'Hide worked solution' : 'Reveal worked solution'}</button></div>
      {checked && <div className="mp-check" role="status">{checkItems.map(([title, actual, expected]) => <p key={title}><strong>{title}:</strong> {actual === null ? 'Incomplete / unavailable — no answer checked' : roundCents(actual - expected) === 0 ? `Matches expected (${format(expected)})` : `Your ${format(actual)}; expected ${format(expected)} — review the lines and signs`}</p>)}</div>}
      {revealed && solved && <div className="mp-worked-solution"><h3>Expected solution — separate from student input</h3><p>{source.citation} · All amounts $000</p><ol>{source.workings.map(working => <li key={working}>{working}</li>)}</ol>{source.directAvailable && <StatementRows title="Solved direct operating activities" rows={solved.directOperating} total={source.expected.operating} />}<p>Given net income: {format(solved.netIncome)}</p><StatementRows title="Solved indirect adjustments" rows={solved.indirectAdjustments} /><StatementRows title="Solved investing activities" rows={solved.investing} total={source.expected.investing} /><StatementRows title="Solved financing activities" rows={solved.financing} total={source.expected.financing} /><StatementRows title="Solved noncash disclosures" rows={solved.noncash} /><button type="button" onClick={solvedCopy}>Create a separate solved copy</button><p className="mp-help">Creates a new workbook with solution amounts. This practice workbook is not overwritten.</p></div>}
    </section>}
  </section>;
}
