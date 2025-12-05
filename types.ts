
export interface LoanParams {
  amount: number;
  rateType: 'monthly' | 'annual';
  rateValue: number; // Percentage
  term: number; // Months
  termUnit: 'months' | 'years';
  gracePeriod: number; // Months
  graceType: 'partial' | 'total'; // partial = interest only, total = capitalization (no payment)
  graceDays: number; // Shift payment date by N days
  insurance: number; // Percentage of balance per month
  fixedFee: number; // Fixed monthly fee
  
  // Extra Payment / Prepayment fields
  paidInstallments: number; // Number of installments already paid (Current status)
  extraPaymentAmount: number;
  extraPaymentMonth: number;
  extraPaymentStrategy: 'reduce_term' | 'reduce_quota';
}

export interface PaymentRow {
  period: number;
  date: string; // ISO string or formatted date
  interest: number;
  amortization: number;
  insurance: number;
  fee: number;
  payment: number;
  balance: number;
  extraPayment?: number; // Visual indicator for extra payment
}

export interface CalculationResult {
  schedule: PaymentRow[];
  startDate: string; // Formatted disbursement date
  summary: {
    totalInterest: number;
    totalPayment: number;
    monthlyRate: number;
    annualRate: number; // TEA
    firstPayment: number; // The original scheduled payment
    regularPayment: number; // The current/final scheduled payment
    newTerm?: number; // Actual term if reduced
  };
}

export enum AppTab {
  CALCULATOR = 'calculator',
  SCHEDULE = 'schedule',
  ADVISOR = 'advisor',
}