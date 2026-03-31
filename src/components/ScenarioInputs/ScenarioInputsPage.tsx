import type { ScenarioInput, PreparedFor } from '../../types';
import { LOAN_PROGRAMS, PROPERTY_TYPES, OCCUPANCY_TYPES, CREDIT_SCORE_RANGES, INCOME_DOC_TYPES, PPP_OPTIONS } from '../../types';

interface Props {
  scenarios: [ScenarioInput, ScenarioInput, ScenarioInput];
  preparedFor: PreparedFor;
  onScenarioChange: (idx: number, field: keyof ScenarioInput, value: unknown) => void;
  onPreparedForChange: (field: keyof PreparedFor, value: string) => void;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      title={label}
      className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded bg-white focus:ring-1 focus:ring-monarch-gold focus:border-monarch-gold outline-none"
    >
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function NumField({ value, onChange, placeholder, step }: { value: number | ''; onChange: (v: number | '') => void; placeholder?: string; step?: string }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
      placeholder={placeholder}
      step={step}
      className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded bg-white focus:ring-1 focus:ring-monarch-gold focus:border-monarch-gold outline-none"
    />
  );
}

function TextField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded bg-white focus:ring-1 focus:ring-monarch-gold focus:border-monarch-gold outline-none"
    />
  );
}

export default function ScenarioInputsPage({ scenarios, preparedFor, onScenarioChange, onPreparedForChange }: Props) {
  const cols = [0, 1, 2] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-monarch-navy tracking-tight">SCENARIO INPUTS</h1>
          <p className="text-sm text-monarch-muted mt-1">Enter loan scenario details below — outputs appear on the Quote Builder page</p>
        </div>
        <div className="bg-white border border-monarch-border rounded-lg p-4 space-y-2 w-64">
          <p className="text-xs font-semibold text-monarch-navy uppercase tracking-wider">Prepared For</p>
          <input value={preparedFor.name} onChange={e => onPreparedForChange('name', e.target.value)} placeholder="Name" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
          <input value={preparedFor.email} onChange={e => onPreparedForChange('email', e.target.value)} placeholder="Email" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
          <input value={preparedFor.phone} onChange={e => onPreparedForChange('phone', e.target.value)} placeholder="Phone" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
        </div>
      </div>

      {/* Input Grid */}
      <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[220px_1fr_1fr_1fr] bg-monarch-navy text-white">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"></div>
          {cols.map(i => (
            <div key={i} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-center">Scenario {i + 1}</div>
          ))}
        </div>

        {/* Property & Loan Details */}
        <SectionHeader label="PROPERTY & LOAN DETAILS" />
        <InputRow label="Transaction Type">
          {cols.map(i => <SelectField key={i} label="Transaction Type" value={scenarios[i].transactionType} options={['Purchase', 'Refinance']} onChange={v => onScenarioChange(i, 'transactionType', v)} />)}
        </InputRow>
        <InputRow label="Property Address">
          {cols.map(i => <TextField key={i} value={scenarios[i].propertyAddress} onChange={v => onScenarioChange(i, 'propertyAddress', v)} placeholder="TBD" />)}
        </InputRow>
        <InputRow label="Loan Program">
          {cols.map(i => <SelectField key={i} label="Loan Program" value={scenarios[i].loanProgram} options={LOAN_PROGRAMS.map(p => p.name)} onChange={v => onScenarioChange(i, 'loanProgram', v)} />)}
        </InputRow>
        <InputRow label="Interest Rate">
          {cols.map(i => <NumField key={i} value={scenarios[i].interestRate} onChange={v => onScenarioChange(i, 'interestRate', v)} placeholder="e.g. 0.065" step="0.001" />)}
        </InputRow>
        <InputRow label="Credit Score Range">
          {cols.map(i => <SelectField key={i} label="Credit Score" value={scenarios[i].creditScoreRange} options={CREDIT_SCORE_RANGES} onChange={v => onScenarioChange(i, 'creditScoreRange', v)} />)}
        </InputRow>
        <InputRow label="Property Type">
          {cols.map(i => <SelectField key={i} label="Property Type" value={scenarios[i].propertyType} options={PROPERTY_TYPES} onChange={v => onScenarioChange(i, 'propertyType', v)} />)}
        </InputRow>
        <InputRow label="Occupancy">
          {cols.map(i => <SelectField key={i} label="Occupancy" value={scenarios[i].occupancy} options={OCCUPANCY_TYPES} onChange={v => onScenarioChange(i, 'occupancy', v)} />)}
        </InputRow>
        <InputRow label="Income Documentation">
          {cols.map(i => <SelectField key={i} label="Income Doc" value={scenarios[i].incomeDocumentation} options={INCOME_DOC_TYPES} onChange={v => onScenarioChange(i, 'incomeDocumentation', v)} />)}
        </InputRow>
        <InputRow label="Pre-Payment Penalty">
          {cols.map(i => <SelectField key={i} label="PPP" value={scenarios[i].prePaymentPenalty} options={PPP_OPTIONS} onChange={v => onScenarioChange(i, 'prePaymentPenalty', v)} />)}
        </InputRow>

        {/* Purchase Details */}
        <SectionHeader label="PURCHASE DETAILS" subtitle="if Transaction Type = Purchase" />
        <InputRow label="Purchase Price">
          {cols.map(i => <NumField key={i} value={scenarios[i].purchasePrice} onChange={v => onScenarioChange(i, 'purchasePrice', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="Down Payment (%)">
          {cols.map(i => <NumField key={i} value={scenarios[i].downPaymentPct} onChange={v => onScenarioChange(i, 'downPaymentPct', v)} placeholder="e.g. 0.20" step="0.01" />)}
        </InputRow>

        {/* Refinance Details */}
        <SectionHeader label="REFINANCE DETAILS" subtitle="if Transaction Type = Refinance" />
        <InputRow label="Refinance Type">
          {cols.map(i => <SelectField key={i} label="Refi Type" value={scenarios[i].refinanceType} options={['Rate & Term', 'Cashout']} onChange={v => onScenarioChange(i, 'refinanceType', v)} />)}
        </InputRow>
        <InputRow label="Current Property Value">
          {cols.map(i => <NumField key={i} value={scenarios[i].currentPropertyValue} onChange={v => onScenarioChange(i, 'currentPropertyValue', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="Loan-to-Value (LTV %)">
          {cols.map(i => <NumField key={i} value={scenarios[i].ltvPct} onChange={v => onScenarioChange(i, 'ltvPct', v)} placeholder="e.g. 0.75" step="0.01" />)}
        </InputRow>
        <InputRow label="Current Loan Payoff">
          {cols.map(i => <NumField key={i} value={scenarios[i].currentLoanPayoff} onChange={v => onScenarioChange(i, 'currentLoanPayoff', v)} placeholder="$0" />)}
        </InputRow>

        {/* Cost, Income & Fee Inputs */}
        <SectionHeader label="COST, INCOME & FEE INPUTS" />
        <InputRow label="Insurance (Annual)">
          {cols.map(i => <NumField key={i} value={scenarios[i].insuranceAnnual} onChange={v => onScenarioChange(i, 'insuranceAnnual', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="Property Tax Rate (Annual %)">
          {cols.map(i => <NumField key={i} value={scenarios[i].propertyTaxRate} onChange={v => onScenarioChange(i, 'propertyTaxRate', v)} placeholder="e.g. 0.0125" step="0.001" />)}
        </InputRow>
        <InputRow label="HOA Dues (Monthly)">
          {cols.map(i => <NumField key={i} value={scenarios[i].hoaDuesMonthly} onChange={v => onScenarioChange(i, 'hoaDuesMonthly', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="Monthly Rents / Income Est.">
          {cols.map(i => <NumField key={i} value={scenarios[i].monthlyRents} onChange={v => onScenarioChange(i, 'monthlyRents', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="MI / UFMIP Rate (%)">
          {cols.map(i => <NumField key={i} value={scenarios[i].miRate} onChange={v => onScenarioChange(i, 'miRate', v)} placeholder="e.g. 0.005" step="0.001" />)}
        </InputRow>
        <InputRow label="Seller Credit (%)">
          {cols.map(i => <NumField key={i} value={scenarios[i].sellerCreditPct} onChange={v => onScenarioChange(i, 'sellerCreditPct', v)} placeholder="e.g. 0.03" step="0.01" />)}
        </InputRow>
        <InputRow label="Escrow / Title Fee Est.">
          {cols.map(i => <NumField key={i} value={scenarios[i].escrowTitleFee} onChange={v => onScenarioChange(i, 'escrowTitleFee', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="TQL Compliance UW Fee">
          {cols.map(i => <NumField key={i} value={scenarios[i].tqlComplianceFee} onChange={v => onScenarioChange(i, 'tqlComplianceFee', v === '' ? 1795 : v as number)} />)}
        </InputRow>
        <InputRow label="TQL Lower Rate Option (%)">
          {cols.map(i => <NumField key={i} value={scenarios[i].tqlLowerRateOption} onChange={v => onScenarioChange(i, 'tqlLowerRateOption', v)} placeholder="e.g. 0.06" step="0.001" />)}
        </InputRow>
        <InputRow label="Discount Points (%)">
          {cols.map(i => <NumField key={i} value={scenarios[i].discountPoints} onChange={v => onScenarioChange(i, 'discountPoints', v)} placeholder="e.g. 0.01" step="0.001" />)}
        </InputRow>
        <InputRow label="PITIA Reserve Months">
          {cols.map(i => <NumField key={i} value={scenarios[i].pitiaReserveMonths} onChange={v => onScenarioChange(i, 'pitiaReserveMonths', v)} placeholder="0" />)}
        </InputRow>
      </div>
    </div>
  );
}

function SectionHeader({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr_1fr] bg-monarch-section border-t border-monarch-border">
      <div className="px-4 py-2 col-span-4">
        <span className="text-xs font-bold text-monarch-navy uppercase tracking-wider">{label}</span>
        {subtitle && <span className="text-xs text-monarch-muted ml-2">({subtitle})</span>}
      </div>
    </div>
  );
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr_1fr] border-t border-monarch-border/50 hover:bg-gray-50/50 transition-colors">
      <div className="px-4 py-2 text-xs font-medium text-monarch-navy flex items-center">{label}</div>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="px-3 py-1.5">{child}</div>
      )) : children}
    </div>
  );
}
