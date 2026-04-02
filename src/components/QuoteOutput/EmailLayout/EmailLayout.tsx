import { useState } from 'react';
import type { QuoteResult, PreparedFor, LoanOfficerInfo } from '../../../types';
import { displayOrBlank, displayRate } from '../../../utils/displayOrBlank';

interface Props {
  result: QuoteResult;
  preparedFor: PreparedFor;
  loanOfficer: LoanOfficerInfo;
  scenarioIndex: number;
}

const LOGO_URL = `${window.location.origin}/tql-logo.png`;

export default function EmailLayout({ result, preparedFor, loanOfficer, scenarioIndex }: Props) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState(`Quote Results for: ${preparedFor.name?.split(' ')[0] || 'Client'}, from ${loanOfficer.name?.split(' ')[0] || 'TQL'}`);
  const [personalMessage, setPersonalMessage] = useState(
    `Thank you for taking the time to speak with me this afternoon, I have included the information that we spoke about below. Please let me know if you have any questions.\n\nThank you,\n${loanOfficer.name || 'Your Loan Officer'}`
  );

  const d = (v: number, fmt: 'currency' | 'percent' | 'ratio' = 'currency') => displayOrBlank(v, fmt);

  function buildHtml(): string {
    const navy = '#0D3B66';
    const gold = '#C9A84C';
    const bg = '#F4F5EE';
    const border = '#e5e7eb';
    const muted = '#6b7280';

    const row = (label: string, value: string) =>
      value ? `<tr><td style="padding:6px 12px;color:${muted};font-size:13px;border-bottom:1px solid ${border}">${label}</td><td style="padding:6px 12px;text-align:right;font-size:13px;border-bottom:1px solid ${border}">${value}</td></tr>` : '';

    const starRow = (label: string, value: string) =>
      `<tr style="background:rgba(201,168,76,0.08)"><td style="padding:8px 12px;font-weight:700;color:${navy};font-size:13px;border-bottom:1px solid ${gold}40"><span style="color:${gold}">&#9733;</span> ${label}</td><td style="padding:8px 12px;text-align:right;font-weight:700;color:${navy};font-size:14px;border-bottom:1px solid ${gold}40">${value}</td></tr>`;

    const section = (label: string) =>
      `<tr><td colspan="2" style="padding:14px 12px 6px;font-size:11px;font-weight:700;color:${navy};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid ${border}">${label}</td></tr>`;

    const showMi = result.isConventional;
    const msgHtml = personalMessage.replace(/\n/g, '<br/>');

    const loLine = [loanOfficer.name, loanOfficer.phone, loanOfficer.email].filter(Boolean).join(' | ');
    const nmlsLine = loanOfficer.nmlsNumber ? `NMLS# ${loanOfficer.nmlsNumber}` : '';

    return `
<table cellpadding="0" cellspacing="0" border="0" width="560" style="font-family:'Segoe UI',Arial,Helvetica,sans-serif;max-width:560px;border:1px solid ${border};border-radius:8px;overflow:hidden">
  <!-- HEADER: Logo + CLEAR QUOTE + Prepared For -->
  <tr><td style="background:#fff;padding:16px 20px;border-bottom:3px solid ${navy}">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="vertical-align:middle"><img src="${LOGO_URL}" alt="Total Quality Lending" width="120" style="display:block" /></td>
      <td style="vertical-align:middle;padding-left:14px">
        <span style="font-size:20px;font-weight:800;color:${navy};letter-spacing:-0.5px">CLEAR QUOTE</span><br/>
        <span style="font-size:11px;color:${muted};font-style:italic">Clarity in the Costs&trade;</span>
      </td>
      <td style="text-align:right;vertical-align:top">
        <span style="font-size:10px;font-weight:700;color:${navy};text-transform:uppercase;letter-spacing:1px">Prepared For</span><br/>
        <span style="font-size:13px;font-weight:600;color:${navy}">${preparedFor.name || ''}</span><br/>
        <span style="font-size:11px;color:${muted}">${preparedFor.email || ''}</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Personal message -->
  <tr><td style="padding:20px 20px 16px;background:#fff;font-size:13px;color:#333;line-height:1.6">
    ${msgHtml}
  </td></tr>

  <!-- Prepared for bar -->
  <tr><td style="background:${bg};padding:10px 20px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="font-size:11px;color:${muted};text-transform:uppercase;letter-spacing:0.5px">Prepared for</td>
        <td style="text-align:right;font-size:13px;font-weight:600;color:${navy}">${preparedFor.name || '—'}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Quote body -->
  <tr><td style="padding:0 20px 20px;background:#fff">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${section('Property & Loan')}
      ${row('Property Address', result.propertyAddress || 'TBD')}
      ${row('Transaction Type', result.transactionType)}
      ${row('Loan Program', result.loanProgram)}
      ${row('Credit Score', result.creditScore)}
      ${row('Property Type', result.propertyType)}
      ${row('Occupancy', result.occupancy)}
      ${row('Down Payment / LTV', result.downPaymentOrLtv)}

      ${section('Loan Amounts')}
      ${row('Price / Value', d(result.priceOrValue))}
      ${row('Base Loan Amount', d(result.baseLoanAmount))}
      ${result.cashOutAmount > 0 ? row('Cash Out Amount', d(result.cashOutAmount)) : ''}
      ${showMi ? row('Loan w/ UFMIP', d(result.loanWithUfmip)) : ''}

      ${section('Monthly Payment')}
      ${row('Interest Rate', displayRate(result.bestRate))}
      ${row('Payment Type', result.paymentType)}
      ${row('P&I / Interest Only', d(result.principalAndInterest))}
      ${row('Insurance', d(result.insuranceMonthly))}
      ${row('Taxes', d(result.taxesMonthly))}
      ${showMi ? row('MI', d(result.mortgageInsuranceMonthly)) : ''}
      ${row('HOA', d(result.hoaMonthly))}
      ${starRow('TOTAL MONTHLY', d(result.totalMonthlyPayment))}

      ${section('Investment Analysis')}
      ${row('Monthly Rents', d(result.monthlyRents))}
      ${row('DSCR Ratio', d(result.dscrRatio, 'ratio'))}
      ${row('Net Cash Flow / Month', d(result.monthlyNetCashFlow))}
      ${row('Potential Annual Income', d(result.potentialAnnualIncome))}

      ${section('Cash to Close')}
      ${starRow('Estimated Cash to Close', d(result.estimatedCashToClose))}
      ${row('PITIA Reserves', d(result.pitiaReserves))}
    </table>
  </td></tr>

  <!-- Disclaimer -->
  <tr><td style="padding:12px 20px;background:${bg};font-size:10px;color:${muted};line-height:1.5">
    This estimate is for informational purposes only and does not constitute a loan commitment or pre-approval. Contact your loan officer for official pricing.
  </td></tr>

  <!-- Footer with logo + LO info -->
  <tr><td style="background:${navy};padding:16px 20px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td><img src="${LOGO_URL}" alt="Total Quality Lending" width="100" style="display:block;opacity:0.8" /></td>
      <td style="text-align:right;vertical-align:middle">
        ${loLine ? `<span style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:600">${loLine}</span><br/>` : ''}
        ${nmlsLine ? `<span style="color:rgba(255,255,255,0.6);font-size:11px">${nmlsLine}</span>` : ''}
      </td>
    </tr></table>
  </td></tr>
</table>`.trim();
  }

  async function handleCopy() {
    const html = buildHtml();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(html);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-monarch-navy">Email Quote</h2>
          <p className="text-xs text-monarch-muted">Scenario {scenarioIndex + 1} — Clean HTML for Outlook, Gmail, all email clients</p>
        </div>
        <button
          onClick={handleCopy}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            copied ? 'bg-green-600 text-white' : 'bg-monarch-navy text-white hover:bg-monarch-navy/90'
          }`}
        >
          {copied ? (
            <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Copied!</>
          ) : (
            <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy for Email</>
          )}
        </button>
      </div>

      {/* Subject & Personal Message */}
      <div className="bg-white border border-monarch-border rounded-lg p-4 space-y-3 max-w-[560px]">
        <div>
          <label className="text-xs font-semibold text-monarch-navy uppercase tracking-wider">Subject Line</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold focus:border-monarch-gold outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-monarch-navy uppercase tracking-wider">Personal Message</label>
          <textarea
            value={personalMessage}
            onChange={e => setPersonalMessage(e.target.value)}
            rows={5}
            className="w-full mt-1 px-3 py-2 text-sm border border-monarch-border rounded focus:ring-1 focus:ring-monarch-gold focus:border-monarch-gold outline-none resize-y"
            style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-white border border-monarch-border rounded-lg p-6 max-w-[600px]">
        <div dangerouslySetInnerHTML={{ __html: buildHtml() }} />
      </div>

      <p className="text-xs text-monarch-muted">
        Paste directly into Outlook (Ctrl+V) or Gmail compose. Use "Send to Client" button in the nav to email directly.
      </p>
    </div>
  );
}
