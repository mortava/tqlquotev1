import type { ScenarioInput, QuoteResult } from '../types';
import { LOAN_PROGRAMS, isConventionalProgram, formatAddress } from '../types';

function num(v: number | ''): number {
  return v === '' ? 0 : v;
}

/** Convert user-entered percentage (e.g. 6.5) to decimal (0.065) */
function pct(v: number | ''): number {
  return num(v) / 100;
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
  const isConv = isConventionalProgram(s.loanProgram);
  const rate = pct(s.interestRate); // 6.5 → 0.065

  // Price/Value
  const priceOrValue = isPurchase ? num(s.purchasePrice) : num(s.currentPropertyValue);

  // Down Payment / Payoff
  const dpPct = pct(s.downPaymentPct); // 20 → 0.20
  const downPaymentOrPayoff = priceOrValue === 0
    ? 0
    : isPurchase
      ? priceOrValue * dpPct
      : num(s.currentLoanPayoff);

  // Base Loan Amount
  const ltvPctDecimal = pct(s.ltvPct); // 75 → 0.75
  let baseLoanAmount = 0;
  if (priceOrValue > 0) {
    if (isPurchase) {
      baseLoanAmount = priceOrValue - downPaymentOrPayoff;
    } else {
      baseLoanAmount = num(s.currentPropertyValue) * ltvPctDecimal;
    }
  }

  // LTV (as decimal for display)
  const ltv = priceOrValue === 0 ? 0 : baseLoanAmount / priceOrValue;

  // Loan w/ UFMIP (only for Conventional)
  const loanWithUfmip = isConv ? baseLoanAmount * 1.0175 : 0;

  // Payment Type — auto-determined from loan program
  const paymentType = s.loanProgram === '' ? '' : isIO ? 'Interest Only' : 'Principal and Interest';

  // Auto-calculate P&I based on loan amount, rate, and program term
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
  const taxRateDecimal = pct(s.propertyTaxRate); // 0.75 → 0.0075
  const taxesMonthly = priceOrValue * taxRateDecimal / 12;
  const miRateDecimal = pct(s.miRate); // 0.5 → 0.005
  const mortgageInsuranceMonthly = isConv ? miRateDecimal * baseLoanAmount / 12 : 0;
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
      ? `${num(s.downPaymentPct).toFixed(0)}%`
      : `${num(s.ltvPct).toFixed(0)}%`;

  // Closing costs
  const tqlFlatFee = baseLoanAmount * 0.0109;
  const tqlProcessingFee = s.tqlComplianceFee;
  const lowerRateDecimal = pct(s.tqlLowerRateOption);
  const tqlLowerRateDiscount = baseLoanAmount * lowerRateDecimal;

  // Taxes/Insurance Escrow Setup = 2 months of taxes + 2 months insurance
  const taxInsEscrowSetup = (taxesMonthly * 2) + (insuranceMonthly * 2);

  const sellerCreditDecimal = pct(s.sellerCreditPct);
  const sellerCredit = priceOrValue === 0 ? 0 : priceOrValue * sellerCreditDecimal * -1;

  // Atlas title fees if loaded
  const atlas = s.atlasTitleResult;
  const atlasTotalFees = atlas?.loaded ? atlas.total : 0;

  let estimatedCashToClose = 0;
  if (priceOrValue > 0) {
    if (isPurchase) {
      estimatedCashToClose = downPaymentOrPayoff + tqlFlatFee + tqlProcessingFee + tqlLowerRateDiscount + taxInsEscrowSetup + atlasTotalFees + sellerCredit;
    } else {
      estimatedCashToClose = baseLoanAmount - taxInsEscrowSetup - atlasTotalFees - sellerCredit - num(s.currentLoanPayoff) - tqlProcessingFee - tqlFlatFee;
    }
  }

  const pitiaReserves = totalMonthlyPayment * num(s.pitiaReserveMonths);
  const potentialAnnualIncome = monthlyNetCashFlow * 12;

  return {
    propertyAddress: formatAddress(s.propertyAddress),
    loanProgram: s.loanProgram,
    creditScore: s.creditScoreRange,
    propertyType: s.propertyType,
    occupancy: s.occupancy,
    downPaymentOrLtv,
    transactionType: s.transactionType,
    isConventional: isConv,
    priceOrValue,
    downPaymentOrPayoff,
    baseLoanAmount,
    ltv,
    loanWithUfmip,
    cashOutAmount: num(s.cashOutAmount),
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
    potentialAnnualIncome,
    partnerForLife: s.transactionType === '' ? '' : 'YES',
    tqlFlatFee,
    tqlProcessingFee,
    tqlLowerRateDiscount,
    taxInsEscrowSetup,
    sellerCredit,
    estimatedCashToClose,
    pitiaReserves,
  };
}
