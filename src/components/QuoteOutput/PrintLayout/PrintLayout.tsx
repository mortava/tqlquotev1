import { forwardRef } from 'react';
import type { QuoteResult, PreparedFor, LoanOfficerInfo } from '../../../types';
import { displayOrBlank, displayRate } from '../../../utils/displayOrBlank';

interface Props {
  results: QuoteResult[];
  preparedFor: PreparedFor;
  loanOfficer: LoanOfficerInfo;
}

const PrintLayout = forwardRef<HTMLDivElement, Props>(({ results, preparedFor, loanOfficer }, ref) => {
  const d = (v: number, fmt: 'currency' | 'percent' | 'ratio' = 'currency') => displayOrBlank(v, fmt);
  const anyConv = results.some(r => r.isConventional);

  return (
    <div ref={ref} className="bg-white p-8 max-w-[1100px] mx-auto text-[11px]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* CLEAR QUOTE Header */}
      <div className="flex items-start justify-between mb-2 pb-3 border-b-[3px] border-[#0D3B66]">
        <div className="flex items-center gap-3">
          <img src="/tql-logo.png" alt="Total Quality Lending" className="h-12" />
          <div>
            <h1 className="text-[22px] font-extrabold text-[#0D3B66] tracking-tight leading-tight">CLEAR QUOTE</h1>
            <p className="text-[10px] text-gray-400 italic">Clarity in the Costs&trade;</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[#0D3B66] uppercase tracking-wider">Prepared For</p>
          <p className="text-[13px] font-semibold text-[#0D3B66]">{preparedFor.name || '—'}</p>
          <p className="text-[10px] text-gray-500">{preparedFor.email}</p>
        </div>
      </div>

      {/* MLO Bar */}
      <div className="bg-[#0D3B66] text-white rounded px-4 py-2 mb-4 flex items-center justify-between text-[10px]">
        <span className="font-semibold">{loanOfficer.name || 'Loan Officer'} — {loanOfficer.title || 'Loan Officer & Advisor'}</span>
        <span>{[loanOfficer.phone, loanOfficer.email, loanOfficer.nmlsNumber ? `NMLS# ${loanOfficer.nmlsNumber}` : ''].filter(Boolean).join(' | ')}</span>
      </div>

      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-[#0D3B66] text-white">
            <th className="px-2 py-1.5 text-left w-[200px] text-[10px] font-semibold uppercase"></th>
            {results.map((_, i) => <th key={i} className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase">Scenario {i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          <SectionRow label="SCENARIO DETAILS" />
          <DataRow label="Property Address">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.propertyAddress || ''}</td>)}</DataRow>
          <DataRow label="Loan Program">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.loanProgram || ''}</td>)}</DataRow>
          <DataRow label="Credit Score">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.creditScore || ''}</td>)}</DataRow>
          <DataRow label="Property Type">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.propertyType || ''}</td>)}</DataRow>
          <DataRow label="Occupancy">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.occupancy || ''}</td>)}</DataRow>
          <DataRow label="Transaction Type">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.transactionType || ''}</td>)}</DataRow>

          <SectionRow label="LOAN DETAILS" />
          <DataRow label="Purchase Price / Value">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.priceOrValue)}</td>)}</DataRow>
          <DataRow label="Base Loan Amount">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.baseLoanAmount)}</td>)}</DataRow>
          {results.some(r => r.cashOutAmount > 0) && <DataRow label="Cash Out Amount">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.cashOutAmount > 0 ? d(r.cashOutAmount) : ''}</td>)}</DataRow>}
          <DataRow label="LTV">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.ltv, 'percent')}</td>)}</DataRow>
          {anyConv && <DataRow label="Loan w/ UFMIP">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.isConventional ? d(r.loanWithUfmip) : ''}</td>)}</DataRow>}

          <SectionRow label="PAYMENT BREAKDOWN" />
          <DataRow label="Best Rate">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{displayRate(r.bestRate)}</td>)}</DataRow>
          <DataRow label="Payment Type">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.paymentType}</td>)}</DataRow>
          <DataRow label="P&I / IO">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.principalAndInterest)}</td>)}</DataRow>
          <DataRow label="Insurance">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.insuranceMonthly)}</td>)}</DataRow>
          <DataRow label="Taxes">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.taxesMonthly)}</td>)}</DataRow>
          {anyConv && <DataRow label="MI">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{r.isConventional ? d(r.mortgageInsuranceMonthly) : ''}</td>)}</DataRow>}
          <DataRow label="HOA">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.hoaMonthly)}</td>)}</DataRow>
          <StarRow label="TOTAL Monthly">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(r.totalMonthlyPayment)}</td>)}</StarRow>

          <SectionRow label="INVESTMENT ANALYSIS" />
          <DataRow label="Monthly Rents">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.monthlyRents)}</td>)}</DataRow>
          <StarRow label="DSCR Ratio">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(r.dscrRatio, 'ratio')}</td>)}</StarRow>
          <StarRow label="Net Cash Flow">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(r.monthlyNetCashFlow)}</td>)}</StarRow>
          <DataRow label="Potential Annual Income">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.potentialAnnualIncome)}</td>)}</DataRow>

          <SectionRow label="CLOSING COSTS" />
          <DataRow label="TQL Flat Fee">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.tqlFlatFee)}</td>)}</DataRow>
          <DataRow label="TQL Processing / UW">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.tqlProcessingFee)}</td>)}</DataRow>
          <DataRow label="Taxes/Ins. Escrow Setup">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center">{d(r.taxInsEscrowSetup)}</td>)}</DataRow>
          <StarRow label="Cash to Close">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(r.estimatedCashToClose)}</td>)}</StarRow>
          <StarRow label="PITIA Reserves">{results.map((r, i) => <td key={i} className="px-2 py-1 text-center font-bold text-[#0D3B66]">{d(r.pitiaReserves)}</td>)}</StarRow>

          <SectionRow label="FEES PAID BEFORE CLOSING" />
          <DataRow label="Appraisal">{results.map((_, i) => <td key={i} className="px-2 py-1 text-center text-gray-500">~$600-900</td>)}</DataRow>
          <DataRow label="App & Credit Report">{results.map((_, i) => <td key={i} className="px-2 py-1 text-center text-green-600">$0 (Waived)</td>)}</DataRow>
        </tbody>
      </table>

      <div className="mt-4 pt-3 border-t border-gray-300">
        <p className="text-[9px] text-gray-500 leading-relaxed">
          DISCLAIMER: This payment estimate is for informational purposes only and does not constitute a loan commitment, pre-qualification, or pre-approval.
        </p>
        <p className="text-[9px] text-gray-500 mt-2">
          Prepared by {loanOfficer.name || '________________________'} &nbsp;|&nbsp; Date: {loanOfficer.date || '____________'} &nbsp;|&nbsp; NMLS# {loanOfficer.nmlsNumber || '____________'}
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
      <td colSpan={99} className="px-2 py-1.5 text-[10px] font-bold text-[#0D3B66] uppercase tracking-wider">{label}</td>
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
