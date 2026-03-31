import type { QuoteResult, PreparedFor, LoanOfficerInfo } from '../../types';
import { displayOrBlank, displayRate } from '../../utils/displayOrBlank';

interface Props {
  results: QuoteResult[];
  preparedFor: PreparedFor;
  loanOfficer: LoanOfficerInfo;
  onLoanOfficerChange: (field: keyof LoanOfficerInfo, value: string) => void;
}

function Val({ v, fmt = 'currency' }: { v: number | string; fmt?: 'currency' | 'percent' | 'ratio' | 'text' }) {
  const display = fmt === 'text' ? (v || '') : displayOrBlank(v as number, fmt);
  return <span className="text-sm">{display}</span>;
}

function StarVal({ v, fmt = 'currency', negative }: { v: number | string; fmt?: 'currency' | 'percent' | 'ratio' | 'text'; negative?: boolean }) {
  const display = fmt === 'text' ? (v || '') : displayOrBlank(v as number, fmt);
  return <span className={`text-sm font-semibold ${negative && typeof v === 'number' && v < 0 ? 'text-red-600' : 'text-monarch-navy'}`}>{display}</span>;
}

export default function QuoteBuilderPage({ results, preparedFor, loanOfficer, onLoanOfficerChange }: Props) {
  const count = results.length;
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  const anyConventional = results.some(r => r.isConventional);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-monarch-navy tracking-tight">QUOTE BUILDER</h1>
          <p className="text-sm text-monarch-muted mt-1">Payment Estimator &nbsp;|&nbsp; For Informational Purposes Only</p>
        </div>
        <div className="bg-white border border-monarch-border rounded-lg p-4 w-64">
          <p className="text-xs font-semibold text-monarch-navy uppercase tracking-wider mb-2">Prepared For</p>
          <p className="text-sm">{preparedFor.name || '—'}</p>
          <p className="text-sm text-monarch-muted">{preparedFor.email}</p>
          <p className="text-sm text-monarch-muted">{preparedFor.phone}</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
        {/* Column Headers */}
        <div className="bg-monarch-navy text-white" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
          <div className="px-4 py-2"></div>
          {results.map((_, i) => (
            <div key={i} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-center">Scenario {i + 1}</div>
          ))}
        </div>

        {/* Scenario Details */}
        <Section label="SCENARIO DETAILS" count={count} />
        <Row label="Property Address" count={count}>{results.map((r, i) => <Val key={i} v={r.propertyAddress} fmt="text" />)}</Row>
        <Row label="Loan Program" count={count}>{results.map((r, i) => <Val key={i} v={r.loanProgram} fmt="text" />)}</Row>
        <Row label="Credit Score" count={count}>{results.map((r, i) => <Val key={i} v={r.creditScore} fmt="text" />)}</Row>
        <Row label="Property Type" count={count}>{results.map((r, i) => <Val key={i} v={r.propertyType} fmt="text" />)}</Row>
        <Row label="Occupancy" count={count}>{results.map((r, i) => <Val key={i} v={r.occupancy} fmt="text" />)}</Row>
        <Row label="Down Payment / LTV" count={count}>{results.map((r, i) => <Val key={i} v={r.downPaymentOrLtv} fmt="text" />)}</Row>
        <Row label="Transaction Type" count={count}>{results.map((r, i) => <Val key={i} v={r.transactionType} fmt="text" />)}</Row>

        {/* Loan Details */}
        <Section label="LOAN DETAILS" count={count} />
        <Row label="Purchase Price / Current Value" count={count}>{results.map((r, i) => <Val key={i} v={r.priceOrValue} />)}</Row>
        <Row label="Down Payment / Payoff" count={count}>{results.map((r, i) => <Val key={i} v={r.downPaymentOrPayoff} />)}</Row>
        <Row label="Base Loan Amount" count={count}>{results.map((r, i) => <Val key={i} v={r.baseLoanAmount} />)}</Row>
        <Row label="Loan-to-Value (LTV)" count={count}>{results.map((r, i) => <Val key={i} v={r.ltv} fmt="percent" />)}</Row>
        {anyConventional && (
          <Row label="Loan w/ UFMIP" count={count}>{results.map((r, i) => <Val key={i} v={r.isConventional ? r.loanWithUfmip : 0} />)}</Row>
        )}

        {/* Payment Breakdown */}
        <Section label="PAYMENT BREAKDOWN" count={count} />
        <Row label="Best Rate" count={count}>{results.map((r, i) => <span key={i} className="text-sm">{displayRate(r.bestRate)}</span>)}</Row>
        <Row label="Payment Type" count={count}>{results.map((r, i) => <Val key={i} v={r.paymentType} fmt="text" />)}</Row>
        <Row label="Principal & Interest / IO" count={count}>{results.map((r, i) => <Val key={i} v={r.principalAndInterest} />)}</Row>
        <Row label="Insurance (Monthly)" count={count}>{results.map((r, i) => <Val key={i} v={r.insuranceMonthly} />)}</Row>
        <Row label="Taxes (Monthly)" count={count}>{results.map((r, i) => <Val key={i} v={r.taxesMonthly} />)}</Row>
        {anyConventional && (
          <Row label="Mortgage Insurance (Monthly)" count={count}>{results.map((r, i) => <Val key={i} v={r.isConventional ? r.mortgageInsuranceMonthly : 0} />)}</Row>
        )}
        <Row label="HOA (Monthly)" count={count}>{results.map((r, i) => <Val key={i} v={r.hoaMonthly} />)}</Row>
        <HighlightRow label="TOTAL Monthly Payment" count={count}>{results.map((r, i) => <StarVal key={i} v={r.totalMonthlyPayment} />)}</HighlightRow>
        <Row label="Gross Annual Revenue" count={count}>{results.map((r, i) => <Val key={i} v={r.grossAnnualRevenue} />)}</Row>

        {/* Investment Analysis */}
        <Section label="INVESTMENT ANALYSIS" count={count} />
        <Row label="Monthly Rents" count={count}>{results.map((r, i) => <Val key={i} v={r.monthlyRents} />)}</Row>
        <HighlightRow label="DSCR Ratio" count={count}>{results.map((r, i) => <StarVal key={i} v={r.dscrRatio} fmt="ratio" />)}</HighlightRow>
        <HighlightRow label="Monthly Net Cash Flow" count={count}>{results.map((r, i) => <StarVal key={i} v={r.monthlyNetCashFlow} negative />)}</HighlightRow>
        <Row label="Pre-Payment Penalty" count={count}>{results.map((r, i) => <Val key={i} v={r.prePaymentPenalty} fmt="text" />)}</Row>

        {/* Closing Cost Breakdown */}
        <Section label="CLOSING COST BREAKDOWN" count={count} />
        <Row label="Partner for Life Eligible?" count={count}>{results.map((r, i) => <Val key={i} v={r.partnerForLife} fmt="text" />)}</Row>
        <Row label="TQL Flat Fee (Origination)" count={count}>{results.map((r, i) => <Val key={i} v={r.tqlFlatFee} />)}</Row>
        <Row label="TQL Processing / UW Fee" count={count}>{results.map((r, i) => <Val key={i} v={r.tqlProcessingFee} />)}</Row>
        <Row label="TQL Lower Rate Discount" count={count}>{results.map((r, i) => <Val key={i} v={r.tqlLowerRateDiscount} />)}</Row>
        <Row label="3rd Party Closing Costs" count={count}>{results.map((r, i) => <Val key={i} v={r.thirdPartyClosingCosts} />)}</Row>
        <Row label="3rd Party Certifications" count={count}>{results.map((r, i) => <Val key={i} v={r.thirdPartyCertifications} />)}</Row>
        <Row label="Title Fees" count={count}>{results.map((r, i) => <Val key={i} v={r.titleFees} />)}</Row>
        <Row label="Pre-Paids (Int, Tax, Ins)" count={count}>{results.map((r, i) => <Val key={i} v={r.prepaids} />)}</Row>
        <Row label="Escrow Payment at Closing" count={count}>{results.map((r, i) => <Val key={i} v={r.escrowAtClosing} />)}</Row>
        <Row label="Seller Credit" count={count}>{results.map((r, i) => <Val key={i} v={r.sellerCredit} />)}</Row>
        <HighlightRow label="Estimated Cash to Close" count={count}>{results.map((r, i) => <StarVal key={i} v={r.estimatedCashToClose} />)}</HighlightRow>
        <HighlightRow label="PITIA Reserves Required" count={count}>{results.map((r, i) => <StarVal key={i} v={r.pitiaReserves} />)}</HighlightRow>
        <Row label="Discount Points Fee" count={count}>{results.map((r, i) => <Val key={i} v={r.discountPointsFee} />)}</Row>

        {/* Fees Paid Before Closing */}
        <Section label="FEES PAID BEFORE CLOSING" count={count} />
        <Row label="Appraisal (3rd Party)" count={count}>{results.map((_, i) => <span key={i} className="text-sm text-monarch-muted">~$600-900</span>)}</Row>
        <Row label="Application & Credit Report Fee" count={count}>{results.map((_, i) => <span key={i} className="text-sm text-green-600 font-medium">$0 (Waived)</span>)}</Row>
      </div>

      {/* Disclaimer */}
      <div className="bg-white border border-monarch-border rounded-lg p-4">
        <p className="text-xs text-monarch-muted leading-relaxed">
          DISCLAIMER: This payment estimate is for informational purposes only and does not constitute a loan commitment, pre-qualification, or pre-approval. Actual rates, terms, fees, and monthly payments may vary based on final underwriting review, credit analysis, and property appraisal. All figures are estimates and subject to change without notice. Contact your loan officer for official pricing.
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-monarch-muted">
          <div className="flex items-center gap-1.5">
            <span>Prepared by</span>
            <input
              value={loanOfficer.name}
              onChange={e => onLoanOfficerChange('name', e.target.value)}
              placeholder="Loan Officer Name"
              className="border-b border-monarch-border bg-transparent px-1 py-0.5 text-xs text-monarch-navy w-44 focus:border-monarch-gold focus:outline-none"
            />
          </div>
          <span>|</span>
          <div className="flex items-center gap-1.5">
            <span>Date:</span>
            <input
              type="date"
              value={loanOfficer.date}
              onChange={e => onLoanOfficerChange('date', e.target.value)}
              className="border-b border-monarch-border bg-transparent px-1 py-0.5 text-xs text-monarch-navy focus:border-monarch-gold focus:outline-none"
            />
          </div>
          <span>|</span>
          <div className="flex items-center gap-1.5">
            <span>NMLS#</span>
            <input
              value={loanOfficer.nmlsNumber}
              onChange={e => onLoanOfficerChange('nmlsNumber', e.target.value)}
              placeholder="000000"
              className="border-b border-monarch-border bg-transparent px-1 py-0.5 text-xs text-monarch-navy w-24 focus:border-monarch-gold focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, count }: { label: string; count: number }) {
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  return (
    <div className="bg-monarch-section border-t border-monarch-border" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
      <div className="px-4 py-2" style={{ gridColumn: `1 / ${count + 2}` }}>
        <span className="text-xs font-bold text-monarch-navy uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

function Row({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  return (
    <div className="border-t border-monarch-border/50" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
      <div className="px-4 py-2 text-xs font-medium text-monarch-navy flex items-center">{label}</div>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="px-3 py-2 text-center">{child}</div>
      )) : children}
    </div>
  );
}

function HighlightRow({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  return (
    <div className="border-t border-monarch-gold/30 bg-monarch-gold/5" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
      <div className="px-4 py-2 text-xs font-bold text-monarch-navy flex items-center">
        <span className="text-monarch-gold mr-1">&#9733;</span> {label}
      </div>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="px-3 py-2 text-center">{child}</div>
      )) : children}
    </div>
  );
}
