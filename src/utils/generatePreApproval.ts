import { PDFDocument } from 'pdf-lib';
import type { ScenarioInput, PreparedFor, LoanOfficerInfo } from '../types';
import { formatAddress } from '../types';
import { calculateQuote } from './calculations';
import { displayOrBlank } from './displayOrBlank';

export async function generatePreApproval(
  scenario: ScenarioInput,
  preparedFor: PreparedFor,
  loanOfficer: LoanOfficerInfo,
): Promise<void> {
  const result = calculateQuote(scenario);
  const d = (v: number) => displayOrBlank(v, 'currency');

  // Fetch the template PDF
  const templateUrl = `${window.location.origin}/tql-preapproval-template.pdf`;
  const response = await fetch(templateUrl);
  const templateBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Fill text fields — using enableReadOnly() per TQL PDF rule (never flatten)
  const setField = (name: string, value: string) => {
    try {
      const field = form.getTextField(name);
      field.setText(value);
      field.enableReadOnly();
    } catch {
      // Field not found — skip silently
    }
  };

  // Loan Officer info
  setField('date', loanOfficer.date);
  setField('mlo name', loanOfficer.name);
  setField('lo_title', loanOfficer.title || 'Loan Officer & Advisor');
  setField('lo_nmls', loanOfficer.nmlsNumber);
  setField('lo_phone', loanOfficer.phone);
  setField('lo_email', loanOfficer.email);

  // Client / Buyer info
  setField('client', preparedFor.name);

  // Property
  const address = formatAddress(scenario.propertyAddress) || 'To Be Determined';
  setField('property_address', address);

  // Pricing
  setField('offer_price', d(result.priceOrValue));
  setField('ltv', result.downPaymentOrLtv);
  setField('max ltv', result.downPaymentOrLtv);
  setField('max_loan_amount', d(result.baseLoanAmount));

  // Loan terms
  const programParts = scenario.loanProgram.split(' ');
  const termDisplay = programParts.length >= 3
    ? `${programParts.slice(-3).join(' ')}`
    : scenario.loanProgram;
  setField('loan_type', termDisplay || '30 Year Fixed');

  // Credit qualification
  const creditDisplay = scenario.creditScoreRange
    ? `YES / ${scenario.creditScoreRange}`
    : 'YES / A+';
  setField('fico', creditDisplay);

  // Additional notes
  setField('additional_notes', '');

  // Authorized signature line
  setField('Text11', loanOfficer.name);

  // Save and download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const fileName = `TQL_PreApproval_${preparedFor.name.replace(/\s+/g, '_') || 'Client'}_${loanOfficer.date}.pdf`;
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
