import type { ChatMessage} from '../types/loan.ts'
import type {AgentState}from '../types/loan';
import type {Customer } from '../types/loan.ts'

export default class SimplifiedSalesAgent {
  private conversationState: {
    askedAboutAmount: boolean;
    askedAboutTenure: boolean;
    showedTerms: boolean;
    agreedToTerms: boolean;
  } = {
    askedAboutAmount: false,
    askedAboutTenure: false,
    showedTerms: false,
    agreedToTerms: false,
  };

  introduce(customerName: string): string {
    return `Hello ${customerName}! Welcome to TATA CAPITAL!

I'm here to help you get your personal loan approved quickly.

How much loan amount would you like to apply for?

💡 You have a pre-approved limit of ₹2,00,000. We can also consider amounts up to ₹4,00,000 based on your profile.`;
  }

  async handleConversation(
    message: string,
    customer: Customer,
    setCustomer: (customer: Customer | ((prev: Customer) => Customer)) => void,
    state: AgentState
  ): Promise<{
    messages: ChatMessage[];
    moveToUnderwriting?: boolean;
    showEMICalculator?: boolean;
  }> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('emi') || lowerMessage.includes('calculator') || lowerMessage.includes('calculate')) {
      return {
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'sales',
            content: `Sure! Let me open our EMI calculator for you. You can see exactly how much you'll pay each month with all charges included.`,
            timestamp: new Date(),
            agentName: 'Sales Agent',
          },
        ],
        showEMICalculator: true,
      };
    }

    if (!this.conversationState.askedAboutAmount) {
      const amountMatch = message.match(/(\d+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[0]);
        let finalAmount = amount;

        if (amount < 10000) {
          finalAmount = amount * 100000;
        } else if (amount < 1000) {
          finalAmount = amount * 1000;
        }

        state.loanDetails = { ...state.loanDetails, amount: finalAmount };
        this.conversationState.askedAboutAmount = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Perfect! You're applying for ₹${finalAmount.toLocaleString('en-IN')}.

Now, let's talk about the repayment period. How many months would you like to repay this loan?

📅 Available Options:
• 6 months - Quick repayment
• 12 months - Most Popular!
• 18 months - Balanced
• 24 months - Lower EMI
• 36 months - Minimum EMI

You can also type "calculate EMI" to see different options.`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      } else {
        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Please specify the loan amount you'd like. For example, you can say "2 lakhs" or "200000".`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    if (!this.conversationState.askedAboutTenure) {
      const tenureMatch = message.match(/(\d+)/);
      if (tenureMatch) {
        const tenure = parseInt(tenureMatch[0]);

        if (tenure < 6 || tenure > 60) {
          return {
            messages: [
              {
                id: `msg-${Date.now()}`,
                role: 'sales',
                content: `Please choose a tenure between 6 and 60 months.`,
                timestamp: new Date(),
                agentName: 'Sales Agent',
              },
            ],
          };
        }

        state.loanDetails = { ...state.loanDetails, tenure };

        const interestRate = tenure <= 12 ? 10.5 : tenure <= 24 ? 11.5 : 12.5;
        state.loanDetails.interestRate = interestRate;

        const monthlyRate = interestRate / (12 * 100);
        const amount = state.loanDetails.amount || 200000;
        const emi =
          (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1);

        const processingFee = amount * 0.02;
        const gst = processingFee * 0.18;
        const totalInterest = (emi * tenure) - amount;

        this.conversationState.askedAboutTenure = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Excellent! Here's your personalized loan offer:

💰 **Loan Details:**
• Loan Amount: ₹${amount.toLocaleString('en-IN')}
• Tenure: ${tenure} months
• Interest Rate: ${interestRate}% per annum

💳 **Monthly Payment:**
• EMI: ₹${Math.round(emi).toLocaleString('en-IN')}/month

💵 **One-Time Charges:**
• Processing Fee (2%): ₹${Math.round(processingFee).toLocaleString('en-IN')}
• GST on Fee (18%): ₹${Math.round(gst).toLocaleString('en-IN')}

📊 **Total Cost:**
• Total Interest: ₹${Math.round(totalInterest).toLocaleString('en-IN')}
• Total Amount Payable: ₹${Math.round(emi * tenure).toLocaleString('en-IN')}

✅ **No hidden charges! Everything is transparent.**

Do you agree to proceed with these terms? (Type "yes" to continue)`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      } else {
        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Please specify the tenure in months. For example, "12" for 12 months.`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    if (!this.conversationState.agreedToTerms) {
      if (lowerMessage.includes('yes') || lowerMessage.includes('agree') || lowerMessage.includes('ok') || lowerMessage.includes('proceed')) {
        this.conversationState.agreedToTerms = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Wonderful! Thank you for agreeing to the terms.

✅ Your application is now being processed.

I'll now hand you over to our Underwriting team who will:
• Verify your credit score
• Validate your documents
• Assess your eligibility
• Process your loan approval

This will take just a moment...`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
          moveToUnderwriting: true,
        };
      } else if (lowerMessage.includes('no') || lowerMessage.includes('not agree')) {
        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `I understand. Would you like to:
1. Try a different loan amount?
2. Choose a different tenure?
3. Use the EMI calculator to explore options?

Please let me know how I can help!`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      } else {
        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Please confirm if you agree to these terms by typing "yes" or "no".`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    return {
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'sales',
          content: `I'm processing your request. Please wait...`,
          timestamp: new Date(),
          agentName: 'Sales Agent',
        },
      ],
    };
  }
}
