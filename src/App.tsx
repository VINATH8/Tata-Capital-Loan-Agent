import { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import OnboardingForm from './components/OnboardingForm';
import DocumentUpload from './components/DocumentUpload';
import SelfieCapture from './components/SelfieCapture';
import SimplifiedChatInterface from './components/SimplifiedChatInterface';
import type { Customer } from './types/loan';

type AppStage = 'landing' | 'login' | 'signup' | 'onboarding' | 'documents' | 'selfie' | 'chat';

function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [customer, setCustomer] = useState<Customer>({
    id: `CUST${Date.now()}`,
    name: '',
    phone: '',
    email: '',
    address: '',
    preApprovedLimit: 200000,
  });

  const handleLoginSuccess = (email: string, id: string) => {
    setUserEmail(email);
    setUserId(id);
    setCustomer(prev => ({ ...prev, email, id }));
    setStage('onboarding');
  };

  const handleSignupSuccess = (email: string, id: string) => {
    setUserEmail(email);
    setUserId(id);
    setCustomer(prev => ({ ...prev, email, id }));
    setStage('onboarding');
  };

  const handleOnboardingComplete = (data: {
    name: string;
    phone: string;
    aadhar: string;
    pan: string;
  }) => {
    setCustomer(prev => ({
      ...prev,
      name: data.name,
      phone: data.phone,
      address: `Aadhar: ${data.aadhar}, PAN: ${data.pan}`,
    }));
    setStage('documents');
  };

  const handleDocumentsComplete = (docs: {
    panCard?: string;
    aadharCard?: string;
    salarySlip?: string;
  }) => {
    setCustomer(prev => ({ ...prev, ...docs }));
    setStage('selfie');
  };

  const handleSelfieComplete = (selfieData: string) => {
    setCustomer(prev => ({ ...prev, selfiePhoto: selfieData }));
    setStage('chat');
  };

  return (
    <>
      {stage === 'landing' && <LandingPage onStartChat={() => setStage('login')} />}
      {stage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setStage('signup')} />}
      {stage === 'signup' && <SignupPage onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setStage('login')} />}
      {stage === 'onboarding' && <OnboardingForm onComplete={handleOnboardingComplete} />}
      {stage === 'documents' && <DocumentUpload onUploadComplete={handleDocumentsComplete} standalone />}
      {stage === 'selfie' && <SelfieCapture onCapture={handleSelfieComplete} panCardPhoto={customer.panCard} aadharCardPhoto={customer.aadharCard} standalone />}
      {stage === 'chat' && <SimplifiedChatInterface customer={customer} />}
    </>
  );
}

export default App;
