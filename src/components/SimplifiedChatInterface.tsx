import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Calculator } from 'lucide-react';
import type { ChatMessage} from '../types/loan.ts'
import type {AgentState}from '../types/loan';
import type {Customer } from '../types/loan.ts'
import EMICalculator from './EMICalculator';
import SuccessNotification from './SuccessNotification';
import SimplifiedMasterAgent from '../agents/SimplifiedMasterAgent';

interface SimplifiedChatInterfaceProps {
  customer: Customer;
}

export default function SimplifiedChatInterface({ customer }: SimplifiedChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>({
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
  });
  const [customerData, setCustomerData] = useState<Customer>(customer);
  const [showEMICalc, setShowEMICalc] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sanctionLetterHtml, setSanctionLetterHtml] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const masterAgent = useRef(new SimplifiedMasterAgent()).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initMessage = masterAgent.initialize(customer.name);
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
      customerData,
      setCustomerData,
      agentState
    );

    setIsTyping(false);

    response.messages.forEach((msg, index) => {
      setTimeout(() => addMessage(msg), index * 600);
    });

    setAgentState(response.newState);

    if (response.action === 'show_emi_calculator') {
      setTimeout(() => setShowEMICalc(true), 500);
    } else if (response.action === 'show_sanction') {
      setSanctionLetterHtml(response.sanctionLetter || '');
      setTimeout(() => setShowSuccess(true), 1500);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold">TATA CAPITAL Loan Assistant</h2>
              <p className="text-blue-100 text-sm mt-1">
                {agentState.currentAgent && (
                  <span className="flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    {agentState.currentAgent === 'sales' && 'Sales Agent - Discussing your loan'}
                    {agentState.currentAgent === 'underwriting' && 'Underwriting Agent - Processing approval'}
                    {agentState.currentAgent === 'sanction' && 'Sanction Agent - Generating letter'}
                    {agentState.currentAgent === 'master' && 'Master Agent'}
                  </span>
                )}
              </p>
            </div>
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
          applicationId={customerData.id}
        />
      )}
    </>
  );
}
