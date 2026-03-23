import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Calculator } from 'lucide-react';
import type { ChatMessage} from '../types/loan.ts'
import type {AgentState}from '../types/loan';
import type {Customer } from '../types/loan.ts'
import DocumentUpload from './DocumentUpload';
import SelfieCapture from './SelfieCapture';
import EMICalculator from './EMICalculator';
import SuccessNotification from './SuccessNotification';
import MasterAgent from '../agents/MasterAgent';

interface ChatInterfaceProps {
  onClose: () => void;
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>({
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
  });
  const [customer, setCustomer] = useState<Customer>({
    id: `CUST${Date.now()}`,
    name: '',
    phone: '',
    email: '',
    address: '',
    preApprovedLimit: 200000,
  });
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [showEMICalc, setShowEMICalc] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sanctionLetterHtml, setSanctionLetterHtml] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const masterAgent = useRef(new MasterAgent()).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initMessage = masterAgent.initialize();
    setMessages([initMessage]);
    setAgentState(masterAgent.getState());
  }, []);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'customer',
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const response = await masterAgent.processMessage(
      inputValue,
      customer,
      setCustomer,
      agentState
    );

    setIsTyping(false);

    response.messages.forEach((msg, index) => {
      setTimeout(() => addMessage(msg), index * 500);
    });

    setAgentState(response.newState);

    if (response.action === 'show_documents') {
      setTimeout(() => setShowDocUpload(true), 1000);
    } else if (response.action === 'show_selfie') {
      setTimeout(() => setShowSelfieCapture(true), 1000);
    } else if (response.action === 'show_emi_calculator') {
      setTimeout(() => setShowEMICalc(true), 500);
    } else if (response.action === 'show_sanction') {
      setSanctionLetterHtml(response.sanctionLetter || '');
      setTimeout(() => setShowSuccess(true), 1000);
    }
  };

  const handleDocumentsUploaded = (docs: {
    panCard?: string;
    aadharCard?: string;
    salarySlip?: string;
  }) => {
    setCustomer(prev => ({ ...prev, ...docs }));
    setAgentState(prev => ({
      ...prev,
      documentsUploaded: {
        ...prev.documentsUploaded,
        panCard: !!docs.panCard,
        aadharCard: !!docs.aadharCard,
        salarySlip: !!docs.salarySlip,
      },
    }));
    setShowDocUpload(false);

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'verification',
      content: '✓ Documents uploaded successfully! Now I need to verify your identity with a selfie.',
      timestamp: new Date(),
      agentName: 'Verification Agent',
    };
    addMessage(msg);

    setTimeout(() => setShowSelfieCapture(true), 1000);
  };

  const handleSelfieCaptured = async (selfieData: string) => {
    setCustomer(prev => ({ ...prev, selfiePhoto: selfieData }));
    setAgentState(prev => ({
      ...prev,
      documentsUploaded: { ...prev.documentsUploaded, selfie: true },
      verificationComplete: true,
    }));
    setShowSelfieCapture(false);

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'verification',
      content: '✓ Identity verified successfully! All verification checks passed. Handing over to the Underwriting team...',
      timestamp: new Date(),
      agentName: 'Verification Agent',
    };
    addMessage(msg);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = await masterAgent.triggerUnderwriting(customer, agentState);
    response.messages.forEach((msg, index) => {
      setTimeout(() => addMessage(msg), index * 800);
    });

    setAgentState(response.newState);

    if (response.action === 'show_sanction') {
      setSanctionLetterHtml(response.sanctionLetter || '');
      setTimeout(() => setShowSuccess(true), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">TATA CAPITAL Loan Assistant</h2>
              <p className="text-blue-100 text-sm mt-1">
                {agentState.currentAgent && (
                  <span className="flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    {agentState.currentAgent === 'sales' && 'Sales Agent'}
                    {agentState.currentAgent === 'verification' && 'Verification Agent'}
                    {agentState.currentAgent === 'underwriting' && 'Underwriting Agent'}
                    {agentState.currentAgent === 'sanction' && 'Sanction Agent'}
                    {agentState.currentAgent === 'master' && 'Master Agent'}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-6 py-4 ${
                    message.role === 'customer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-md border border-gray-100'
                  }`}
                >
                  {message.role !== 'customer' && message.agentName && (
                    <div className="flex items-center mb-2 text-sm font-semibold text-blue-600">
                      <Bot className="w-4 h-4 mr-2" />
                      {message.agentName}
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                  {message.role === 'customer' && (
                    <div className="flex items-center justify-end mt-2 text-xs text-blue-100">
                      <User className="w-3 h-3 mr-1" />
                      You
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEMICalc(true)}
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition"
                title="EMI Calculator"
              >
                <Calculator className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Send</span>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDocUpload && (
        <DocumentUpload
          onClose={() => setShowDocUpload(false)}
          onUploadComplete={handleDocumentsUploaded}
        />
      )}

      {showSelfieCapture && (
        <SelfieCapture
          onClose={() => setShowSelfieCapture(false)}
          onCapture={handleSelfieCaptured}
          panCardPhoto={customer.panCard}
          aadharCardPhoto={customer.aadharCard}
        />
      )}

      {showEMICalc && (
        <EMICalculator
          onClose={() => setShowEMICalc(false)}
          initialAmount={agentState.loanDetails?.amount}
          initialTenure={agentState.loanDetails?.tenure}
        />
      )}

      {showSuccess && (
        <SuccessNotification
          sanctionLetterHtml={sanctionLetterHtml}
          applicationId={customer.id}
        />
      )}
    </>
  );
}
