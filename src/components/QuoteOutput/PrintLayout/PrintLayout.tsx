import { forwardRef } from 'react';
import type { QuoteResult, PreparedFor } from '../../../types';
import { displayOrBlank, displayRate } from '../../../utils/displayOrBlank';

interface Props {
  results: [QuoteResult, QuoteResult, QuoteResult];
  preparedFor: PreparedFor;
}

const PrintLayout = forwardRef<HTMLDivElement, Props>(({ results, preparedFor }, ref) => {
  const cols = [0, 1, 2] as const;
  const d = (v: number, fmt: 'currency' | 'percent' | 'ratio' = 'currency') => displayOrBlank(v, fmt);

  return (
    <div ref={ref} className="bg-white p-8 max-w-[1100px] mx-auto text-[11px]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4 border-b-2 border-[#0D3B66] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#0D3B66] tracking-tight">QUOTE BUILDER</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Payment Estimator &nbsp;|&nbsp; For Informational Purposes Only</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[#0D3B66] uppercase tracking-wider">Prepared For</p>
          <p>{preparedFor.name || '—'}</p>
          <p className="text-gray-500">{preparedFor.email}</p>
          <p className="text-gray-500">{preparedFor.phone}</p>
        </div>
      </div>

      {/* 3-column table */}
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-[#0D3B66] text-white">
            <th className="px-2 py-1.5 text-left w-[200px] text-[10px] font-semibold uppercase"></th>
            {cols.map(i => <th key={i} className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase">Scenario {i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          <SectionRow label="SCENARIO DETAILS" />
          <DataRow label="Property Address">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].propertyAddress || ''}</td>)}</DataRow>
          <DataRow label="Loan Program">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].loanProgram || ''}</td>)}</DataRow>
          <DataRow label="Credit Score">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].creditScore || ''}</td>)}</DataRow>
          <DataRow label="Property Type">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].propertyType || ''}</td>)}</DataRow>
          <DataRow label="Occupancy">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].occupancy || ''}</td>)}</DataRow>
          <DataRow label="Down Payment / LTV">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].downPaymentOrLtv || ''}</td>)}</DataRow>
          <DataRow label="Transaction Type">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].transactionType || ''}</td>)}</DataRow>

          <SectionRow label="LOAN DETAILS" />
          <DataRow label="Purchase Price / Value">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].priceOrValue)}</td>)}</DataRow>
          <DataRow label="Down Payment / Payoff">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].downPaymentOrPayoff)}</td>)}</DataRow>
          <DataRow label="Base Loan Amount">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].baseLoanAmount)}</td>)}</DataRow>
          <DataRow label="LTV">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].ltv, 'percent')}</td>)}</DataRow>
          <DataRow label="Loan w/ UFMIP">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].loanWithUfmip)}</td>)}</DataRow>

          <SectionRow label="PAYMENT BREAKDOWN" />
          <DataRow label="Best Rate">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{displayRate(results[i].bestRate)}</td>)}</DataRow>
          <DataRow label="Payment Type">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{results[i].paymentType}</td>)}</DataRow>
          <DataRow label="P&I / IO">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].principalAndInterest)}</td>)}</DataRow>
          <DataRow label="Insurance">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].insuranceMonthly)}</td>)}</DataRow>
          <DataRow label="Taxes">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].taxesMonthly)}</td>)}</DataRow>
          <DataRow label="MI">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].mortgageInsuranceMonthly)}</td>)}</DataRow>
          <DataRow label="HOA">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].hoaMonthly)}</td>)}</DataRow>
          <StarRow label="TOTAL Monthly">{cols.map(i => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(results[i].totalMonthlyPayment)}</td>)}</StarRow>

          <SectionRow label="INVESTMENT ANALYSIS" />
          <DataRow label="Monthly Rents">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].monthlyRents)}</td>)}</DataRow>
          <StarRow label="DSCR Ratio">{cols.map(i => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(results[i].dscrRatio, 'ratio')}</td>)}</StarRow>
          <StarRow label="Net Cash Flow">{cols.map(i => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(results[i].monthlyNetCashFlow)}</td>)}</StarRow>

          <SectionRow label="CLOSING COSTS" />
          <DataRow label="TQL Flat Fee">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].tqlFlatFee)}</td>)}</DataRow>
          <DataRow label="TQL Processing / UW">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].tqlProcessingFee)}</td>)}</DataRow>
          <DataRow label="TQL Lower Rate Disc.">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].tqlLowerRateDiscount)}</td>)}</DataRow>
          <DataRow label="3rd Party Certs">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].thirdPartyCertifications)}</td>)}</DataRow>
          <DataRow label="Title Fees">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].titleFees)}</td>)}</DataRow>
          <DataRow label="Pre-Paids">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].prepaids)}</td>)}</DataRow>
          <DataRow label="Escrow at Closing">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].escrowAtClosing)}</td>)}</DataRow>
          <DataRow label="Seller Credit">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].sellerCredit)}</td>)}</DataRow>
          <StarRow label="Cash to Close">{cols.map(i => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(results[i].estimatedCashToClose)}</td>)}</StarRow>
          <StarRow label="PITIA Reserves">{cols.map(i => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(results[i].pitiaReserves)}</td>)}</StarRow>
          <DataRow label="Discount Points">{cols.map(i => <td key={i} className="px-2 py-1 text-center">{d(results[i].discountPointsFee)}</td>)}</DataRow>

          <SectionRow label="FEES PAID BEFORE CLOSING" />
          <DataRow label="Appraisal">{cols.map(i => <td key={i} className="px-2 py-1 text-center text-gray-500">~$600-900</td>)}</DataRow>
          <DataRow label="App & Credit Report">{cols.map(i => <td key={i} className="px-2 py-1 text-center text-green-600">$0 (Waived)</td>)}</DataRow>
        </tbody>
      </table>

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-gray-300">
        <p className="text-[9px] text-gray-500 leading-relaxed">
          DISCLAIMER: This payment estimate is for informational purposes only and does not constitute a loan commitment, pre-qualification, or pre-approval.
          Actual rates, terms, fees, and monthly payments may vary based on final underwriting review, credit analysis, and property appraisal.
        </p>
        <p className="text-[9px] text-gray-500 mt-2">
          Prepared by ________________________ &nbsp;|&nbsp; Date: ____________ &nbsp;|&nbsp; NMLS# ____________
        </p>
      </div>
    </div>
  );
});

PrintLayout.displayName = 'PrintLayout';
export default PrintLayout;

function SectionRow({ label }: { label: string }) {
  return (
    <tr className="bg-[#f8f9fa]">
      <td colSpan={4} className="px-2 py-1.5 text-[10px] font-bold text-[#0D3B66] uppercase tracking-wider">{label}</td>
    </tr>
  );
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-2 py-1 font-medium text-[#0D3B66]">{label}</td>
      {children}
    </tr>
  );
}

function StarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-[#C9A84C]/30 bg-[#C9A84C]/5">
      <td className="px-2 py-1 font-bold text-[#0D3B66]"><span className="text-[#C9A84C]">&#9733;</span> {label}</td>
      {children}
    </tr>
  );
}
