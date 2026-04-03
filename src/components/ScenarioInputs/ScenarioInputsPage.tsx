import { useState } from 'react';
import type { ScenarioInput, PreparedFor, PropertyAddress, LoanOfficerInfo } from '../../types';
import { LOAN_PROGRAMS, PROPERTY_TYPES, OCCUPANCY_TYPES, CREDIT_SCORE_RANGES, INCOME_DOC_TYPES, PPP_OPTIONS, DOCS_RECEIVED_OPTIONS, isConventionalProgram } from '../../types';
import { lookupTaxRate, getStatesWithNames, getCountiesForState } from '../../utils/propertyTaxData';
import { generatePreApproval } from '../../utils/generatePreApproval';

interface Props {
  scenarios: ScenarioInput[];
  preparedFor: PreparedFor;
  loanOfficer: LoanOfficerInfo;
  onScenarioChange: (idx: number, field: keyof ScenarioInput, value: unknown) => void;
  onPreparedForChange: (field: keyof PreparedFor, value: string) => void;
  onLoanOfficerChange: (field: keyof LoanOfficerInfo, value: string) => void;
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

export default function ScenarioInputsPage({ scenarios, preparedFor, loanOfficer, onScenarioChange, onPreparedForChange, onLoanOfficerChange, onAddScenario, onRemoveScenario }: Props) {
  const count = scenarios.length;
  const colTemplate = `220px ${Array(count).fill('1fr').join(' ')}`;
  const [taxLookupStatus, setTaxLookupStatus] = useState<Record<number, string>>({});

  const handleAddressChange = (idx: number, field: keyof PropertyAddress, value: string) => {
    const addr = { ...scenarios[idx].propertyAddress, [field]: value };
    onScenarioChange(idx, 'propertyAddress', addr);
  };

  const handleTaxLookup = (idx: number) => {
    const state = scenarios[idx].propertyAddress.state;
    if (!state) {
      setTaxLookupStatus(prev => ({ ...prev, [idx]: 'Enter a state first' }));
      return;
    }
    const result = lookupTaxRate(state);
    if (result) {
      onScenarioChange(idx, 'propertyTaxRate', result.rate);
      setTaxLookupStatus(prev => ({ ...prev, [idx]: `${result.stateName} avg: ${result.rate.toFixed(3)}%` }));
    } else {
      setTaxLookupStatus(prev => ({ ...prev, [idx]: 'State not found' }));
    }
  };

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
        <div className="flex gap-4">
          <div className="bg-white border border-monarch-border rounded-lg p-4 space-y-2 w-56">
            <p className="text-xs font-semibold text-monarch-navy uppercase tracking-wider">Prepared For</p>
            <input value={preparedFor.name} onChange={e => onPreparedForChange('name', e.target.value)} placeholder="Client Name" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
            <input value={preparedFor.email} onChange={e => onPreparedForChange('email', e.target.value)} placeholder="Email" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
            <input value={preparedFor.phone} onChange={e => onPreparedForChange('phone', e.target.value)} placeholder="Phone" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
          </div>
          <div className="bg-white border border-monarch-border rounded-lg p-4 space-y-2 w-56">
            <p className="text-xs font-semibold text-monarch-navy uppercase tracking-wider">Loan Officer</p>
            <input value={loanOfficer.name} onChange={e => onLoanOfficerChange('name', e.target.value)} placeholder="LO Name" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
            <input value={loanOfficer.phone} onChange={e => onLoanOfficerChange('phone', e.target.value)} placeholder="Phone" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
            <input value={loanOfficer.email} onChange={e => onLoanOfficerChange('email', e.target.value)} placeholder="Email" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
            <input value={loanOfficer.nmlsNumber} onChange={e => onLoanOfficerChange('nmlsNumber', e.target.value)} placeholder="NMLS#" className="w-full px-2 py-1.5 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold outline-none" />
          </div>
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
        <InputRow label="Street Address" count={count}>
          {scenarios.map((s, i) => <TextField key={i} value={s.propertyAddress.street} onChange={v => handleAddressChange(i, 'street', v)} placeholder="123 Main St" />)}
        </InputRow>
        <InputRow label="Unit #" count={count}>
          {scenarios.map((s, i) => <TextField key={i} value={s.propertyAddress.unit} onChange={v => handleAddressChange(i, 'unit', v)} placeholder="Apt / Suite" />)}
        </InputRow>
        <InputRow label="City" count={count}>
          {scenarios.map((s, i) => <TextField key={i} value={s.propertyAddress.city} onChange={v => handleAddressChange(i, 'city', v)} placeholder="City" />)}
        </InputRow>
        <InputRow label="State" count={count}>
          {scenarios.map((s, i) => (
            <select
              key={i}
              value={s.propertyAddress.state}
              onChange={e => {
                const addr = { ...scenarios[i].propertyAddress, state: e.target.value, county: '' };
                onScenarioChange(i, 'propertyAddress', addr);
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-monarch-border rounded bg-white focus:border-monarch-navy focus:ring-1 focus:ring-monarch-navy/20 outline-none"
            >
              <option value="">Select State</option>
              {getStatesWithNames().map(st => (
                <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
              ))}
            </select>
          ))}
        </InputRow>
        <InputRow label="County" count={count}>
          {scenarios.map((s, i) => {
            const counties = s.propertyAddress.state ? getCountiesForState(s.propertyAddress.state) : [];
            return counties.length > 0 ? (
              <select
                key={i}
                value={s.propertyAddress.county}
                onChange={e => handleAddressChange(i, 'county', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-monarch-border rounded bg-white focus:border-monarch-navy focus:ring-1 focus:ring-monarch-navy/20 outline-none"
              >
                <option value="">Select County</option>
                {counties.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <TextField key={i} value={s.propertyAddress.county} onChange={v => handleAddressChange(i, 'county', v)} placeholder={s.propertyAddress.state ? 'Enter county' : 'Select state first'} />
            );
          })}
        </InputRow>
        <InputRow label="Zip Code" count={count}>
          {scenarios.map((s, i) => <TextField key={i} value={s.propertyAddress.zip} onChange={v => handleAddressChange(i, 'zip', v)} placeholder="00000" />)}
        </InputRow>
        <InputRow label="Loan Program" count={count}>
          {scenarios.map((s, i) => <SelectField key={i} label="Loan Program" value={s.loanProgram} options={LOAN_PROGRAMS.map(p => p.name)} onChange={v => onScenarioChange(i, 'loanProgram', v)} />)}
        </InputRow>
        <InputRow label="Interest Rate (%)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.interestRate} onChange={v => onScenarioChange(i, 'interestRate', v)} placeholder="e.g. 6.5" step="0.125" />)}
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
                ? <NumField key={i} value={s.downPaymentPct} onChange={v => onScenarioChange(i, 'downPaymentPct', v)} placeholder="e.g. 20" step="1" />
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
            <InputRow label="Current Loan Payoff" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance'
                ? <NumField key={i} value={s.currentLoanPayoff} onChange={v => {
                    onScenarioChange(i, 'currentLoanPayoff', v);
                    // Auto-calculate LTV when payoff and value are both entered
                    const val = typeof s.currentPropertyValue === 'number' ? s.currentPropertyValue : 0;
                    const payoff = typeof v === 'number' ? v : 0;
                    if (val > 0 && payoff > 0) {
                      onScenarioChange(i, 'ltvPct', Math.round((payoff / val) * 100 * 100) / 100);
                    }
                  }} placeholder="$0" />
                : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
              )}
            </InputRow>
            <InputRow label="Loan-to-Value (LTV %)" count={count}>
              {scenarios.map((s, i) => s.transactionType === 'Refinance'
                ? <NumField key={i} value={s.ltvPct} onChange={v => onScenarioChange(i, 'ltvPct', v)} placeholder="e.g. 75" step="1" />
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
        <InputRow label="Annual Property Tax Est." count={count}>
          {scenarios.map((s, i) => (
            <div key={i} className="space-y-1.5">
              <NumField value={s.propertyTaxRate} onChange={v => onScenarioChange(i, 'propertyTaxRate', v)} placeholder="e.g. 0.75" step="0.01" />
              <button
                type="button"
                onClick={() => handleTaxLookup(i)}
                className="w-full px-2 py-1 text-[11px] font-medium rounded bg-monarch-navy text-white hover:bg-monarch-navy/90 transition-colors"
              >
                Property Tax Lookup Est.
              </button>
              {taxLookupStatus[i] && (
                <p className="text-[10px] text-monarch-gold font-medium">{taxLookupStatus[i]}</p>
              )}
            </div>
          ))}
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
              ? <NumField key={i} value={s.miRate} onChange={v => onScenarioChange(i, 'miRate', v)} placeholder="e.g. 0.5" step="0.01" />
              : <div key={i} className="text-xs text-monarch-muted italic">N/A</div>
            )}
          </InputRow>
        )}

        <InputRow label="Seller Credit (%)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.sellerCreditPct} onChange={v => onScenarioChange(i, 'sellerCreditPct', v)} placeholder="e.g. 3" step="0.5" />)}
        </InputRow>
        <InputRow label="TQL Compliance UW Fee" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.tqlComplianceFee} onChange={v => onScenarioChange(i, 'tqlComplianceFee', v === '' ? 1795 : v as number)} />)}
        </InputRow>
        <InputRow label="TQL Lower Rate Option (%)" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.tqlLowerRateOption} onChange={v => onScenarioChange(i, 'tqlLowerRateOption', v)} placeholder="e.g. 0.5" step="0.125" />)}
        </InputRow>
        <InputRow label="PITIA Reserve Months" count={count}>
          {scenarios.map((s, i) => <NumField key={i} value={s.pitiaReserveMonths} onChange={v => onScenarioChange(i, 'pitiaReserveMonths', v)} placeholder="0" />)}
        </InputRow>
      </div>

      {/* Title/Escrow Closing Cost Est. */}
      <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
        <div className="bg-monarch-navy text-white px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-wider">Title/Escrow Closing Cost Est.</span>
        </div>
        <div className="p-4">
          {scenarios.map((s, i) => {
            const atlas = s.atlasTitleResult;
            const fmt = (n: number) => n ? `$${n.toLocaleString()}` : '—';
            return (
              <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-monarch-border' : ''}`}>
                {count > 1 && <p className="text-xs font-semibold text-monarch-navy mb-2">Scenario {i + 1}</p>}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="bg-monarch-section rounded-lg p-3 min-h-[48px] flex items-center justify-center">
                      <span className="text-sm font-semibold text-monarch-navy">{atlas?.loaded ? fmt(atlas.total) : ''}</span>
                    </div>
                    <p className="text-[10px] text-monarch-muted uppercase tracking-wider mt-1">Total Cost</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-monarch-section rounded-lg p-3 min-h-[48px] flex items-center justify-center">
                      <span className="text-sm font-semibold text-monarch-navy">{atlas?.loaded ? fmt(atlas.lendersTitlePolicy) : ''}</span>
                    </div>
                    <p className="text-[10px] text-monarch-muted uppercase tracking-wider mt-1">Lender Title Policy</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-monarch-section rounded-lg p-3 min-h-[48px] flex items-center justify-center">
                      <span className="text-sm font-semibold text-monarch-navy">{atlas?.loaded ? fmt(atlas.closingEscrowFeeWithCplSearch) : ''}</span>
                    </div>
                    <p className="text-[10px] text-monarch-muted uppercase tracking-wider mt-1">Title Company Fee</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-monarch-section rounded-lg p-3 min-h-[48px] flex items-center justify-center">
                      <span className="text-sm font-semibold text-monarch-navy">{atlas?.loaded ? fmt(atlas.stateLocalRecording) : ''}</span>
                    </div>
                    <p className="text-[10px] text-monarch-muted uppercase tracking-wider mt-1">State/Local Recording</p>
                  </div>
                </div>
                {atlas?.loaded && atlas.closingFeeBreakdown && (
                  <p className="text-[10px] text-monarch-muted mb-2">{atlas.closingFeeBreakdown}</p>
                )}
                {atlas?.loaded && atlas.recordingFeeBreakdown && (
                  <p className="text-[10px] text-monarch-muted mb-2">{atlas.recordingFeeBreakdown}</p>
                )}
                {atlas?.error && <p className="text-xs text-red-500 mb-2">{atlas.error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const addr = s.propertyAddress;
                      if (!addr.state || !addr.county) { onScenarioChange(i, 'atlasTitleResult', { loaded: false, error: 'Enter state and county first' } as never); return; }
                      onScenarioChange(i, 'atlasTitleResult', { loaded: false, error: undefined } as never);
                      try {
                        const txType = s.transactionType === 'Purchase' ? 'purchase' : 'refinance';
                        const loanAmt = s.transactionType === 'Purchase'
                          ? Math.round((typeof s.purchasePrice === 'number' ? s.purchasePrice : 0) * (1 - (typeof s.downPaymentPct === 'number' ? s.downPaymentPct : 0) / 100))
                          : Math.round((typeof s.currentPropertyValue === 'number' ? s.currentPropertyValue : 0) * (typeof s.ltvPct === 'number' ? s.ltvPct : 0) / 100);
                        const salesPrice = s.transactionType === 'Purchase' ? (typeof s.purchasePrice === 'number' ? s.purchasePrice : 0) : 0;
                        const params = new URLSearchParams({
                          state: addr.state, county: addr.county,
                          loanAmount: String(loanAmt), transactionType: txType,
                          salesPrice: String(salesPrice), city: addr.city || '', address: addr.street || '',
                        });
                        const res = await fetch(`/api/atlas-title?${params}`);
                        const data = await res.json();
                        if (res.ok && data.total > 0) {
                          const closing = data.closingEscrowFeeWithCplSearch || (data.closingEscrowFee + 200);
                          const recording = data.stateLocalRecording || (data.recordingFee + data.mortgageTax);
                          onScenarioChange(i, 'atlasTitleResult', {
                            total: data.total, lendersTitlePolicy: data.lendersTitlePolicy,
                            closingEscrowFeeWithCplSearch: closing, stateLocalRecording: recording,
                            recordingFeeBreakdown: `Recording: $${data.recordingFee || 0} + Mortgage Tax: $${data.mortgageTax || 0}`,
                            closingFeeBreakdown: `Closing/Escrow: $${data.closingEscrowFee || 0} + CPL: $${data.cplFee || 50} + Search/Exam: $${data.searchExamFee || 150}`,
                            loaded: true,
                          });
                        } else {
                          onScenarioChange(i, 'atlasTitleResult', { loaded: false, error: data.error || 'No results', total: 0, lendersTitlePolicy: 0, closingEscrowFeeWithCplSearch: 0, stateLocalRecording: 0, recordingFeeBreakdown: '', closingFeeBreakdown: '' });
                        }
                      } catch {
                        onScenarioChange(i, 'atlasTitleResult', { loaded: false, error: 'Network error', total: 0, lendersTitlePolicy: 0, closingEscrowFeeWithCplSearch: 0, stateLocalRecording: 0, recordingFeeBreakdown: '', closingFeeBreakdown: '' });
                      }
                    }}
                    className="px-4 py-2 bg-monarch-navy text-white text-xs font-medium rounded-lg hover:bg-monarch-navy/90 transition-colors"
                  >
                    Get Atlas Title Fee Quote
                  </button>
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 border-2 border-monarch-navy/30 text-monarch-navy/30 text-xs font-medium rounded-lg cursor-not-allowed"
                  >
                    Get Fluid Fees
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents Received & Reviewed (for Pre-Approval) */}
      <div className="bg-white border border-monarch-border rounded-lg overflow-hidden">
        <div className="bg-monarch-navy text-white px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-wider">Documents Received & Reviewed</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-monarch-muted mb-3">Select qualifying documents reviewed for Pre-Approval letter:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOCS_RECEIVED_OPTIONS.map(doc => {
              const checked = scenarios[0]?.docsReceived?.includes(doc) ?? false;
              return (
                <label key={doc} className="flex items-center gap-2 px-3 py-2 rounded border border-monarch-border/50 hover:bg-monarch-section cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      scenarios.forEach((s, i) => {
                        const current = s.docsReceived || [];
                        const updated = checked ? current.filter(d => d !== doc) : [...current, doc];
                        onScenarioChange(i, 'docsReceived', updated);
                      });
                    }}
                    className="w-4 h-4 rounded border-monarch-border text-monarch-navy focus:ring-monarch-gold accent-monarch-navy"
                  />
                  <span className="text-xs text-monarch-navy">{doc}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {count < 3 && (
          <button
            onClick={onAddScenario}
            className="flex-1 py-3 border-2 border-dashed border-monarch-gold/40 rounded-lg text-sm font-medium text-monarch-gold hover:border-monarch-gold hover:bg-monarch-gold/5 transition-colors"
          >
            + Add Scenario
          </button>
        )}
        {scenarios.map((s, i) => (
          s.transactionType === 'Purchase' && (
            <button
              key={i}
              onClick={() => generatePreApproval(s, preparedFor, loanOfficer)}
              className="flex-1 py-3 bg-monarch-navy text-white rounded-lg text-sm font-medium hover:bg-monarch-navy/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Generate Pre-Approval{count > 1 ? ` (S${i + 1})` : ''}
            </button>
          )
        ))}
      </div>
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
