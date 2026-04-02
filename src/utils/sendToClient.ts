import type { QuoteResult, PreparedFor, LoanOfficerInfo } from '../types';
import { displayOrBlank, displayRate } from './displayOrBlank';

const LOGO_URL_PLACEHOLDER = '{{LOGO_URL}}';

function buildEmailHtml(
  result: QuoteResult,
  preparedFor: PreparedFor,
  loanOfficer: LoanOfficerInfo,
  personalMessage: string,
  logoUrl: string,
): string {
  const navy = '#0D3B66';
  const gold = '#C9A84C';
  const bg = '#F4F5EE';
  const border = '#e5e7eb';
  const muted = '#6b7280';
  const d = (v: number) => displayOrBlank(v, 'currency');

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
<table cellpadding="0" cellspacing="0" border="0" width="560" style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;border:1px solid ${border};border-radius:8px;overflow:hidden">
  <tr><td style="background:${navy};padding:14px 20px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td><img src="${logoUrl}" alt="Total Quality Lending" width="140" style="display:block" /></td>
      <td style="text-align:right;vertical-align:middle"><span style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;letter-spacing:1px">QUOTE LAB</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:20px 20px 16px;background:#fff;font-size:13px;color:#333;line-height:1.6">${msgHtml}</td></tr>
  <tr><td style="background:${bg};padding:10px 20px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="font-size:11px;color:${muted};text-transform:uppercase;letter-spacing:0.5px">Prepared for</td>
      <td style="text-align:right;font-size:13px;font-weight:600;color:${navy}">${preparedFor.name || '—'}</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:0 20px 20px;background:#fff">
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
      ${showMi ? row('MI', d(result.mortgageInsuranceMonthly)) : ''}
      ${row('HOA', d(result.hoaMonthly))}
      ${starRow('TOTAL MONTHLY', d(result.totalMonthlyPayment))}
      ${section('Cash to Close')}
      ${starRow('Estimated Cash to Close', d(result.estimatedCashToClose))}
      ${row('PITIA Reserves', d(result.pitiaReserves))}
    </table>
  </td></tr>
  <tr><td style="padding:12px 20px;background:${bg};font-size:10px;color:${muted};line-height:1.5">
    This estimate is for informational purposes only and does not constitute a loan commitment or pre-approval.
  </td></tr>
  <tr><td style="background:${navy};padding:16px 20px">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td><img src="${logoUrl}" alt="TQL" width="100" style="display:block;opacity:0.8" /></td>
      <td style="text-align:right;vertical-align:middle">
        ${loLine ? `<span style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:600">${loLine}</span><br/>` : ''}
        ${nmlsLine ? `<span style="color:rgba(255,255,255,0.6);font-size:11px">${nmlsLine}</span>` : ''}
      </td>
    </tr></table>
  </td></tr>
</table>`;
}

export async function sendQuoteToClient(
  result: QuoteResult,
  preparedFor: PreparedFor,
  loanOfficer: LoanOfficerInfo,
  subject?: string,
): Promise<{ success: boolean; message: string }> {
  if (!preparedFor.email) {
    return { success: false, message: 'Client email is required. Enter it in the Prepared For section.' };
  }

  const logoUrl = `${window.location.origin}/tql-logo.png`;
  const defaultMsg = `Thank you for taking the time to speak with me, I have included the payment estimate information below. Please let me know if you have any questions.\n\nThank you,\n${loanOfficer.name || 'Your Loan Officer'}`;

  // Replace placeholder with actual URL
  const html = buildEmailHtml(result, preparedFor, loanOfficer, defaultMsg, logoUrl)
    .replace(new RegExp(LOGO_URL_PLACEHOLDER, 'g'), logoUrl);

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: preparedFor.email,
        subject: subject || `Quote Results for: ${preparedFor.name?.split(' ')[0] || 'Client'}, from ${loanOfficer.name?.split(' ')[0] || 'TQL'}`,
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
