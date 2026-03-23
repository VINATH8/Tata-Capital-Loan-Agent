import type { AgentState } from '../types/loan';
import type { Customer } from '../types/loan';
import type { LoanApplication } from '../types/loan';
import { calculateEMI } from '../utils/loanCalculations';
import { generateSanctionLetter } from '../utils/pdfGenerator';

export default class SanctionAgent {
  generateLetter(
    customer: Customer,
    state: AgentState
  ): {
    message: string;
    letterHtml: string;
    loanApplication: LoanApplication;
  } {
    const loanAmount = state.loanDetails?.amount || 200000;
    const tenure = state.loanDetails?.tenure || 12;
    const interestRate = state.loanDetails?.interestRate || 12.5;

    // ✅ Calculate EMI and disbursement details
    const emiBreakdown = calculateEMI(loanAmount, interestRate, tenure);

    // ✅ Generate a unique loan ID (not same as customer ID)
    const loanId = `LN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // ✅ Build the LoanApplication object
    const loanApplication: LoanApplication = {
      id: loanId,
      customerId: customer.id,
      loanAmount,
      tenure,
      interestRate,
      emi: emiBreakdown.emi,
      status: "approved",
      content: "Loan sanctioned successfully. EMI details calculated and sanction letter generated.",
      createdAt: new Date(),
      sanctionLetter: "", // placeholder; will set below
    };

    // ✅ Generate sanction letter HTML (and optionally PDF)
    const letterHtml = generateSanctionLetter(customer, loanApplication, emiBreakdown);

    // ✅ Attach the generated letter HTML into the application
    loanApplication.sanctionLetter = letterHtml;

    // ✅ Create readable message for chat UI or logs
    const message = `🎉 Sanction Letter Generated Successfully!

Dear ${customer.name},

Your loan sanction letter has been generated and is ready for download.

📄 **Sanction Letter Details:**
• Application ID: ${loanId}
• Loan Amount: ₹${loanAmount.toLocaleString('en-IN')}
• Tenure: ${tenure} months
• Interest Rate: ${interestRate}% p.a.
• Monthly EMI: ₹${emiBreakdown.emi.toLocaleString('en-IN')}

💵 **Disbursement Details:**
• Processing Fee (2%): ₹${emiBreakdown.processingFee.toLocaleString('en-IN')}
• GST (18%): ₹${emiBreakdown.gst.toLocaleString('en-IN')}
• Net Amount Credited: ₹${emiBreakdown.netDisbursement.toLocaleString('en-IN')}

✅ **Next Steps:**
1. Download and review your sanction letter
2. Sign the loan agreement
3. Submit your bank details for disbursement
4. Funds will be credited within 24 hours

The sanction letter is valid for 30 days. Please complete the documentation within this period.

Thank you for choosing TATA CAPITAL! We're honored to be your financial partner.`;

    return {
      message,
      letterHtml,
      loanApplication,
    };
  }
}
