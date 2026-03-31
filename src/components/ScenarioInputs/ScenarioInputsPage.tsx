import type { ScenarioInput, PreparedFor } from '../../types';
import { LOAN_PROGRAMS, PROPERTY_TYPES, OCCUPANCY_TYPES, CREDIT_SCORE_RANGES, INCOME_DOC_TYPES, PPP_OPTIONS, isConventionalProgram } from '../../types';

interface Props {
  scenarios: ScenarioInput[];
  preparedFor: PreparedFor;
  onScenarioChange: (idx: number, field: keyof ScenarioInput, value: unknown) => void;
  onPreparedForChange: (field: keyof PreparedFor, value: string) => void;
  onAddScenario: () => void;
  onRemoveScenario: (idx: number) => void;
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

export default function ScenarioInputsPage({ scenarios, preparedFor, onScenarioChange, onPreparedForChange, onAddScenario, onRemoveScenario }: Props) {
  const count = scenarios.length;
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;

  // Determine if ANY scenario is Refinance (to show refi section)
  const anyRefi = scenarios.some(s => s.transactionType === 'Refinance');
  const anyPurchase = scenarios.some(s => s.transactionType === 'Purchase');
  // Determine if ANY scenario is Conventional (to show MI fields)
  const anyConventional = scenarios.some(s => isConventionalProgram(s.loanProgram));

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
        <div className="bg-monarch-navy text-white" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"></div>
          {scenarios.map((_, i) => (
            <div key={i} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2">
              Scenario {i + 1}
              {count > 1 && (
                <button onClick={() => onRemoveScenario(i)} className="text-white/40 hover:text-white/80 text-lg leading-none" title="Remove scenario">&times;</button>
              )}
            </div>
          ))}
        </div>

        {/* Property & Loan Details */}
        <SectionHeader label="PROPERTY & LOAN DETAILS" count={count} />
        <InputRow label="Transaction Type" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Transaction Type" value={s.transactionType} options={['Purchase', 'Refinance']} onChange={v => onScenarioChange(i, 'transactionType', v)} />)}
        </InputRow>
        <InputRow label="Property Address" count={count}>
          {scenarios.map((s, i) => <TextField key={i} value={s.propertyAddress} onChange={v => onScenarioChange(i, 'propertyAddress', v)} placeholder="TBD" />)}
        </InputRow>
        <InputRow label="Loan Program" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Loan Program" value={s.loanProgram} options={LOAN_PROGRAMS.map(p => p.name)} onChange={v => onScenarioChange(i, 'loanProgram', v)} />)}
        </InputRow>
        <InputRow label="Interest Rate" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.interestRate} onChange={v => onScenarioChange(i, 'interestRate', v)} placeholder="e.g. 0.065" step="0.001" />)}
        </InputRow>
        <InputRow label="Credit Score Range" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Credit Score" value={s.creditScoreRange} options={CREDIT_SCORE_RANGES} onChange={v => onScenarioChange(i, 'creditScoreRange', v)} />)}
        </InputRow>
        <InputRow label="Property Type" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Property Type" value={s.propertyType} options={PROPERTY_TYPES} onChange={v => onScenarioChange(i, 'propertyType', v)} />)}
        </InputRow>
        <InputRow label="Occupancy" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Occupancy" value={s.occupancy} options={OCCUPANCY_TYPES} onChange={v => onScenarioChange(i, 'occupancy', v)} />)}
        </InputRow>
        <InputRow label="Income Documentation" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Income Doc" value={s.incomeDocumentation} options={INCOME_DOC_TYPES} onChange={v => onScenarioChange(i, 'incomeDocumentation', v)} />)}
        </InputRow>
        <InputRow label="Pre-Payment Penalty" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="PPP" value={s.prePaymentPenalty} options={PPP_OPTIONS} onChange={v => onScenarioChange(i, 'prePaymentPenalty', v)} />)}
        </InputRow>

        {/* Purchase Details — only shown when any scenario is Purchase */}
        {anyPurchase && (
          <>
            <SectionHeader label="PURCHASE DETAILS" count={count} />
            <InputRow label="Purchase Price" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Purchase'
                ? <NumField key={i} value={s.purchasePrice} onChange={v => onScenarioChange(i, 'purchasePrice', v)} placeholder="$0" />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
            <InputRow label="Down Payment (%)" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Purchase'
                ? <NumField key={i} value={s.downPaymentPct} onChange={v => onScenarioChange(i, 'downPaymentPct', v)} placeholder="e.g. 0.20" step="0.01" />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
          </>
        )}

        {/* Refinance Details — only shown when any scenario is Refinance */}
        {anyRefi && (
          <>
            <SectionHeader label="REFINANCE DETAILS" count={count} />
            <InputRow label="Refinance Type" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance'
                ? <SelectField key={i} label="Refi Type" value={s.refinanceType} options={['Rate & Term', 'Cash Out Refinance']} onChange={v => onScenarioChange(i, 'refinanceType', v)} />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
            <InputRow label="Current Property Value" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance'
                ? <NumField key={i} value={s.currentPropertyValue} onChange={v => onScenarioChange(i, 'currentPropertyValue', v)} placeholder="$0" />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
            <InputRow label="Loan-to-Value (LTV %)" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance'
                ? <NumField key={i} value={s.ltvPct} onChange={v => onScenarioChange(i, 'ltvPct', v)} placeholder="e.g. 0.75" step="0.01" />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
            <InputRow label="Current Loan Payoff" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance'
                ? <NumField key={i} value={s.currentLoanPayoff} onChange={v => onScenarioChange(i, 'currentLoanPayoff', v)} placeholder="$0" />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
            <InputRow label="Cash Out Amount" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance' && s.refinanceType === 'Cash Out Refinance'
                ? <NumField key={i} value={s.cashOutAmount} onChange={v => onScenarioChange(i, 'cashOutAmount', v)} placeholder="$0" />
                : <div key={i} className="text-xs text-monarch-muted italic">{s.transactionType === 'Refinance' ? '—' : 'N/A'}</div>
              )}
            </InputRow>
          </>
        )}

        {/* Cost, Income & Fee Inputs */}
        <SectionHeader label="COST, INCOME & FEE INPUTS" count={count} />
        <InputRow label="Insurance (Annual)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.insuranceAnnual} onChange={v => onScenarioChange(i, 'insuranceAnnual', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="Property Tax Rate (Annual %)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.propertyTaxRate} onChange={v => onScenarioChange(i, 'propertyTaxRate', v)} placeholder="e.g. 0.0125" step="0.001" />)}
        </InputRow>
        <InputRow label="HOA Dues (Monthly)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.hoaDuesMonthly} onChange={v => onScenarioChange(i, 'hoaDuesMonthly', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="Monthly Rents / Income Est." count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.monthlyRents} onChange={v => onScenarioChange(i, 'monthlyRents', v)} placeholder="$0" />)}
        </InputRow>

        {/* MI / UFMIP — only when Conventional selected */}
        {anyConventional && (
          <InputRow label="MI / UFMIP Rate (%)" count={count}>
            {scenarios.map((s, i) => isConventionalProgram(s.loanProgram)
              ? <NumField key={i} value={s.miRate} onChange={v => onScenarioChange(i, 'miRate', v)} placeholder="e.g. 0.005" step="0.001" />
              : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
            )}
          </InputRow>
        )}

        <InputRow label="Seller Credit (%)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.sellerCreditPct} onChange={v => onScenarioChange(i, 'sellerCreditPct', v)} placeholder="e.g. 0.03" step="0.01" />)}
        </InputRow>
        <InputRow label="Escrow / Title Fee Est." count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.escrowTitleFee} onChange={v => onScenarioChange(i, 'escrowTitleFee', v)} placeholder="$0" />)}
        </InputRow>
        <InputRow label="TQL Compliance UW Fee" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.tqlComplianceFee} onChange={v => onScenarioChange(i, 'tqlComplianceFee', v === '' ? 1795 : v as number)} />)}
        </InputRow>
        <InputRow label="TQL Lower Rate Option (%)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.tqlLowerRateOption} onChange={v => onScenarioChange(i, 'tqlLowerRateOption', v)} placeholder="e.g. 0.06" step="0.001" />)}
        </InputRow>
        <InputRow label="Discount Points (%)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.discountPoints} onChange={v => onScenarioChange(i, 'discountPoints', v)} placeholder="e.g. 0.01" step="0.001" />)}
        </InputRow>
        <InputRow label="PITIA Reserve Months" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.pitiaReserveMonths} onChange={v => onScenarioChange(i, 'pitiaReserveMonths', v)} placeholder="0" />)}
        </InputRow>
      </div>

      {/* Add Scenario Button */}
      {count < 3 && (
        <button
          onClick={onAddScenario}
          className="w-full py-3 border-2 border-dashed border-monarch-gold/40 rounded-lg text-sm font-medium text-monarch-gold hover:border-monarch-gold hover:bg-monarch-gold/5 transition-colors"
        >
          + Add Scenario
        </button>
      )}
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  return (
    <div className="bg-monarch-section border-t border-monarch-border" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
      <div className="px-4 py-2" style={{ gridColumn: `1 / ${count + 2}` }}>
        <span className="text-xs font-bold text-monarch-navy uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

function InputRow({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  return (
    <div className="border-t border-monarch-border/50 hover:bg-gray-50/50 transition-colors" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
      <div className="px-4 py-2 text-xs font-medium text-monarch-navy flex items-center">{label}</div>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="px-3 py-1.5 flex items-center">{child}</div>
      )) : children}
    </div>
  );
}
