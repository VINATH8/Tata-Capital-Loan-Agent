export interface EMIBreakdown {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  processingFee: number;
  gst: number;
  netDisbursement: number;
}

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EMIBreakdown {
  const monthlyRate = annualRate / (12 * 100);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalAmount = emi * tenureMonths;
  const totalInterest = totalAmount - principal;

  const processingFee = principal * 0.02;
  const gst = processingFee * 0.18;
  const netDisbursement = principal - processingFee - gst;

  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
    processingFee: Math.round(processingFee),
    gst: Math.round(gst),
    netDisbursement: Math.round(netDisbursement),
  };
}

export function validateEligibility(
  loanAmount: number,
  preApprovedLimit: number,
  creditScore: number,
  monthlySalary?: number
): { eligible: boolean; reason?: string; needsSalarySlip: boolean } {
  if (creditScore < 700) {
    return {
      eligible: false,
      reason: 'Credit score is below minimum requirement of 700',
      needsSalarySlip: false,
    };
  }

  if (loanAmount <= preApprovedLimit) {
    return { eligible: true, needsSalarySlip: false };
  }

  if (loanAmount <= preApprovedLimit * 2) {
    if (!monthlySalary) {
      return { eligible: false, needsSalarySlip: true };
    }

    const emi = calculateEMI(loanAmount, 12.5, 12).emi;
    const emiToIncomeRatio = (emi / monthlySalary) * 100;

    if (emiToIncomeRatio <= 50) {
      return { eligible: true, needsSalarySlip: false };
    } else {
      return {
        eligible: false,
        reason: `EMI (₹${emi.toLocaleString()}) exceeds 50% of monthly salary (₹${monthlySalary.toLocaleString()})`,
        needsSalarySlip: false,
      };
    }
  }

  return {
    eligible: false,
    reason: `Loan amount (₹${loanAmount.toLocaleString()}) exceeds 2× pre-approved limit (₹${(preApprovedLimit * 2).toLocaleString()})`,
    needsSalarySlip: false,
  };
}

export async function mockCreditScore(): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Math.floor(Math.random() * 200) + 700;
}
