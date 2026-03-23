export interface Customer{
    id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  panCard?: string;
  aadharCard?: string;
  salarySlip?: string;
  selfiePhoto?: string;
  preApprovedLimit: number;
  creditScore?: number;
  monthlySalary?: number;
}
export interface LoanApplication{
  id: string;
  customerId: string;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  emi: number;
  status:'initiated' | 'negotiating' | 'verifying' | 'underwriting' | 'approved' | 'rejected';
  content:string;
   rejectionReason?: string;
  sanctionLetter?: string;
  createdAt: Date;
}
export interface ChatMessage{
  id: string;
  role: 'master' | 'sales' | 'verification' | 'underwriting' | 'sanction' | 'customer';
  content: string;
  timestamp: Date;
  agentName?: string; 
}
export interface AgentState{
  currentAgent: 'master' | 'sales' | 'verification' | 'underwriting' | 'sanction' | null;
  stage: 'greeting' | 'sales' | 'verification' | 'underwriting' | 'sanctioning' | 'completed' | 'rejected';
  loanDetails?: {
    amount?: number;
    tenure?: number;
    interestRate?: number;
}
 documentsUploaded: {
    panCard: boolean;
    aadharCard: boolean;
    salarySlip: boolean;
    selfie: boolean;
  };
  verificationComplete: boolean;
  underwritingComplete: boolean;
}