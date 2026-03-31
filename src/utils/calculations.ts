import type { ScenarioInput, QuoteResult } from '../types';
import { LOAN_PROGRAMS } from '../types';

function num(v: number | ''): number {
  return v === '' ? 0 : v;
}

function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return nper === 0 ? 0 : -pv / nper;
  const x = Math.pow(1 + rate, nper);
  return -(pv * rate * x) / (x - 1);
}

function getLoanProgramInfo(programName: string) {
  return LOAN_PROGRAMS.find(p => p.name === programName) ?? { termMonths: 360, type: 'Fixed' as const };
}

export function calculateQuote(s: ScenarioInput): QuoteResult {
  const program = getLoanProgramInfo(s.loanProgram);
  const isIO = program.type === 'IO';
  const isPurchase = s.transactionType === 'Purchase';
  const rate = num(s.interestRate);

  // Price/Value
  const priceOrValue = isPurchase ? num(s.purchasePrice) : num(s.currentPropertyValue);

  // Down Payment / Payoff
  const downPaymentOrPayoff = priceOrValue === 0
    ? 0
    : isPurchase
      ? priceOrValue * num(s.downPaymentPct)
      : num(s.currentLoanPayoff);

  // Base Loan Amount
  const baseLoanAmount = priceOrValue === 0
    ? 0
    : isPurchase
      ? priceOrValue - downPaymentOrPayoff
      : num(s.currentPropertyValue) * num(s.ltvPct);

  // LTV
  const ltv = priceOrValue === 0 ? 0 : baseLoanAmount / priceOrValue;

  // Loan w/ UFMIP
  const loanWithUfmip = baseLoanAmount * 1.0175;

  // Payment Type
  const paymentType = s.loanProgram === '' ? '' : isIO ? 'Interest Only' : 'Principal and Interest';

  // P&I or IO Payment
  let principalAndInterest = 0;
  if (baseLoanAmount > 0 && rate > 0) {
    if (isIO) {
      principalAndInterest = baseLoanAmount * (rate / 12);
    } else {
      principalAndInterest = Math.abs(pmt(rate / 12, program.termMonths, -baseLoanAmount));
    }
  }

  // Monthly breakdowns
  const insuranceMonthly = num(s.insuranceAnnual) / 12;
  const taxesMonthly = priceOrValue * num(s.propertyTaxRate) / 12;
  const mortgageInsuranceMonthly = num(s.miRate) * baseLoanAmount / 12;
  const hoaMonthly = num(s.hoaDuesMonthly);

  const totalMonthlyPayment = principalAndInterest + insuranceMonthly + taxesMonthly + mortgageInsuranceMonthly + hoaMonthly;
  const grossAnnualRevenue = num(s.monthlyRents) * 12;

  // Investment
  const monthlyRents = num(s.monthlyRents);
  const dscrRatio = totalMonthlyPayment === 0 ? 0 : monthlyRents / totalMonthlyPayment;
  const monthlyNetCashFlow = monthlyRents - totalMonthlyPayment;

  // Down Payment / LTV display
  const downPaymentOrLtv = s.transactionType === ''
    ? ''
    : isPurchase
      ? `${(num(s.downPaymentPct) * 100).toFixed(0)}%`
      : `${(num(s.ltvPct) * 100).toFixed(0)}%`;

  // Closing costs
  const tqlFlatFee = baseLoanAmount * 0.0109;
  const tqlProcessingFee = s.tqlComplianceFee;
  const tqlLowerRateDiscount = baseLoanAmount * num(s.tqlLowerRateOption);

  // 3rd Party Certifications: Conv/FHA/VA → $350, else $695
  const isConvFhaVa = s.loanProgram.startsWith('Conv') || s.loanProgram.startsWith('FHA') || s.loanProgram.startsWith('VA');
  const thirdPartyCertifications = s.loanProgram === '' ? 0 : isConvFhaVa ? 350 : 695;

  const titleFees = num(s.escrowTitleFee);

  // Pre-Paids = annual_insurance + (taxes_monthly * 4) + (loan * rate / 365 * 5)
  const prepaids = num(s.insuranceAnnual) + (taxesMonthly * 4) + (baseLoanAmount * rate / 365 * 5);

  // Escrow at Closing = (insurance_monthly * 3) + (taxes_monthly * 4)
  const escrowAtClosing = (insuranceMonthly * 3) + (taxesMonthly * 4);

  // Seller Credit
  const sellerCredit = priceOrValue === 0 ? 0 : priceOrValue * num(s.sellerCreditPct) * -1;

  // Cash to Close
  let estimatedCashToClose = 0;
  if (priceOrValue > 0) {
    if (isPurchase) {
      estimatedCashToClose = downPaymentOrPayoff + tqlFlatFee + tqlProcessingFee + tqlLowerRateDiscount + 0 + thirdPartyCertifications + titleFees + prepaids + escrowAtClosing + sellerCredit;
    } else {
      estimatedCashToClose = baseLoanAmount - thirdPartyCertifications - titleFees - prepaids - escrowAtClosing - sellerCredit - num(s.currentLoanPayoff) - tqlProcessingFee - tqlFlatFee;
    }
  }

  // PITIA Reserves
  const pitiaReserves = totalMonthlyPayment * num(s.pitiaReserveMonths);

  // Discount Points
  const discountPointsFee = num(s.discountPoints) * baseLoanAmount;

  return {
    propertyAddress: s.propertyAddress || '',
    loanProgram: s.loanProgram,
    creditScore: s.creditScoreRange,
    propertyType: s.propertyType,
    occupancy: s.occupancy,
    downPaymentOrLtv,
    transactionType: s.transactionType,
    priceOrValue,
    downPaymentOrPayoff,
    baseLoanAmount,
    ltv,
    loanWithUfmip,
    bestRate: rate,
    paymentType,
    principalAndInterest,
    insuranceMonthly,
    taxesMonthly,
    mortgageInsuranceMonthly,
    hoaMonthly,
    totalMonthlyPayment,
    grossAnnualRevenue,
    monthlyRents,
    dscrRatio,
    monthlyNetCashFlow,
    prePaymentPenalty: s.prePaymentPenalty,
    partnerForLife: s.transactionType === '' ? '' : 'YES',
    tqlFlatFee,
    tqlProcessingFee,
    tqlLowerRateDiscount,
    thirdPartyClosingCosts: 0,
    thirdPartyCertifications,
    titleFees,
    prepaids,
    escrowAtClosing,
    sellerCredit,
    estimatedCashToClose,
    pitiaReserves,
    discountPointsFee,
  };
}
