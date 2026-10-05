import { Printer, FileText, Factory } from 'lucide-react';
import './ManagerialLearning.css';

export function CashFlowCheatSheet() {
    return <section className="cashflow-cheatsheet cf-education">
        <header className="cf-sheet-toolbar cf-no-print">
            <div><p className="cf-eyebrow">Managerial · Exam reference</p><h1>Cash-flow cheat sheet</h1><p>Two A4 pages. Print at 100% scale; disable browser headers and footers.</p></div>
            <button type="button" className="cf-print-button" onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> Print / save PDF</button>
        </header>

        <article className="cf-cheat-page cf-cheat-page-one" aria-label="Cheat sheet page 1: classification and direct method">
            <header className="cf-sheet-heading"><div><p className="cf-eyebrow">Classic Ledger · Managerial</p><h2><FileText size={24} aria-hidden="true" /> Cash flow: direct method</h2></div><span className="cf-page-label">01 / 02</span></header>
            <div className="cf-sheet-banner"><strong>Δ = end − beginning.</strong> CFO = operating · CFI = investing · CFF = financing.<br /><strong>Only CFO presentation changes between methods.</strong> CFI, CFF and closing cash stay the same.</div>

            <div className="cf-sheet-block">
                <h3>1 · Classify first — the slides use FASB</h3>
                <table className="cf-table"><thead><tr><th scope="col">Section</th><th scope="col">+ Cash in</th><th scope="col">− Cash out</th></tr></thead><tbody>
                    <tr><th scope="row">Operating</th><td>Customers; interest & dividends received</td><td>Suppliers; wages & other operating costs; interest & income taxes paid</td></tr>
                    <tr><th scope="row">Investing</th><td>Plant / securities sold; loan principal collected</td><td>Plant / securities purchased; loans made</td></tr>
                    <tr><th scope="row">Financing</th><td>Borrowing principal; bonds / shares issued</td><td>Debt principal repaid; dividends paid</td></tr>
                    <tr><th scope="row">Noncash</th><td colSpan={2}>Asset acquired through a note / mortgage → disclose separately; no cash-flow entry.</td></tr>
                </tbody></table>
                <p><strong>Interest ≠ principal.</strong> Dividends received = operating; dividends paid = financing. IFRS alternatives exist: do not silently substitute them for this FASB slide convention.</p>
                <p><strong>Cash equivalents:</strong> short-term, highly liquid investments maturing within 90 days of acquisition (slide definition). Transfers within cash / equivalents are excluded.</p>
            </div>

            <div className="cf-sheet-block">
                <h3>2 · Direct operating formulas</h3>
                <p className="cf-sheet-small">COGS = cost of goods sold; AR = accounts receivable; AP = accounts payable.</p>
                <table className="cf-table cf-formula-table"><thead><tr><th scope="col">Cash line</th><th scope="col">Convert accrual → cash</th></tr></thead><tbody>
                    <tr><th scope="row" className="cf-plus">+ Customers</th><td>Sales − Δaccounts receivable (AR)</td></tr>
                    <tr><th scope="row" className="cf-plus">+ Interest received</th><td>Interest revenue − Δinterest receivable</td></tr>
                    <tr><th scope="row" className="cf-minus">− Suppliers¹</th><td>COGS + Δinventory − Δtrade accounts payable (AP)<br /><span className="cf-sheet-small">Purchases = COGS + Δinventory</span></td></tr>
                    <tr><th scope="row" className="cf-minus">− Operating costs</th><td>Operating expenses − noncash expenses<br />+ Δprepayments − Δaccrued operating liabilities</td></tr>
                    <tr><th scope="row" className="cf-minus">− Interest paid</th><td>Interest expense − Δinterest payable</td></tr>
                    <tr><th scope="row" className="cf-minus">− Taxes paid²</th><td>Tax expense − Δtax payable</td></tr>
                </tbody></table>
                <div className="cf-sheet-note"><strong>Payment rule:</strong> formulas give positive payment magnitudes; subtract them once in CFO. A negative Δ stays negative inside the formula: 36 − (−2) = 38 paid.</div>
                <p className="cf-sheet-small">¹ Merchandiser shortcut, not a complete manufacturing cash formula. ² Remove deferred / noncash tax adjustments if given. All formulas assume account changes relate to that line; separate noncash/unrelated changes.</p>
                <div className="cf-total">CFO = operating receipts − operating payments</div>
                <p><strong>Presentation:</strong> the deck’s FASB direct method requires a supplementary net-income-to-CFO reconciliation (slide 76).</p>
            </div>

            <div className="cf-sheet-block">
                <h3>3 · Allison direct example <span className="cf-sheet-small">(all $000)</span></h3>
                <table className="cf-table"><thead><tr><th scope="col">Line</th><th scope="col">Calculation</th><th scope="col">Cash</th></tr></thead><tbody>
                    <tr><th scope="row">Customers</th><td className="cf-mono">900 − 30</td><td className="cf-plus">+870</td></tr>
                    <tr><th scope="row">Interest & dividends</th><td className="cf-mono">6 − (−1) + 3</td><td className="cf-plus">+10</td></tr>
                    <tr><th scope="row">Suppliers</th><td className="cf-mono">500 + 10 − 15</td><td className="cf-minus">−495</td></tr>
                    <tr><th scope="row">Operating costs</th><td className="cf-mono">300 − 40 + 3 − (−6)</td><td className="cf-minus">−269</td></tr>
                    <tr><th scope="row">Interest / taxes</th><td className="cf-mono">35 − 7 / 36 − (−2)</td><td className="cf-minus">−28 / −38</td></tr>
                    <tr className="cf-table-total"><th scope="row">CFO</th><td className="cf-mono">880 − 830</td><td className="cf-plus">50</td></tr>
                </tbody></table>
                <p><strong>Why signs work:</strong> AR rises → collections below sales. AP rises → cash payments below purchases. Prepayments rise → cash paid above expense.</p>
            </div>
            <footer className="cf-sheet-footer">Chapter 13: direct slides 45–56; Allison 37–76; supplementary reconciliation 76. <span>Page 1 of 2</span></footer>
        </article>

        <article className="cf-cheat-page cf-cheat-page-two" aria-label="Cheat sheet page 2: indirect method and final checks">
            <header className="cf-sheet-heading"><div><p className="cf-eyebrow">Classic Ledger · Managerial</p><h2>Indirect method & final checks</h2></div><span className="cf-page-label">02 / 02</span></header>
            <div className="cf-sheet-block">
                <h3>4 · Indirect: start with net income (NI), undo accruals</h3>
                <div className="cf-sheet-banner cf-mono">CFO = NI + noncash expenses + nonoperating losses<br />− nonoperating gains − Δoperating noncash assets<br />+ Δoperating liabilities</div>
                <table className="cf-table"><thead><tr><th scope="col">Operating account</th><th scope="col">Increase</th><th scope="col">Decrease</th></tr></thead><tbody>
                    <tr><th scope="row">Noncash assets: AR, interest receivable, inventory, prepayments</th><td className="cf-minus">− DEDUCT</td><td className="cf-plus">+ ADD</td></tr>
                    <tr><th scope="row">Liabilities: trade AP, accrued operating expenses, interest / tax payable</th><td className="cf-plus">+ ADD</td><td className="cf-minus">− DEDUCT</td></tr>
                </tbody></table>
                <p><strong>Exclude from this grid:</strong> cash, loans, investments, financing debt, dividends payable. Do not adjust every current account.</p>
                <div className="cf-sheet-note"><strong>Depreciation:</strong> <span className="cf-plus">+ add back</span>. Disposal <strong>gain:</strong> <span className="cf-minus">− deduct</span>; disposal <strong>loss:</strong> <span className="cf-plus">+ add</span>. Full cash proceeds go in investing, never just the gain/loss.</div>
            </div>

            <div className="cf-sheet-block">
                <h3>5 · Allison: same CFO, same closing cash <span className="cf-sheet-small">($000)</span></h3>
                <p className="cf-mono">NI 65 + depreciation 40 + securities loss 4 − plant gain 31<br />− AR 30 − inventory 10 − prepayments 3 + interest receivable decrease 1<br />+ AP 15 + interest payable 7 − accrued expenses 6 − tax payable 2 <strong>= CFO 50</strong></p>
                <table className="cf-table"><tbody>
                    <tr><th scope="row">CFI</th><td>Securities −65 +40; loans −17 +12; plant −160 +75</td><td className="cf-minus">−115</td></tr>
                    <tr><th scope="row">CFF</th><td>Borrow +45; repay −55; bonds +100; shares +50; dividends −40</td><td className="cf-plus">+100</td></tr>
                    <tr className="cf-table-total"><th scope="row">Cash tie</th><td className="cf-mono">20 + 50 − 115 + 100 = 55</td><td className="cf-plus">Δ +35</td></tr>
                </tbody></table>
                <p><strong>Proceeds:</strong> plant book 44 + gain 31 = 75; securities cost 44 − loss 4 = 40. <strong>Noncash:</strong> plant purchase 200 = cash 160 + note 40; disclose 40 separately.</p>
            </div>

            <div className="cf-sheet-block">
                <h3>6 · Disposal, financing & the exam tie</h3>
                <div className="cf-two-columns">
                    <div className="cf-sheet-note cf-mono">Book value = cost − accumulated depreciation<br />Sale proceeds = book value + gain − loss<br />Dividends paid = declared − Δdividends payable</div>
                    <div className="cf-sheet-note"><strong>Do not net gross flows:</strong> show purchases and sales, borrowings and repayments separately. Balance changes alone may include noncash changes.</div>
                </div>
                <div className="cf-total">Δcash = CFO + CFI + CFF<br />Closing cash = opening cash + Δcash</div>
                <p><strong>Auto Supply (indirect-only, $000):</strong> 250 +60 −20 −10 +5 +10 −15 = CFO <strong>280</strong>; CFI 35 −30 = <strong>5</strong>; CFF −140 −150 = <strong>−290</strong>; cash 50 → <strong>45</strong>. Noncash mortgage 70 disclosed separately. Not enough source data for a full direct solution.</p>
            </div>

            <div className="cf-sheet-block cf-manufacturing-box">
                <h3><Factory size={12} aria-hidden="true" className="cf-sheet-icon" />Chapter 16 · Manufacturing costs are not cash payments</h3>
                <table className="cf-table"><tbody>
                    <tr><th scope="row">Direct materials (DM) used</th><td>Opening raw materials + purchases − closing raw materials</td></tr>
                    <tr><th scope="row">Manufacturing cost</th><td>DM + direct labor (DL) + overhead (OH)</td></tr>
                    <tr><th scope="row">Cost of goods manufactured (COGM)</th><td>Opening work in process + mfg cost − closing work in process</td></tr>
                    <tr><th scope="row">COGS</th><td>Opening finished goods + COGM − closing finished goods</td></tr>
                </tbody></table>
                <p><strong>Prime</strong> = DM + DL; <strong>conversion</strong> = DL + OH. <strong>Product</strong> costs: DM/DL/OH → inventory; <strong>period</strong> costs: selling/admin → expense.</p>
                <p><strong>Conquest ($000):</strong> DM 25 +145 −20 =150; mfg 150 +300 +360 =810; COGM 30 +810 −40 =800; COGS 150 +800 −168 =782. Labor cost 300 ≠ cash payroll 292. <strong>Do not treat COGM as cash or use the merchandiser shortcut blindly.</strong></p>
            </div>
            <footer className="cf-sheet-footer">Ch13: indirect 32–35, 75, 77; dividends 68; noncash 62; Auto Supply 78–81. Ch16: 28, 42–45. <span>Page 2 of 2</span></footer>
        </article>
    </section>;
}
