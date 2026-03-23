import type {ChatMessage} from '../types/loan';
import type { AgentState } from '../types/loan';
import type {Customer} from '../types/loan'
import SalesAgent from './SalesAgent';
import VerificationAgent from './VerificationAgent';
import UnderwritingAgent from './UnderwritingAgent';
import SanctionAgent from './SanctionAgent';

export default class MasterAgent {
  private salesAgent: SalesAgent;
  private verificationAgent: VerificationAgent;
  private underwritingAgent: UnderwritingAgent;
  private sanctionAgent: SanctionAgent;

  private state: AgentState = {
    currentAgent: null,
    stage: 'greeting',
    documentsUploaded: {
      panCard: false,
      aadharCard: false,
      salarySlip: false,
      selfie: false,
    },
    verificationComplete: false,
    underwritingComplete: false,
  };

  constructor() {
    this.salesAgent = new SalesAgent();
    this.verificationAgent = new VerificationAgent();
    this.underwritingAgent = new UnderwritingAgent();
    this.sanctionAgent = new SanctionAgent();
  }

  initialize(): ChatMessage {
    this.state.currentAgent = 'master';
    return {
      id: `msg-${Date.now()}`,
      role: 'master',
      content: `Hello! Welcome to TATA CAPITAL! 🎉

I'm your personal loan assistant, and I'm here to help you get the financing you need quickly and easily.

We offer personal loans with:
✓ Competitive interest rates starting from 10.5% p.a.
✓ Flexible tenure from 6 to 60 months
✓ Instant approval decisions
✓ Transparent pricing with no hidden charges

To get started, could you please tell me your name?`,
      timestamp: new Date(),
      agentName: 'Master Agent',
    };
  }

  getState(): AgentState {
    return this.state;
  }

  async processMessage(
    message: string,
    customer: Customer,
    setCustomer: (customer: Customer | ((prev: Customer) => Customer)) => void,
    currentState: AgentState
  ): Promise<{
    messages: ChatMessage[];
    newState: AgentState;
    action?: string;
    sanctionLetter?: string;
  }> {
    this.state = { ...currentState };

    if (this.state.stage === 'greeting') {
      const name = message.trim();
      setCustomer((prev) => ({ ...prev, name }));

      this.state.stage = 'sales';
      this.state.currentAgent = 'sales';

      return {
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'master',
            content: `Thank you, ${name}! Let me connect you with our Sales Expert who will help you find the perfect loan for your needs.`,
            timestamp: new Date(),
            agentName: 'Master Agent',
          },
          {
            id: `msg-${Date.now() + 1}`,
            role: 'sales',
            content: this.salesAgent.introduce(name),
            timestamp: new Date(),
            agentName: 'Sales Agent',
          },
        ],
        newState: this.state,
      };
    }

    if (this.state.stage === 'sales') {
      const result = await this.salesAgent.handleConversation(
        message,
        customer,
        setCustomer,
        this.state
      );

      if (result.moveToVerification) {
        this.state.stage = 'verification';
        this.state.currentAgent = 'verification';

        return {
          messages: [
            ...result.messages,
            {
              id: `msg-${Date.now() + 100}`,
              role: 'master',
              content: `Great! Now let me hand you over to our Verification Team to complete the KYC process.`,
              timestamp: new Date(),
              agentName: 'Master Agent',
            },
            {
              id: `msg-${Date.now() + 101}`,
              role: 'verification',
              content: this.verificationAgent.introduce(customer.name),
              timestamp: new Date(),
              agentName: 'Verification Agent',
            },
          ],
          newState: this.state,
          action: 'show_documents',
        };
      }

      if (result.showEMICalculator) {
        return {
          messages: result.messages,
          newState: this.state,
          action: 'show_emi_calculator',
        };
      }

      return {
        messages: result.messages,
        newState: this.state,
      };
    }

    return {
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'master',
          content: `I'm processing your request. Please wait...`,
          timestamp: new Date(),
          agentName: 'Master Agent',
        },
      ],
      newState: this.state,
    };
  }

  async triggerUnderwriting(
    customer: Customer,
    currentState: AgentState
  ): Promise<{
    messages: ChatMessage[];
    newState: AgentState;
    action?: string;
    sanctionLetter?: string;
  }> {
    this.state = { ...currentState };
    this.state.stage = 'underwriting';
    this.state.currentAgent = 'underwriting';

    const result = await this.underwritingAgent.processUnderwriting(customer, this.state);

    if (result.approved) {
      this.state.stage = 'sanctioning';
      this.state.currentAgent = 'sanction';
      this.state.underwritingComplete = true;

      const sanctionResult = this.sanctionAgent.generateLetter(customer, this.state);

      return {
        messages: [
          ...result.messages,
          {
            id: `msg-${Date.now() + 200}`,
            role: 'master',
            content: `Excellent news! Your loan has been approved. Let me generate your sanction letter...`,
            timestamp: new Date(),
            agentName: 'Master Agent',
          },
          {
            id: `msg-${Date.now() + 201}`,
            role: 'sanction',
            content: sanctionResult.message,
            timestamp: new Date(),
            agentName: 'Sanction Letter Agent',
          },
        ],
        newState: this.state,
        action: 'show_sanction',
        sanctionLetter: sanctionResult.letterHtml,
      };
    } else {
      this.state.stage = 'rejected';
      return {
        messages: result.messages,
        newState: this.state,
      };
    }
  }
}
