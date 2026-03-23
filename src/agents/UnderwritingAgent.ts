import type { ChatMessage} from '../types/loan.ts'
import type {AgentState}from '../types/loan';
import type {Customer } from '../types/loan.ts'
import { mockCreditScore, validateEligibility } from '../utils/loanCalculations';

export default class UnderwritingAgent {
  async processUnderwriting(
    customer: Customer,
    state: AgentState
  ): Promise<{
    messages: ChatMessage[];
    approved: boolean;
  }> {
    const messages: ChatMessage[] = [];

    messages.push({
      id: `msg-${Date.now()}`,
      role: 'underwriting',
      content: `Hello! I'm the Underwriting Specialist.

I'll now assess your loan application based on:
• Credit Score
• Income verification
• Debt-to-Income ratio
• Loan amount vs. pre-approved limit

Fetching your credit score from the bureau...`,
      timestamp: new Date(),
      agentName: 'Underwriting Agent',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const creditScore = await mockCreditScore();
    customer.creditScore = creditScore;

    messages.push({
      id: `msg-${Date.now() + 1}`,
      role: 'underwriting',
      content: `✓ Credit score received: ${creditScore}/900

${creditScore >= 750 ? '🌟 Excellent credit score!' : creditScore >= 700 ? '✓ Good credit score!' : '⚠️ Credit score below requirement'}

Analyzing eligibility...`,
      timestamp: new Date(),
      agentName: 'Underwriting Agent',
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const loanAmount = state.loanDetails?.amount || 200000;
    const estimatedSalary = 50000;
    customer.monthlySalary = estimatedSalary;

    const eligibility = validateEligibility(
      loanAmount,
      customer.preApprovedLimit,
      creditScore,
      estimatedSalary
    );

    if (!eligibility.eligible) {
      messages.push({
        id: `msg-${Date.now() + 2}`,
        role: 'underwriting',
        content: `❌ Loan Application Rejected

Unfortunately, we cannot approve your loan at this time.

Reason: ${eligibility.reason}

📋 What you can do:
• Improve your credit score by paying bills on time
• Consider applying for a lower loan amount
• Try again after 3-6 months

We appreciate your interest in TATA CAPITAL. Feel free to reach out to our customer support for guidance.`,
        timestamp: new Date(),
        agentName: 'Underwriting Agent',
      });

      return { messages, approved: false };
    }

    if (eligibility.needsSalarySlip) {
      messages.push({
        id: `msg-${Date.now() + 2}`,
        role: 'underwriting',
        content: `⚠️ Additional Documentation Required

Your loan amount (₹${loanAmount.toLocaleString('en-IN')}) exceeds your pre-approved limit (₹${customer.preApprovedLimit.toLocaleString('en-IN')}).

We need to verify your salary slip to ensure the EMI doesn't exceed 50% of your monthly income.

Good news: Your salary slip has already been uploaded and verified!

Calculating EMI to income ratio...`,
        timestamp: new Date(),
        agentName: 'Underwriting Agent',
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const tenure = state.loanDetails?.tenure || 12;
    const interestRate = state.loanDetails?.interestRate || 12.5;
    const monthlyRate = interestRate / (12 * 100);
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);

    const emiRatio = (emi / estimatedSalary) * 100;

    messages.push({
      id: `msg-${Date.now() + 3}`,
      role: 'underwriting',
      content: `✅ LOAN APPROVED!

Congratulations! Your loan has been approved.

📊 Underwriting Summary:
✓ Credit Score: ${creditScore}/900 - Approved
✓ Loan Amount: ₹${loanAmount.toLocaleString('en-IN')} - Within limits
✓ EMI to Income Ratio: ${emiRatio.toFixed(1)}% - Acceptable (< 50%)
✓ All verification checks: Passed

💰 Approved Loan Details:
• Loan Amount: ₹${loanAmount.toLocaleString('en-IN')}
• Tenure: ${tenure} months
• Interest Rate: ${interestRate}% p.a.
• Monthly EMI: ₹${Math.round(emi).toLocaleString('en-IN')}

Proceeding to generate your sanction letter...`,
      timestamp: new Date(),
      agentName: 'Underwriting Agent',
    });

    return { messages, approved: true };
  }
}
