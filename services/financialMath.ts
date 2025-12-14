
import { LoanParams, PaymentRow, CalculationResult, ScenarioMetrics } from '../types';

// Internal function to perform the calculation logic
const calculateInternal = (params: LoanParams): CalculationResult => {
  const { 
    amount, startDate: startDateString, rateType, rateValue, term, termUnit, 
    gracePeriod, graceType, graceDays, insurance, fixedFee,
    extraPaymentAmount, extraPaymentMonth, extraPaymentStrategy
  } = params;

  // 1. Normalize Term to Months
  const totalMonths = termUnit === 'years' ? term * 12 : term;

  // 2. Normalize Rate to Monthly Effective Rate (TEM)
  let monthlyRate = 0;
  let annualRate = 0;

  if (rateType === 'monthly') {
    monthlyRate = rateValue / 100;
    annualRate = Math.pow(1 + monthlyRate, 12) - 1;
  } else {
    annualRate = rateValue / 100;
    monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
  }

  // 3. Handle Grace Days Capitalization (Initial Time Value)
  const dailyRate = Math.pow(1 + monthlyRate, 1/30) - 1;
  
  let currentBalance = amount;
  const graceDaysInterest = currentBalance * (Math.pow(1 + dailyRate, graceDays) - 1);
  currentBalance += graceDaysInterest;

  const insuranceRate = insurance / 100; // Monthly % of balance

  // 4. Simulate Grace Period (Months) to find Balance at start of Amortization
  let forecastBalance = currentBalance;
  
  for (let i = 1; i <= gracePeriod; i++) {
      const interest = forecastBalance * monthlyRate;
      const insuranceAmount = forecastBalance * insuranceRate;
      if (graceType === 'total') {
          forecastBalance += interest + insuranceAmount + fixedFee;
      } 
  }

  // 5. Calculate Initial Fixed Quota
  let amortizationMonths = totalMonths - gracePeriod;
  const combinedRate = monthlyRate + insuranceRate;
  
  const calculateAnnuity = (principal: number, periods: number) => {
      if (periods <= 0) return 0;
      if (principal <= 0) return 0;
      if (combinedRate === 0) return principal / periods;
      return principal * (combinedRate * Math.pow(1 + combinedRate, periods)) / (Math.pow(1 + combinedRate, periods) - 1);
  };

  // Capture the initial quota for the summary
  let fixedAnnuityPayment = calculateAnnuity(forecastBalance, amortizationMonths);
  const initialFixedAnnuity = fixedAnnuityPayment;

  // 6. Generate Schedule
  const schedule: PaymentRow[] = [];
  let totalInterest = 0;
  let totalPaymentAccumulator = 0;
  
  // Parse Start Date accurately respecting local time
  const [year, month, day] = startDateString.split('-').map(Number);
  // Note: Month in Date constructor is 0-indexed (0=Jan, 11=Dec)
  const startDate = new Date(year, month - 1, day);
  
  // Track actual final period for summary
  let actualLastPeriod = 0;

  for (let i = 1; i <= totalMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + i);
    if (graceDays) {
      paymentDate.setDate(paymentDate.getDate() + graceDays);
    }
    
    // Check for Extra Payment triggers
    // Only allow extra payments during amortization phase
    const isExtraPaymentPeriod = (i === extraPaymentMonth) && (extraPaymentAmount > 0) && (i > gracePeriod);

    // 1. Calculate Costs based on OPENING Balance
    const interest = currentBalance * monthlyRate;
    const insuranceAmount = currentBalance * insuranceRate;
    let fee = fixedFee;

    let amortization = 0;
    let payment = 0;
    let extraPaymentApplied = 0;

    if (i <= gracePeriod) {
      // Grace Period Logic
      if (graceType === 'total') {
          // Capitalization: No payment, add costs to balance
          amortization = -(interest + insuranceAmount + fee);
          payment = 0;
          currentBalance += (interest + insuranceAmount + fee);
      } else {
          // Interest Only: Pay costs, balance stays same
          amortization = 0;
          payment = interest + insuranceAmount + fee;
      }
    } else {
      // Amortization Period
      
      // Calculate Regular Amortization for this month
      // We use the fixedAnnuityPayment (Total Quota) to determine how much goes to capital
      const regularTargetPayment = fixedAnnuityPayment + fixedFee;
      
      // Standard Amortization = Quota - Costs
      let regularAmortization = fixedAnnuityPayment - interest - insuranceAmount;

      // Handle Last Payment or Dust
      const totalTheoreticalDebt = currentBalance + interest + insuranceAmount + fee;
      
      // If balance is tiny or we are at the end, close it out
      // Or if regular amortization is enough to clear the debt
      if (currentBalance <= regularAmortization || (i === totalMonths && extraPaymentStrategy !== 'reduce_term')) {
          regularAmortization = currentBalance;
          payment = currentBalance + interest + insuranceAmount + fee;
      } else {
          payment = regularTargetPayment;
      }

      // 2. Apply Extra Payment Logic (AFTER regular amortization determination)
      if (isExtraPaymentPeriod) {
          extraPaymentApplied = extraPaymentAmount;
          
          // Cap extra payment to remaining balance AFTER regular amortization
          const remainingAfterRegular = currentBalance - regularAmortization;
          if (extraPaymentApplied > remainingAfterRegular) {
              extraPaymentApplied = remainingAfterRegular;
          }
      }

      amortization = regularAmortization + extraPaymentApplied;
      
      // 3. Update Balance
      currentBalance -= amortization;
      
      // 4. Recalculate Future Quota if needed
      // This happens AFTER the balance has been reduced by the extra payment
      if (isExtraPaymentPeriod && extraPaymentStrategy === 'reduce_quota' && currentBalance > 0.01) {
           const remainingMonths = totalMonths - i;
           // Recalculate based on the new reduced balance for the remaining term
           fixedAnnuityPayment = calculateAnnuity(currentBalance, remainingMonths);
      }
      
      // Note: If strategy is 'reduce_term', we do NOT recalculate fixedAnnuityPayment.
      // We keep paying the same amount. Since Balance is lower, Interest will be lower next month,
      // so Regular Amortization will be higher, eating the debt faster.
    }

    // Safety clamp
    if (currentBalance < 0.01) currentBalance = 0;

    totalInterest += interest;
    totalPaymentAccumulator += (payment + extraPaymentApplied); 

    schedule.push({
      period: i,
      date: paymentDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric', day: 'numeric' }),
      interest,
      amortization: amortization, 
      insurance: insuranceAmount,
      fee: fee,
      payment: payment + extraPaymentApplied, // Visual total cash flow
      balance: currentBalance,
      extraPayment: extraPaymentApplied > 0 ? extraPaymentApplied : undefined
    });
    
    actualLastPeriod = i;
    if (currentBalance === 0 && i >= gracePeriod) break;
  }

  return {
    schedule,
    startDate: startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    summary: {
      totalInterest,
      totalPayment: totalPaymentAccumulator,
      monthlyRate,
      annualRate,
      firstPayment: initialFixedAnnuity + fixedFee,
      regularPayment: fixedAnnuityPayment + fixedFee,
      newTerm: actualLastPeriod
    }
  };
};

export const calculateSchedule = (params: LoanParams): CalculationResult => {
    // 1. Calculate the requested scenario (what the user selected)
    const result = calculateInternal(params);

    // 2. Calculate Comparison Scenarios if extra payment is active
    if (params.extraPaymentAmount > 0) {
        // A. Original (No Extra Payment)
        const originalRes = calculateInternal({ ...params, extraPaymentAmount: 0 });
        const originalMetrics: ScenarioMetrics = {
            totalPayment: originalRes.summary.totalPayment,
            totalInterest: originalRes.summary.totalInterest,
            term: originalRes.summary.newTerm || params.term,
            regularPayment: originalRes.summary.firstPayment,
            savings: 0
        };

        // B. Reduce Term Strategy
        const termRes = calculateInternal({ ...params, extraPaymentStrategy: 'reduce_term' });
        const reduceTermMetrics: ScenarioMetrics = {
            totalPayment: termRes.summary.totalPayment,
            totalInterest: termRes.summary.totalInterest,
            term: termRes.summary.newTerm || params.term,
            regularPayment: termRes.summary.regularPayment,
            savings: originalRes.summary.totalPayment - termRes.summary.totalPayment
        };

        // C. Reduce Quota Strategy
        const quotaRes = calculateInternal({ ...params, extraPaymentStrategy: 'reduce_quota' });
        const reduceQuotaMetrics: ScenarioMetrics = {
            totalPayment: quotaRes.summary.totalPayment,
            totalInterest: quotaRes.summary.totalInterest,
            term: quotaRes.summary.newTerm || params.term,
            regularPayment: quotaRes.summary.regularPayment,
            savings: originalRes.summary.totalPayment - quotaRes.summary.totalPayment
        };

        result.summary.comparison = {
            original: originalMetrics,
            reduceTerm: reduceTermMetrics,
            reduceQuota: reduceQuotaMetrics
        };
    }

    return result;
};
