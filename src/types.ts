export interface PreparedFor {
  name: string;
  email: string;
  phone: string;
}

export interface PropertyAddress {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
}

export interface ScenarioInput {
  transactionType: '' | 'Purchase' | 'Refinance';
  propertyAddress: PropertyAddress;
  loanProgram: string;
  interestRate: number | '';
  creditScoreRange: string;
  propertyType: string;
  occupancy: string;
  incomeDocumentation: string;
  prePaymentPenalty: string;
  // Purchase
  purchasePrice: number | '';
  downPaymentPct: number | '';
  // Refinance
  refinanceType: '' | 'Rate & Term' | 'Cash Out Refinance';
  currentPropertyValue: number | '';
  ltvPct: number | '';
  currentLoanPayoff: number | '';
  cashOutAmount: number | '';
  // Costs
  insuranceAnnual: number | '';
  propertyTaxRate: number | '';
  hoaDuesMonthly: number | '';
  monthlyRents: number | '';
  miRate: number | '';
  sellerCreditPct: number | '';
  escrowTitleFee: number | '';
  tqlComplianceFee: number;
  tqlLowerRateOption: number | '';
  discountPoints: number | '';
  pitiaReserveMonths: number | '';
}

export interface QuoteResult {
  propertyAddress: string;
  loanProgram: string;
  creditScore: string;
  propertyType: string;
  occupancy: string;
  downPaymentOrLtv: string;
  transactionType: string;
  isConventional: boolean;
  // Loan details
  priceOrValue: number;
  downPaymentOrPayoff: number;
  baseLoanAmount: number;
  ltv: number;
  loanWithUfmip: number;
  // Payment
  bestRate: number;
  paymentType: string;
  principalAndInterest: number;
  insuranceMonthly: number;
  taxesMonthly: number;
  mortgageInsuranceMonthly: number;
  hoaMonthly: number;
  totalMonthlyPayment: number;
  grossAnnualRevenue: number;
  // Investment
  monthlyRents: number;
  dscrRatio: number;
  monthlyNetCashFlow: number;
  prePaymentPenalty: string;
  // Closing costs
  partnerForLife: string;
  tqlFlatFee: number;
  tqlProcessingFee: number;
  tqlLowerRateDiscount: number;
  thirdPartyClosingCosts: number;
  thirdPartyCertifications: number;
  titleFees: number;
  prepaids: number;
  escrowAtClosing: number;
  sellerCredit: number;
  estimatedCashToClose: number;
  pitiaReserves: number;
  discountPointsFee: number;
}

export type ActiveView = 'inputs' | 'quote';
export type OutputLayout = 'screen' | 'print' | 'email';

export interface LoanOfficerInfo {
  name: string;
  date: string;
  nmlsNumber: string;
}

export interface AppState {
  activeView: ActiveView;
  outputLayout: OutputLayout;
  emailScenarioIndex: number;
  preparedFor: PreparedFor;
  loanOfficer: LoanOfficerInfo;
  scenarios: ScenarioInput[];
}

export const LOAN_PROGRAMS: { name: string; termMonths: number; type: 'Fixed' | 'IO' }[] = [
  { name: 'Conventional 40 Year Fixed', termMonths: 480, type: 'Fixed' },
  { name: 'Conventional 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'Conventional 20 Year Fixed', termMonths: 240, type: 'Fixed' },
  { name: 'Conventional 15 Year Fixed', termMonths: 180, type: 'Fixed' },
  { name: 'FHA 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'DSCR 40 Year Fixed', termMonths: 480, type: 'Fixed' },
  { name: 'DSCR 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'DSCR 20 Year Fixed', termMonths: 240, type: 'Fixed' },
  { name: 'DSCR 15 Year Fixed', termMonths: 180, type: 'Fixed' },
  { name: 'DSCR 40 Year Fixed IO', termMonths: 480, type: 'IO' },
  { name: 'DSCR 30 Year Fixed IO', termMonths: 360, type: 'IO' },
  { name: 'DSCR 20 Year Fixed IO', termMonths: 240, type: 'IO' },
  { name: 'DSCR 15 Year Fixed IO', termMonths: 180, type: 'IO' },
  { name: 'Foreign National DSCR 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'Full Doc 40 Year Fixed', termMonths: 480, type: 'Fixed' },
  { name: 'Full Doc 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'Full Doc 20 Year Fixed', termMonths: 240, type: 'Fixed' },
  { name: 'Full Doc 15 Year Fixed', termMonths: 180, type: 'Fixed' },
  { name: 'Full Doc 40 Year Fixed IO', termMonths: 480, type: 'IO' },
  { name: 'Full Doc 30 Year Fixed IO', termMonths: 360, type: 'IO' },
  { name: 'Full Doc 20 Year Fixed IO', termMonths: 240, type: 'IO' },
  { name: 'Full Doc 15 Year Fixed IO', termMonths: 180, type: 'IO' },
  { name: 'VA 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'Bank Statement 30 Year Fixed', termMonths: 360, type: 'Fixed' },
  { name: 'Alt Doc 30 Year Fixed', termMonths: 360, type: 'Fixed' },
];

export const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export const PROPERTY_TYPES = ['SFR', 'Duplex (2 Units)', 'Triplex (3 Units)', 'Quadplex (4 Units)', '5-9 Unit', 'Condo', 'Condotel', 'Townhome', 'Manufactured'];
export const OCCUPANCY_TYPES = ['Primary', '2nd Home', 'Investment'];
export const CREDIT_SCORE_RANGES = ['780+', '760-779', '740-759', '720-739', '700-719', '680-699', '660-679', '640-659', '620-639', '600-619', '580-599', '<579'];
export const INCOME_DOC_TYPES = ['NONE/Property Cash-Flow', 'Full Documentation', 'Bank Statements', 'Alt Documentation'];
export const PPP_OPTIONS = ['0 Yr PPP', '1 YR PPP', '2 YR PPP', '3 YR PPP', '4 YR PPP', '5 YR PPP'];

export function isConventionalProgram(program: string): boolean {
  return program.startsWith('Conv');
}

export function emptyAddress(): PropertyAddress {
  return { street: '', unit: '', city: '', state: '', zip: '' };
}

export function formatAddress(addr: PropertyAddress): string {
  const parts = [addr.street, addr.unit, addr.city, addr.state, addr.zip].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '';
}

export function emptyScenario(): ScenarioInput {
  return {
    transactionType: '',
    propertyAddress: emptyAddress(),
    loanProgram: '',
    interestRate: '',
    creditScoreRange: '',
    propertyType: '',
    occupancy: '',
    incomeDocumentation: '',
    prePaymentPenalty: '',
    purchasePrice: '',
    downPaymentPct: '',
    refinanceType: '',
    currentPropertyValue: '',
    ltvPct: '',
    currentLoanPayoff: '',
    cashOutAmount: '',
    insuranceAnnual: '',
    propertyTaxRate: '',
    hoaDuesMonthly: '',
    monthlyRents: '',
    miRate: '',
    sellerCreditPct: '',
    escrowTitleFee: '',
    tqlComplianceFee: 1795,
    tqlLowerRateOption: '',
    discountPoints: '',
    pitiaReserveMonths: '',
  };
}
