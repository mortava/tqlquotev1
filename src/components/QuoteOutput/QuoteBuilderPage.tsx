import type { QuoteResult, PreparedFor } from '../../types';
import { displayOrBlank, displayRate } from '../../utils/displayOrBlank';

interface Props {
  results: [QuoteResult, QuoteResult, QuoteResult];
  preparedFor: PreparedFor;
}

function Val({ v, fmt = 'currency' }: { v: number | string; fmt?: 'currency' | 'percent' | 'ratio' | 'text' }) {
  const display = fmt === 'text' ? (v || '') : displayOrBlank(v as number, fmt);
  return <span className="text-sm">{display}</span>;
}

function StarVal({ v, fmt = 'currency', negative }: { v: number | string; fmt?: 'currency' | 'percent' | 'ratio' | 'text'; negative?: boolean }) {
  const display = fmt === 'text' ? (v || '') : displayOrBlank(v as number, fmt);
  return <span className={`text-sm font-semibold ${negative && typeof v === 'number' && v < 0 ? 'text-red-600' : 'text-monarch-navy'}`}>{display}</span>;
}

export default function QuoteBuilderPage({ results, preparedFor }: Props) {
  const cols = [0, 1, 2] as const;

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
        <div className="grid grid-cols-[220px_1fr_1fr_1fr] bg-monarch-navy text-white">
          <div className="px-4 py-2"></div>
          {cols.map(i => (
            <div key={i} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-center">Scenario {i + 1}</div>
          ))}
        </div>

        {/* Scenario Details */}
        <Section label="SCENARIO DETAILS" />
        <Row label="Property Address">{cols.map(i => <Val key={i} v={results[i].propertyAddress} fmt="text" />)}</Row>
        <Row label="Loan Program">{cols.map(i => <Val key={i} v={results[i].loanProgram} fmt="text" />)}</Row>
        <Row label="Credit Score">{cols.map(i => <Val key={i} v={results[i].creditScore} fmt="text" />)}</Row>
        <Row label="Property Type">{cols.map(i => <Val key={i} v={results[i].propertyType} fmt="text" />)}</Row>
        <Row label="Occupancy">{cols.map(i => <Val key={i} v={results[i].occupancy} fmt="text" />)}</Row>
        <Row label="Down Payment / LTV">{cols.map(i => <Val key={i} v={results[i].downPaymentOrLtv} fmt="text" />)}</Row>
        <Row label="Transaction Type">{cols.map(i => <Val key={i} v={results[i].transactionType} fmt="text" />)}</Row>

        {/* Loan Details */}
        <Section label="LOAN DETAILS" />
        <Row label="Purchase Price / Current Value">{cols.map(i => <Val key={i} v={results[i].priceOrValue} />)}</Row>
        <Row label="Down Payment / Payoff">{cols.map(i => <Val key={i} v={results[i].downPaymentOrPayoff} />)}</Row>
        <Row label="Base Loan Amount">{cols.map(i => <Val key={i} v={results[i].baseLoanAmount} />)}</Row>
        <Row label="Loan-to-Value (LTV)">{cols.map(i => <Val key={i} v={results[i].ltv} fmt="percent" />)}</Row>
        <Row label="Loan w/ UFMIP">{cols.map(i => <Val key={i} v={results[i].loanWithUfmip} />)}</Row>

        {/* Payment Breakdown */}
        <Section label="PAYMENT BREAKDOWN" />
        <Row label="Best Rate">{cols.map(i => <span key={i} className="text-sm">{displayRate(results[i].bestRate)}</span>)}</Row>
        <Row label="Payment Type">{cols.map(i => <Val key={i} v={results[i].paymentType} fmt="text" />)}</Row>
        <Row label="Principal & Interest / IO">{cols.map(i => <Val key={i} v={results[i].principalAndInterest} />)}</Row>
        <Row label="Insurance (Monthly)">{cols.map(i => <Val key={i} v={results[i].insuranceMonthly} />)}</Row>
        <Row label="Taxes (Monthly)">{cols.map(i => <Val key={i} v={results[i].taxesMonthly} />)}</Row>
        <Row label="Mortgage Insurance (Monthly)">{cols.map(i => <Val key={i} v={results[i].mortgageInsuranceMonthly} />)}</Row>
        <Row label="HOA (Monthly)">{cols.map(i => <Val key={i} v={results[i].hoaMonthly} />)}</Row>
        <HighlightRow label="TOTAL Monthly Payment">{cols.map(i => <StarVal key={i} v={results[i].totalMonthlyPayment} />)}</HighlightRow>
        <Row label="Gross Annual Revenue">{cols.map(i => <Val key={i} v={results[i].grossAnnualRevenue} />)}</Row>

        {/* Investment Analysis */}
        <Section label="INVESTMENT ANALYSIS" />
        <Row label="Monthly Rents">{cols.map(i => <Val key={i} v={results[i].monthlyRents} />)}</Row>
        <HighlightRow label="DSCR Ratio">{cols.map(i => <StarVal key={i} v={results[i].dscrRatio} fmt="ratio" />)}</HighlightRow>
        <HighlightRow label="Monthly Net Cash Flow">{cols.map(i => <StarVal key={i} v={results[i].monthlyNetCashFlow} negative />)}</HighlightRow>
        <Row label="Pre-Payment Penalty">{cols.map(i => <Val key={i} v={results[i].prePaymentPenalty} fmt="text" />)}</Row>

        {/* Closing Cost Breakdown */}
        <Section label="CLOSING COST BREAKDOWN" />
        <Row label="Partner for Life Eligible?">{cols.map(i => <Val key={i} v={results[i].partnerForLife} fmt="text" />)}</Row>
        <Row label="TQL Flat Fee (Origination)">{cols.map(i => <Val key={i} v={results[i].tqlFlatFee} />)}</Row>
        <Row label="TQL Processing / UW Fee">{cols.map(i => <Val key={i} v={results[i].tqlProcessingFee} />)}</Row>
        <Row label="TQL Lower Rate Discount">{cols.map(i => <Val key={i} v={results[i].tqlLowerRateDiscount} />)}</Row>
        <Row label="3rd Party Closing Costs">{cols.map(i => <Val key={i} v={results[i].thirdPartyClosingCosts} />)}</Row>
        <Row label="3rd Party Certifications">{cols.map(i => <Val key={i} v={results[i].thirdPartyCertifications} />)}</Row>
        <Row label="Title Fees">{cols.map(i => <Val key={i} v={results[i].titleFees} />)}</Row>
        <Row label="Pre-Paids (Int, Tax, Ins)">{cols.map(i => <Val key={i} v={results[i].prepaids} />)}</Row>
        <Row label="Escrow Payment at Closing">{cols.map(i => <Val key={i} v={results[i].escrowAtClosing} />)}</Row>
        <Row label="Seller Credit">{cols.map(i => <Val key={i} v={results[i].sellerCredit} />)}</Row>
        <HighlightRow label="Estimated Cash to Close">{cols.map(i => <StarVal key={i} v={results[i].estimatedCashToClose} />)}</HighlightRow>
        <HighlightRow label="PITIA Reserves Required">{cols.map(i => <StarVal key={i} v={results[i].pitiaReserves} />)}</HighlightRow>
        <Row label="Discount Points Fee">{cols.map(i => <Val key={i} v={results[i].discountPointsFee} />)}</Row>

        {/* Fees Paid Before Closing */}
        <Section label="FEES PAID BEFORE CLOSING" />
        <Row label="Appraisal (3rd Party)">{cols.map(i => <span key={i} className="text-sm text-monarch-muted">~$600-900</span>)}</Row>
        <Row label="Application & Credit Report Fee">{cols.map(i => <span key={i} className="text-sm text-green-600 font-medium">$0 (Waived)</span>)}</Row>
      </div>

      {/* Disclaimer */}
      <div className="bg-white border border-monarch-border rounded-lg p-4">
        <p className="text-xs text-monarch-muted leading-relaxed">
          DISCLAIMER: This payment estimate is for informational purposes only and does not constitute a loan commitment, pre-qualification, or pre-approval. Actual rates, terms, fees, and monthly payments may vary based on final underwriting review, credit analysis, and property appraisal. All figures are estimates and subject to change without notice. Contact your loan officer for official pricing.
        </p>
        <p className="text-xs text-monarch-muted mt-3">
          Prepared by ________________________ &nbsp;|&nbsp; Date: ____________ &nbsp;|&nbsp; NMLS# ____________
        </p>
      </div>
    </div>
  );
}

function Section({ label }: { label: string }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr_1fr] bg-monarch-section border-t border-monarch-border">
      <div className="px-4 py-2 col-span-4">
        <span className="text-xs font-bold text-monarch-navy uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr_1fr] border-t border-monarch-border/50">
      <div className="px-4 py-2 text-xs font-medium text-monarch-navy flex items-center">{label}</div>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="px-3 py-2 text-center">{child}</div>
      )) : children}
    </div>
  );
}

function HighlightRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr_1fr] border-t border-monarch-gold/30 bg-monarch-gold/5">
      <div className="px-4 py-2 text-xs font-bold text-monarch-navy flex items-center">
        <span className="text-monarch-gold mr-1">&#9733;</span> {label}
      </div>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="px-3 py-2 text-center">{child}</div>
      )) : children}
    </div>
  );
}
