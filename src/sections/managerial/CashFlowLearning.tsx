import { BookOpen, ArrowRight, Landmark, Factory, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import './ManagerialLearning.css';

const directRules = [
    ['Customers', 'Sales − Δaccounts receivable', 'A receivable increase is revenue not yet collected.'],
    ['Interest received', 'Interest revenue − Δinterest receivable', 'A receivable decrease adds to receipts.'],
    ['Suppliers (merchandiser)', 'COGS + Δinventory − Δtrade accounts payable', 'First find purchases = COGS + Δinventory; then convert to cash.'],
    ['Operating expenses', 'Operating expenses − noncash expenses + Δprepayments − Δaccrued operating liabilities', 'Remove depreciation; prepaid costs use cash before expense.'],
    ['Interest paid', 'Interest expense − Δinterest payable', 'A payable increase means part of the expense remains unpaid.'],
    ['Taxes paid', 'Tax expense − Δtax payable', 'Adjust separately for any deferred/noncash tax items given.'],
];

function StudyTable({ headers, rows, caption }: { headers: string[]; rows: ReactNode[][]; caption: string }) {
    return <div className="cf-table-wrap" tabIndex={0} role="region" aria-label={caption}>
        <table className="cf-table">
            <caption>{caption}</caption>
            <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0
                ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody>
        </table>
    </div>;
}

function StudySection({ number, title, children, source }: { number: string; title: string; children: ReactNode; source?: string }) {
    return <section className="cf-study-card">
        <h2><span className="cf-number">{number}</span>{title}</h2>
        {children}
        {source && <p className="cf-source">{source}</p>}
    </section>;
}

export function CashFlowLearning() {
    return <section className="cashflow-learning cf-education paper-grain">
        <div className="cf-learning-content">
            <header className="cf-study-header">
                <span className="cf-hero-icon"><BookOpen size={28} aria-hidden="true" /></span>
                <p className="cf-eyebrow">Managerial · Chapter 13</p>
                <h1>One statement.<br />Two operating methods.</h1>
                <p>Follow the cash, not just the profit. Learn the direct and indirect methods together, then prove they reach the same answer.</p>
            </header>

            <div className="cf-callout">
                <strong>The convention in your slides: FASB.</strong> Interest received, dividends received, interest paid and income taxes belong in operating activities. Dividends <em>paid</em> belong in financing. IFRS permits different classifications in some cases; do not mix those alternatives into this exercise.
            </div>

            <StudySection number="01" title="Sort the cash before calculating">
                <div className="cf-three-columns">
                    <div className="cf-mini-card"><h3>Operating · CFO</h3><p>The day-to-day earnings cycle.</p><p><span className="cf-plus">+ Collect from customers</span><br /><span className="cf-minus">− Pay suppliers & staff</span></p></div>
                    <div className="cf-mini-card"><h3>Investing · CFI</h3><p>Long-term assets and investments.</p><p><span className="cf-plus">+ Sell plant / collect loan principal</span><br /><span className="cf-minus">− Buy plant / make loans</span></p></div>
                    <div className="cf-mini-card"><h3>Financing · CFF</h3><p>Money from lenders and owners.</p><p><span className="cf-plus">+ Borrow / issue shares</span><br /><span className="cf-minus">− Repay principal / pay dividends</span></p></div>
                </div>
                <StudyTable caption="Classification under the Chapter 13 FASB convention" headers={['Cash transaction', 'Section', 'Watch out']} rows={[
                    ['Customer receipts; suppliers, wages, other operating payments', 'Operating', 'Use actual receipts/payments, not accrual revenue/expense.'],
                    ['Interest & dividends received; interest & income taxes paid', 'Operating', 'Interest on a loan is not the loan principal.'],
                    ['Plant or securities bought/sold; loans made/principal collected', 'Investing', 'Report the full cash sale proceeds, not the gain.'],
                    ['Borrowings, principal repayments, shares issued, dividends paid', 'Financing', 'Debt cash flows are not operating working capital.'],
                    ['Plant acquired by signing a note', 'Separate noncash disclosure', 'No cash moved: do not invent investing or financing cash.'],
                ]} />
                <div className="cf-callout cf-callout-neutral"><strong>What counts as cash?</strong> Cash plus cash equivalents: short-term, highly liquid investments maturing within 90 days of acquisition under the slide definition. Transfers between cash and cash equivalents are excluded: they do not change the total.</div>
                <div className="cf-method-map">
                    <div><strong>Direct</strong><span>Cash receipts − cash payments</span></div><span className="cf-map-equals">= same CFO =</span><div><strong>Indirect</strong><span>Net income → remove accrual effects</span></div>
                </div>
                <p><strong>Only operating changes.</strong> Investing, financing, the net cash change and closing cash are identical under both methods.</p>
            </StudySection>

            <StudySection number="02" title="Direct: convert each accrual line to cash" source="Chapter 13, slides 45–56; supplementary reconciliation: slide 76.">
                <div className="cf-formula"><strong>Δaccount = ending balance − beginning balance</strong><span>Use this same definition everywhere. A decrease is a negative Δ. AR = accounts receivable; AP = accounts payable; COGS = cost of goods sold.</span></div>
                <StudyTable caption="Direct operating formulas" headers={['Cash line', 'Formula', 'Why it works']} rows={directRules.map(([label, formula, why]) => [label, <span className="cf-mono">{formula}</span>, why])} />
                <div className="cf-callout"><strong>Payments are positive magnitudes first.</strong> Calculate suppliers, operating expenses, interest and taxes as positive amounts; then subtract them in the statement. Do not subtract a negative payment a second time.</div>
                <p>These formulas assume the stated account changes relate to the named operating line. Remove noncash or unrelated changes if the question gives them. The supplier shortcut above is for a <strong>merchandiser</strong>, not a complete manufacturing cash calculation.</p>
                <div className="cf-formula">CFO = customer receipts + other operating receipts − operating payments</div>
                <p><strong>Exam presentation:</strong> under the FASB rule presented in the deck, a direct statement also needs a supplementary reconciliation from net income to CFO.</p>
            </StudySection>

            <StudySection number="03" title="Indirect: rebuild cash from net income" source="Chapter 13, slides 32–35, 75 & 77.">
                <div className="cf-formula cf-formula-stack">
                    <span>CFO = net income</span>
                    <span className="cf-plus">+ noncash expenses + nonoperating losses</span>
                    <span className="cf-minus">− nonoperating gains − Δoperating noncash assets</span>
                    <span className="cf-plus">+ Δoperating liabilities</span>
                </div>
                <StudyTable caption="The operating working-capital sign grid" headers={['Operating account', 'Increase (Δ positive)', 'Decrease (Δ negative)']} rows={[
                    ['Noncash assets: receivables, inventory, prepayments', <span className="cf-minus">− DEDUCT</span>, <span className="cf-plus">+ ADD</span>],
                    ['Liabilities: trade payables, accrued operating expenses, interest/tax payable', <span className="cf-plus">+ ADD</span>, <span className="cf-minus">− DEDUCT</span>],
                ]} />
                <div className="cf-two-columns">
                    <div className="cf-mini-card"><h3>Why assets reverse</h3><p>More receivables = sales not collected. More inventory or prepayments = cash tied up. Deduct increases; add decreases.</p></div>
                    <div className="cf-mini-card"><h3>Why liabilities follow</h3><p>More operating payables = expenses not paid yet. Add increases; deduct decreases.</p></div>
                </div>
                <p className="cf-callout cf-warning"><strong>Not “all current accounts”.</strong> Exclude cash, loans, investments, financing debt and dividends payable from this operating grid. Interest and tax payable are included under the slide convention.</p>
                <StudyTable caption="Undo items that affected profit but are not operating cash" headers={['Item in net income', 'Operating adjustment', 'Other treatment']} rows={[
                    ['Depreciation / other noncash expense', <span className="cf-plus">+ Add back</span>, 'An expense reduced profit without a current cash payment.'],
                    ['Gain on plant or investment sale', <span className="cf-minus">− Deduct gain</span>, 'Put the full cash proceeds in investing.'],
                    ['Loss on plant or investment sale', <span className="cf-plus">+ Add loss</span>, 'Put the full cash proceeds in investing.'],
                ]} />
            </StudySection>

            <StudySection number="04" title="Allison: work both methods side by side" source="All amounts in $000. Chapter 13, slides 37–76.">
                <p>Try the formulas before opening the solution. These are the same source figures for both methods.</p>
                <div className="cf-two-columns">
                    <StudyTable caption="Allison income statement inputs" headers={['Accrual line', '$000']} rows={[
                        ['Sales', '900'], ['Dividends revenue / interest revenue', '3 / 6'], ['Plant sale gain', '31'], ['COGS', '500'], ['Operating expenses (include depreciation 40)', '300'], ['Interest expense / securities loss / tax expense', '35 / 4 / 36'], ['Net income', '65'],
                    ]} />
                    <StudyTable caption="Allison changes: ending minus beginning" headers={['Account', 'Δ ($000)']} rows={[
                        ['Accounts receivable / interest receivable', '+30 / −1'], ['Inventory / prepayments', '+10 / +3'], ['Trade accounts payable', '+15'], ['Other accrued operating expenses', '−6'], ['Interest payable / taxes payable', '+7 / −2'],
                    ]} />
                </div>
                <details className="cf-reveal">
                    <summary>Reveal the operating solutions</summary>
                    <div className="cf-two-columns">
                        <StudyTable caption="Direct method — positive payment magnitudes" headers={['Cash line', 'Calculation', 'Statement']} rows={[
                            ['Customers', '900 − 30', <span className="cf-plus">+870</span>],
                            ['Interest & dividends', '6 − (−1) + 3', <span className="cf-plus">+10</span>],
                            ['Suppliers', '500 + 10 − 15', <span className="cf-minus">−495</span>],
                            ['Operating expenses', '300 − 40 + 3 − (−6)', <span className="cf-minus">−269</span>],
                            ['Interest', '35 − 7', <span className="cf-minus">−28</span>],
                            ['Taxes', '36 − (−2)', <span className="cf-minus">−38</span>],
                            ['CFO', '880 − 830', <strong className="cf-plus">50</strong>],
                        ]} />
                        <StudyTable caption="Indirect method — adjustments to profit" headers={['Reconciliation', '$000']} rows={[
                            ['Net income', '65'], ['Add depreciation / securities loss', '+40 / +4'], ['Deduct plant sale gain', '−31'], ['AR / inventory / prepayment increases', '−30 / −10 / −3'], ['Interest receivable decrease', '+1'], ['Trade AP / interest payable increases', '+15 / +7'], ['Accrued expense / tax payable decreases', '−6 / −2'], ['CFO', <strong className="cf-plus">50</strong>],
                        ]} />
                    </div>
                    <div className="cf-total">65 + 40 + 4 − 31 − 30 − 10 − 3 + 1 + 15 + 7 − 6 − 2 = 50</div>
                    <p><CheckCircle2 size={18} aria-hidden="true" className="cf-inline-icon" /> Both operating methods produce <strong>CFO 50</strong>. The gain 31 is not a cash receipt; it has been removed from operating.</p>
                </details>
                <details className="cf-reveal">
                    <summary>Reveal investing, financing & the cash tie</summary>
                    <div className="cf-two-columns">
                        <StudyTable caption="Investing — keep gross inflows and outflows" headers={['Cash transaction', '$000']} rows={[
                            ['Purchase securities', '−65'], ['Sell securities (cost 44 − loss 4)', '+40'], ['Make loan / collect principal', '−17 / +12'], ['Purchase plant for cash', '−160'], ['Sell plant (book value 44 + gain 31)', '+75'], ['CFI', <strong className="cf-minus">−115</strong>],
                        ]} />
                        <StudyTable caption="Financing" headers={['Cash transaction', '$000']} rows={[
                            ['Borrow / repay principal', '+45 / −55'], ['Issue bonds / issue shares', '+100 / +50'], ['Pay dividends', '−40'], ['CFF', <strong className="cf-plus">+100</strong>],
                        ]} />
                    </div>
                    <div className="cf-cash-bridge"><span>Opening cash <strong>20</strong></span><ArrowRight aria-hidden="true" /><span>50 − 115 + 100 <strong>= +35</strong></span><ArrowRight aria-hidden="true" /><span>Closing cash <strong>55</strong></span></div>
                    <p className="cf-callout"><strong>Separate noncash disclosure:</strong> plant acquired 200 = cash 160 + note 40. Only 160 is an investing cash outflow; the note 40 is disclosed separately, not an imaginary borrowing receipt.</p>
                </details>
            </StudySection>

            <StudySection number="05" title="A fast second check: Auto Supply" source="All amounts in $000. Chapter 13, slides 78–81.">
                <p>Net income 250; depreciation 60; disposal gain 20; ΔAR +10; Δinventory −5; Δtrade AP +10; Δaccrued expenses −15. What is CFO?</p>
                <details className="cf-reveal"><summary>Check the indirect solution</summary>
                    <div className="cf-formula">250 + 60 − 20 − 10 + 5 + 10 − 15 = CFO 280</div>
                    <p>Investing: 35 − 30 = <strong>5</strong>. Financing: −140 − 150 = <strong>−290</strong>. Net cash change: 280 + 5 − 290 = <strong>−5</strong>; cash 50 → <strong>45</strong>. Disclose the noncash mortgage <strong>70</strong> separately.</p>
                    <p className="cf-warning"><strong>Indirect-only source example.</strong> Revenue and expense detail is insufficient for a full direct solution. Do not invent cash receipts or payments.</p>
                </details>
            </StudySection>

            <StudySection number="06" title="Exam routine & quick self-checks">
                <ol className="cf-checklist">
                    <li>Write Δ = end − beginning and label the reporting convention.</li>
                    <li>Classify cash into operating, investing and financing. Separate noncash items.</li>
                    <li>Build CFO using the requested method. Keep every payment sign consistent.</li>
                    <li>Use gross investing/financing cash flows, not only balance changes.</li>
                    <li>Prove: beginning cash + CFO + CFI + CFF = ending cash.</li>
                </ol>
                <div className="cf-two-columns">
                    <details className="cf-reveal"><summary>AR rises by 12. What happens?</summary><p>Direct: customers = sales <span className="cf-minus">−12</span>. Indirect: <span className="cf-minus">deduct 12</span> from net income. Revenue is ahead of collection.</p></details>
                    <details className="cf-reveal"><summary>Sell equipment: book 44, gain 31?</summary><p>Cash proceeds = 44 + 31 = <strong>75 investing inflow</strong>. Indirect operating: <span className="cf-minus">deduct gain 31</span>, not proceeds 75.</p></details>
                    <details className="cf-reveal"><summary>Declared dividends 42; Δpayable +2?</summary><p>Paid = 42 − 2 = <strong>40 financing outflow</strong>. Dividends payable is not an operating adjustment.</p></details>
                    <details className="cf-reveal"><summary>Buy plant using only a note of 40?</summary><p><strong>No cash-flow line.</strong> Disclose noncash investing/financing 40 separately.</p></details>
                </div>
            </StudySection>

            <StudySection number="16" title="Manufacturing cost flow ≠ cash flow" source="Chapter 16, slides 28 & 42–45. Conquest amounts in $000.">
                <p><Factory size={20} aria-hidden="true" className="cf-inline-icon" /> Chapter 16 follows <strong>costs through production</strong>; it is not a third cash-flow method.</p>
                <StudyTable caption="A compact manufacturing reference" headers={['Stage', 'Formula', 'Conquest']} rows={[
                    ['Direct materials (DM) used', 'Opening raw materials + purchases − closing raw materials', '25 + 145 − 20 = 150'],
                    ['Total manufacturing cost', 'DM + direct labor (DL) + manufacturing overhead (OH)', '150 + 300 + 360 = 810'],
                    ['Cost of goods manufactured (COGM)', 'Opening work in process + manufacturing cost − closing work in process', '30 + 810 − 40 = 800'],
                    ['Cost of goods sold (COGS)', 'Opening finished goods + COGM − closing finished goods', '150 + 800 − 168 = 782'],
                ]} />
                <p><strong>Prime cost</strong> = DM + DL. <strong>Conversion cost</strong> = DL + OH. <strong>Product costs</strong> (DM, DL, OH) enter inventory; <strong>period costs</strong> (selling/admin) are expensed in the period.</p>
                <div className="cf-callout cf-warning"><strong>Cost is not cash.</strong> Conquest direct labor cost is 300 but cash payroll is 292; net income is 70. COGM 800 is neither a cash payment nor CFO. For a manufacturer, analyze materials, payroll, overhead and their accrual/noncash adjustments separately; do not blindly apply the merchandiser supplier shortcut.</div>
            </StudySection>
            <footer className="cf-source"><Landmark size={16} aria-hidden="true" className="cf-inline-icon" /> Study guide based on the supplied Chapter 13 and Chapter 16 decks. Follow the convention and additional adjustments stated in your exam.</footer>
        </div>
    </section>;
}
