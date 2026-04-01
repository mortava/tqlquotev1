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

  const templateUrl = `${window.location.origin}/tql-preapproval-template.pdf`;
  const response = await fetch(templateUrl);
  const templateBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  const setField = (name: string, value: string) => {
    try {
      const field = form.getTextField(name);
      field.setText(value);
      field.enableReadOnly();
    } catch {
      // Field not found
    }
  };

  const setCheckbox = (name: string, checked: boolean) => {
    try {
      const field = form.getCheckBox(name);
      if (checked) field.check(); else field.uncheck();
    } catch {
      // Field not found
    }
  };

  const setDropdown = (name: string, value: string) => {
    try {
      const field = form.getDropdown(name);
      field.select(value);
    } catch {
      // Field not found or value not in options
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

  // Documents Received — map selected docs to PDF checkboxes & dropdowns
  const docs = scenario.docsReceived || [];
  // PDF has 6 checkbox slots (doc_0 through doc_5) and 4 dropdown slots
  // Map doc selections to the dropdown fields
  const dropdownFields = ['Dropdown3', 'Dropdown44', 'Dropdown66', 'Dropdown55'];
  const checkboxFields = ['doc_0', 'doc_1', 'doc_2', 'doc_3', 'doc_4', 'doc_5'];

  // Map known docs to their PDF dropdown values
  const dropdownMap: Record<string, { field: string; value: string }> = {
    'Most Recent 1040 Tax Returns': { field: 'Dropdown3', value: 'Most 1040 Tax Returns' },
    'Current Pay Check Verified': { field: 'Dropdown44', value: 'Current Pay Stub' },
    'Most Recent W2': { field: 'Dropdown66', value: 'Most 1040 Tax Returns' },
    'Proof of Down Payment Funds': { field: 'Dropdown55', value: 'Proof of Down Payment Funds' },
  };

  // Check boxes for docs that have mappings
  let checkIdx = 0;
  docs.forEach(doc => {
    const mapping = dropdownMap[doc];
    if (mapping) {
      try { setDropdown(mapping.field, mapping.value); } catch { /* skip */ }
      if (checkIdx < checkboxFields.length) {
        setCheckbox(checkboxFields[checkIdx], true);
        checkIdx++;
      }
    } else if (checkIdx < checkboxFields.length) {
      setCheckbox(checkboxFields[checkIdx], true);
      checkIdx++;
    }
  });

  // Clear unused checkboxes
  for (let i = checkIdx; i < checkboxFields.length; i++) {
    setCheckbox(checkboxFields[i], false);
  }

  // Additional notes — clear
  setField('additional_notes', '');
  // Signature text field — leave empty (not LO name)
  setField('Text11', '');
  // Clear unused text/dropdown slots
  setField('Text190', '');

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
