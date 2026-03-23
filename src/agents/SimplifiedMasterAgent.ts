import type { ChatMessage} from '../types/loan.ts'
import type {AgentState}from '../types/loan';
import type {Customer } from '../types/loan.ts'
import SimplifiedSalesAgent from './SimplifiedSalesAgent';
import UnderwritingAgent from './UnderwritingAgent';
import SanctionAgent from './SanctionAgent';

export default class SimplifiedMasterAgent {
  private salesAgent: SimplifiedSalesAgent;
  private underwritingAgent: UnderwritingAgent;
  private sanctionAgent: SanctionAgent;

  private state: AgentState = {
    currentAgent: null,
    stage: 'greeting',
    documentsUploaded: {
      panCard: true,
      aadharCard: true,
      salarySlip: true,
      selfie: true,
    },
    verificationComplete: true,
    underwritingComplete: false,
  };

  constructor() {
    this.salesAgent = new SimplifiedSalesAgent();
    this.underwritingAgent = new UnderwritingAgent();
    this.sanctionAgent = new SanctionAgent();
  }

  initialize(customerName: string): ChatMessage {
    this.state.currentAgent = 'sales';
    this.state.stage = 'sales';

    return {
      id: `msg-${Date.now()}`,
      role: 'sales',
      content: this.salesAgent.introduce(customerName),
      timestamp: new Date(),
      agentName: 'Sales Agent',
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

    if (this.state.stage === 'sales') {
      const result = await this.salesAgent.handleConversation(
        message,
        customer,
        setCustomer,
        this.state
      );

      if (result.moveToUnderwriting) {
        this.state.stage = 'underwriting';
        this.state.currentAgent = 'underwriting';

        await new Promise(resolve => setTimeout(resolve, 1500));

        const underwritingResult = await this.underwritingAgent.processUnderwriting(
          customer,
          this.state
        );

        if (underwritingResult.approved) {
          this.state.stage = 'sanctioning';
          this.state.currentAgent = 'sanction';
          this.state.underwritingComplete = true;

          const sanctionResult = this.sanctionAgent.generateLetter(customer, this.state);

          return {
            messages: [
              ...result.messages,
              ...underwritingResult.messages,
              {
                id: `msg-${Date.now() + 300}`,
                role: 'master',
                content: `🎉 Congratulations! Your loan has been approved!

Generating your sanction letter...`,
                timestamp: new Date(),
                agentName: 'Master Agent',
              },
              {
                id: `msg-${Date.now() + 301}`,
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
            messages: [...result.messages, ...underwritingResult.messages],
            newState: this.state,
          };
        }
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
          content: `Processing your request...`,
          timestamp: new Date(),
          agentName: 'Master Agent',
        },
      ],
      newState: this.state,
    };
  }
}
