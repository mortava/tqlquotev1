import { useState } from 'react';
import type { QuoteResult, PreparedFor } from '../../../types';
import { displayOrBlank, displayRate } from '../../../utils/displayOrBlank';

interface Props {
  result: QuoteResult;
  preparedFor: PreparedFor;
  scenarioIndex: number;
}

export default function EmailLayout({ result, preparedFor, scenarioIndex }: Props) {
  const [copied, setCopied] = useState(false);
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

    return `
<table cellpadding="0" cellspacing="0" border="0" width="520" style="font-family:'Segoe UI',Arial,Helvetica,sans-serif;max-width:520px;border:1px solid ${border};border-radius:8px;overflow:hidden">
  <tr><td colspan="2" style="background:${navy};padding:16px 16px 12px">
    <span style="color:${gold};font-size:18px;font-weight:700;letter-spacing:-0.5px">TQL</span>
    <span style="color:rgba(255,255,255,0.8);font-size:13px;margin-left:6px">Payment Estimate</span>
  </td></tr>
  <tr><td colspan="2" style="background:${bg};padding:12px 16px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="font-size:12px;color:${muted}">Prepared for</td>
        <td style="text-align:right;font-size:13px;font-weight:600;color:${navy}">${preparedFor.name || '—'}</td>
      </tr>
      ${preparedFor.email ? `<tr><td></td><td style="text-align:right;font-size:12px;color:${muted}">${preparedFor.email}</td></tr>` : ''}
      ${preparedFor.phone ? `<tr><td></td><td style="text-align:right;font-size:12px;color:${muted}">${preparedFor.phone}</td></tr>` : ''}
    </table>
  </td></tr>
  <tr><td colspan="2" style="padding:0 16px 16px;background:#fff">
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

      ${section('Cash to Close')}
      ${starRow('Estimated Cash to Close', d(result.estimatedCashToClose))}
      ${row('PITIA Reserves', d(result.pitiaReserves))}
    </table>
  </td></tr>
  <tr><td colspan="2" style="padding:12px 16px;background:${bg};font-size:10px;color:${muted};line-height:1.5">
    This estimate is for informational purposes only and does not constitute a loan commitment or pre-approval. Contact your loan officer for official pricing.
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
      // Fallback: write plain HTML
      await navigator.clipboard.writeText(html);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-monarch-navy">Outlook / Email Copy</h2>
          <p className="text-xs text-monarch-muted">Scenario {scenarioIndex + 1} — Copies clean HTML that renders in Outlook, Gmail, and all email clients</p>
        </div>
        <button
          onClick={handleCopy}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-monarch-navy text-white hover:bg-monarch-navy/90'
          }`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy for Email
            </>
          )}
        </button>
      </div>

      {/* Live preview */}
      <div className="bg-white border border-monarch-border rounded-lg p-6 max-w-[560px]">
        <div dangerouslySetInnerHTML={{ __html: buildHtml() }} />
      </div>

      <p className="text-xs text-monarch-muted">
        Paste directly into Outlook (Ctrl+V) or Gmail compose. The formatting will be preserved.
      </p>
    </div>
  );
}
