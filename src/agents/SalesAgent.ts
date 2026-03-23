import type {ChatMessage} from '../types/loan';
import type { AgentState } from '../types/loan';
import type {Customer} from '../types/loan'

export default class SalesAgent {
  private conversationState: {
    askedAboutPurpose: boolean;
    askedAboutAmount: boolean;
    askedAboutTenure: boolean;
    askedForContact: boolean;
    gotEmail: boolean;
    gotPhone: boolean;
    gotAddress: boolean;
  } = {
    askedAboutPurpose: false,
    askedAboutAmount: false,
    askedAboutTenure: false,
    askedForContact: false,
    gotEmail: false,
    gotPhone: false,
    gotAddress: false,
  };

  introduce(customerName: string): string {
    return `Hi ${customerName}! I'm your dedicated Sales Advisor at TATA CAPITAL.

I'm here to understand your financial needs and help you get the best personal loan deal!

Let me start by asking - what would you like to use this loan for? (e.g., home renovation, medical expenses, debt consolidation, wedding, education, etc.)`;
  }

  async handleConversation(
    message: string,
    customer: Customer,
    setCustomer: (customer: Customer | ((prev: Customer) => Customer)) => void,
    state: AgentState
  ): Promise<{
    messages: ChatMessage[];
    moveToVerification?: boolean;
    showEMICalculator?: boolean;
  }> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('emi') || lowerMessage.includes('calculator') || lowerMessage.includes('calculate')) {
      return {
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'sales',
            content: `Of course! Let me open our EMI calculator for you. You can adjust the loan amount, tenure, and see all charges clearly.`,
            timestamp: new Date(),
            agentName: 'Sales Agent',
          },
        ],
        showEMICalculator: true,
      };
    }

    if (!this.conversationState.askedAboutPurpose) {
      this.conversationState.askedAboutPurpose = true;
      this.conversationState.askedAboutAmount = true;

      return {
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'sales',
            content: `That's a great use of funds! We have helped thousands of customers like you.

Now, how much loan amount are you looking for?

Based on your profile, you have a pre-approved limit of ₹${customer.preApprovedLimit.toLocaleString('en-IN')}. However, we can consider amounts up to ₹${(customer.preApprovedLimit * 2).toLocaleString('en-IN')} with additional documentation.

You can also use our EMI calculator (just type "calculate EMI") to see the exact monthly payment.`,
            timestamp: new Date(),
            agentName: 'Sales Agent',
          },
        ],
      };
    }

    if (!this.conversationState.askedAboutTenure) {
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
        this.conversationState.askedAboutTenure = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Perfect! So you're looking for ₹${finalAmount.toLocaleString('en-IN')}.

Now, let's talk about the repayment tenure. How many months would you like to repay this loan over?

We offer flexible tenure options:
• 6 months - Higher EMI, less interest
• 12 months - Balanced option (Most popular!)
• 24 months - Moderate EMI
• 36-60 months - Lower EMI, more interest

What works best for your budget?`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    if (!this.conversationState.askedForContact) {
      const tenureMatch = message.match(/(\d+)/);
      if (tenureMatch) {
        const tenure = parseInt(tenureMatch[0]);
        state.loanDetails = { ...state.loanDetails, tenure };

        const interestRate = tenure <= 12 ? 10.5 : tenure <= 24 ? 11.5 : 12.5;
        state.loanDetails.interestRate = interestRate;

        const monthlyRate = interestRate / (12 * 100);
        const amount = state.loanDetails.amount || 200000;
        const emi =
          (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1);

        this.conversationState.askedForContact = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Excellent choice! Here's what your loan will look like:

💰 Loan Amount: ₹${amount.toLocaleString('en-IN')}
⏱️ Tenure: ${tenure} months
📊 Interest Rate: ${interestRate}% p.a.
💳 Monthly EMI: ₹${Math.round(emi).toLocaleString('en-IN')}

📋 Additional Charges (All transparent!):
• Processing Fee: 2% of loan amount
• GST on Processing Fee: 18%
• No prepayment charges for first 6 months
• Zero hidden charges!

This is a great deal! Would you like to proceed with this application?

To continue, I'll need a few contact details. Could you please provide your email address?`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    if (!this.conversationState.gotEmail) {
      const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        setCustomer((prev) => ({ ...prev, email: emailMatch[0] }));
        this.conversationState.gotEmail = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Great! Got your email as ${emailMatch[0]}.

Now, could you please share your mobile number?`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    if (!this.conversationState.gotPhone) {
      const phoneMatch = message.match(/\d{10}/);
      if (phoneMatch) {
        setCustomer((prev) => ({ ...prev, phone: phoneMatch[0] }));
        this.conversationState.gotPhone = true;

        return {
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'sales',
              content: `Perfect! Mobile number noted as ${phoneMatch[0]}.

Finally, could you please provide your current residential address?`,
              timestamp: new Date(),
              agentName: 'Sales Agent',
            },
          ],
        };
      }
    }

    if (!this.conversationState.gotAddress) {
      setCustomer((prev) => ({ ...prev, address: message }));
      this.conversationState.gotAddress = true;

      return {
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'sales',
            content: `Wonderful! I have all the information I need:

✓ Loan Amount: ₹${state.loanDetails?.amount?.toLocaleString('en-IN')}
✓ Tenure: ${state.loanDetails?.tenure} months
✓ Email: ${customer.email}
✓ Phone: ${customer.phone}
✓ Address: ${message}

You're making an excellent financial decision! This loan will be processed at ${state.loanDetails?.interestRate}% interest rate.

Now, let's move forward with the verification process to get your loan approved quickly!`,
            timestamp: new Date(),
            agentName: 'Sales Agent',
          },
        ],
        moveToVerification: true,
      };
    }

    return {
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'sales',
          content: `I understand. Could you please provide the information I requested? This will help us process your loan application smoothly.`,
          timestamp: new Date(),
          agentName: 'Sales Agent',
        },
      ],
    };
  }
}
