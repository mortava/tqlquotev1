import type { QuoteResult, PreparedFor, LoanOfficerInfo } from '../types';
import { displayOrBlank, displayRate } from './displayOrBlank';

export async function sendQuoteToClient(
  result: QuoteResult,
  preparedFor: PreparedFor,
  loanOfficer: LoanOfficerInfo,
): Promise<{ success: boolean; message: string }> {
  if (!preparedFor.email) {
    return { success: false, message: 'Client email is required. Enter it in the Prepared For section.' };
  }

  const d = (v: number) => displayOrBlank(v, 'currency');
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

  const html = `
<table cellpadding="0" cellspacing="0" border="0" width="520" style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;border:1px solid ${border};border-radius:8px;overflow:hidden">
  <tr><td colspan="2" style="background:${navy};padding:16px"><span style="color:#fff;font-size:18px;font-weight:700">TQL</span><span style="color:rgba(255,255,255,0.8);font-size:13px;margin-left:6px">Payment Estimate</span></td></tr>
  <tr><td colspan="2" style="background:${bg};padding:12px 16px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-size:12px;color:${muted}">Prepared for</td><td style="text-align:right;font-weight:600;color:${navy}">${preparedFor.name || '—'}</td></tr>
    </table>
  </td></tr>
  <tr><td colspan="2" style="padding:0 16px 16px;background:#fff">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${section('Property & Loan')}
      ${row('Property Address', result.propertyAddress || 'TBD')}
      ${row('Loan Program', result.loanProgram)}
      ${row('Transaction Type', result.transactionType)}
      ${section('Monthly Payment')}
      ${row('Interest Rate', displayRate(result.bestRate))}
      ${row('P&I / IO', d(result.principalAndInterest))}
      ${row('Insurance', d(result.insuranceMonthly))}
      ${row('Taxes', d(result.taxesMonthly))}
      ${row('HOA', d(result.hoaMonthly))}
      ${starRow('TOTAL MONTHLY', d(result.totalMonthlyPayment))}
      ${section('Cash to Close')}
      ${starRow('Estimated Cash to Close', d(result.estimatedCashToClose))}
      ${row('PITIA Reserves', d(result.pitiaReserves))}
    </table>
  </td></tr>
  <tr><td colspan="2" style="padding:12px 16px;background:${bg};font-size:10px;color:${muted};line-height:1.5">
    This estimate is for informational purposes only and does not constitute a loan commitment or pre-approval.
    <br/><br/>
    ${loanOfficer.name ? `<strong>${loanOfficer.name}</strong> | ` : ''}${loanOfficer.phone ? `${loanOfficer.phone} | ` : ''}${loanOfficer.email || ''}
    ${loanOfficer.nmlsNumber ? `<br/>NMLS# ${loanOfficer.nmlsNumber}` : ''}
  </td></tr>
</table>`;

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: preparedFor.email,
        subject: `TQL Payment Estimate — ${preparedFor.name || 'Client'}`,
        html,
      }),
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: `Email sent to ${preparedFor.email}` };
    return { success: false, message: data.error || 'Failed to send email' };
  } catch {
    return { success: false, message: 'Network error — could not send email' };
  }
}
