import type { QuoteResult, PreparedFor } from '../../../types';
import { displayOrBlank, displayRate } from '../../../utils/displayOrBlank';

interface Props {
  result: QuoteResult;
  preparedFor: PreparedFor;
  scenarioIndex: number;
}

export default function EmailLayout({ result, preparedFor, scenarioIndex }: Props) {
  const d = (v: number, fmt: 'currency' | 'percent' | 'ratio' = 'currency') => displayOrBlank(v, fmt);

  function buildPlainText(): string {
    const lines: string[] = [];
    lines.push('PAYMENT ESTIMATE');
    lines.push('Total Quality Lending');
    lines.push('');
    lines.push('  PREPARED FOR');
    if (preparedFor.name) lines.push(`Name: ${preparedFor.name}`);
    if (preparedFor.email) lines.push(`Email: ${preparedFor.email}`);
    if (preparedFor.phone) lines.push(`Phone: ${preparedFor.phone}`);
    lines.push('');
    lines.push('  PROPERTY & LOAN');
    lines.push(`Property Address: ${result.propertyAddress || 'TBD'}`);
    lines.push(`Transaction Type: ${result.transactionType || ''}`);
    lines.push(`Loan Program: ${result.loanProgram || ''}`);
    lines.push(`Credit Score: ${result.creditScore || ''}`);
    lines.push(`Property Type: ${result.propertyType || ''}`);
    lines.push(`Occupancy: ${result.occupancy || ''}`);
    lines.push(`Down Payment / LTV: ${result.downPaymentOrLtv || ''}`);
    lines.push('');
    lines.push('  LOAN AMOUNTS');
    lines.push(`Price / Value: ${d(result.priceOrValue)}`);
    lines.push(`Base Loan Amount: ${d(result.baseLoanAmount)}`);
    lines.push('');
    lines.push('  MONTHLY PAYMENT');
    lines.push(`Interest Rate: ${displayRate(result.bestRate)}`);
    lines.push(`Payment Type: ${result.paymentType}`);
    lines.push(`P&I / Interest Only: ${d(result.principalAndInterest)}`);
    lines.push(`Insurance: ${d(result.insuranceMonthly)}`);
    lines.push(`Taxes: ${d(result.taxesMonthly)}`);
    lines.push(`MI: ${d(result.mortgageInsuranceMonthly)}`);
    lines.push(`HOA: ${d(result.hoaMonthly)}`);
    lines.push(`★  TOTAL MONTHLY: ${d(result.totalMonthlyPayment)}`);
    lines.push('');
    lines.push('  INVESTMENT ANALYSIS');
    lines.push(`Monthly Rents: ${d(result.monthlyRents)}`);
    lines.push(`DSCR Ratio: ${d(result.dscrRatio, 'ratio')}`);
    lines.push(`Net Cash Flow / Month: ${d(result.monthlyNetCashFlow)}`);
    lines.push('');
    lines.push('  CASH TO CLOSE');
    lines.push(`Estimated Cash to Close: ${d(result.estimatedCashToClose)}`);
    lines.push(`PITIA Reserves: ${d(result.pitiaReserves)}`);
    lines.push('');
    lines.push('This estimate is for informational purposes only and does not constitute a loan commitment or pre-approval. Contact your loan officer for official pricing.');
    return lines.join('\n');
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPlainText());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-monarch-navy">Outlook Copy-Paste Layout</h2>
          <p className="text-xs text-monarch-muted">Scenario {scenarioIndex + 1} — 2-column format for email</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-monarch-navy text-white text-sm font-medium rounded-lg hover:bg-monarch-navy/90 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          Copy to Clipboard
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white border border-monarch-border rounded-lg p-6 max-w-xl">
        <table className="w-full text-sm">
          <tbody>
            <tr><td colSpan={2} className="pb-1 text-base font-bold text-monarch-navy">PAYMENT ESTIMATE</td></tr>
            <tr><td colSpan={2} className="pb-3 text-xs text-monarch-muted">Total Quality Lending</td></tr>

            <ESection label="PREPARED FOR" />
            <ERow label="Name" value={preparedFor.name || '—'} />
            <ERow label="Email" value={preparedFor.email} />
            <ERow label="Phone" value={preparedFor.phone} />

            <ESection label="PROPERTY & LOAN" />
            <ERow label="Property Address" value={result.propertyAddress || 'TBD'} />
            <ERow label="Transaction Type" value={result.transactionType} />
            <ERow label="Loan Program" value={result.loanProgram} />
            <ERow label="Credit Score" value={result.creditScore} />
            <ERow label="Property Type" value={result.propertyType} />
            <ERow label="Occupancy" value={result.occupancy} />
            <ERow label="Down Payment / LTV" value={result.downPaymentOrLtv} />

            <ESection label="LOAN AMOUNTS" />
            <ERow label="Price / Value" value={d(result.priceOrValue)} />
            <ERow label="Base Loan Amount" value={d(result.baseLoanAmount)} />

            <ESection label="MONTHLY PAYMENT" />
            <ERow label="Interest Rate" value={displayRate(result.bestRate)} />
            <ERow label="Payment Type" value={result.paymentType} />
            <ERow label="P&I / Interest Only" value={d(result.principalAndInterest)} />
            <ERow label="Insurance" value={d(result.insuranceMonthly)} />
            <ERow label="Taxes" value={d(result.taxesMonthly)} />
            <ERow label="MI" value={d(result.mortgageInsuranceMonthly)} />
            <ERow label="HOA" value={d(result.hoaMonthly)} />
            <tr className="border-t border-monarch-gold/30 bg-monarch-gold/5">
              <td className="py-1.5 font-bold text-monarch-navy"><span className="text-monarch-gold">&#9733;</span> TOTAL MONTHLY</td>
              <td className="py-1.5 text-right font-bold text-monarch-navy">{d(result.totalMonthlyPayment)}</td>
            </tr>

            <ESection label="INVESTMENT ANALYSIS" />
            <ERow label="Monthly Rents" value={d(result.monthlyRents)} />
            <ERow label="DSCR Ratio" value={d(result.dscrRatio, 'ratio')} />
            <ERow label="Net Cash Flow / Month" value={d(result.monthlyNetCashFlow)} />

            <ESection label="CASH TO CLOSE" />
            <ERow label="Estimated Cash to Close" value={d(result.estimatedCashToClose)} />
            <ERow label="PITIA Reserves" value={d(result.pitiaReserves)} />
          </tbody>
        </table>

        <p className="text-[10px] text-monarch-muted mt-4 pt-3 border-t border-monarch-border leading-relaxed">
          This estimate is for informational purposes only and does not constitute a loan commitment or pre-approval. Contact your loan officer for official pricing.
        </p>
      </div>
    </div>
  );
}

function ESection({ label }: { label: string }) {
  return (
    <tr className="border-t border-monarch-border">
      <td colSpan={2} className="pt-3 pb-1 text-[10px] font-bold text-monarch-navy uppercase tracking-wider">{label}</td>
    </tr>
  );
}

function ERow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-t border-monarch-border/30">
      <td className="py-1 text-monarch-muted">{label}</td>
      <td className="py-1 text-right">{value || ''}</td>
    </tr>
  );
}
