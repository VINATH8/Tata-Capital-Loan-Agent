import { useState } from 'react';
import { User, Phone, CreditCard, FileText, ArrowRight } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (data: {
    name: string;
    phone: string;
    aadhar: string;
    pan: string;
  }) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    aadhar: '',
    pan: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    aadhar: '',
    pan: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: '',
      aadhar: '',
      pan: '',
    };

    let isValid = true;

    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'Please enter a valid name (minimum 3 characters)';
      isValid = false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (!/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = 'Please enter a valid 12-digit Aadhar number';
      isValid = false;
    }

    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan.toUpperCase())) {
      newErrors.pan = 'Please enter a valid PAN (e.g., ABCDE1234F)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete({
        ...formData,
        pan: formData.pan.toUpperCase(),
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TATA CAPITAL</h1>
              <p className="text-blue-100">Personal Loan Application</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Get Started</h2>
            <p className="text-gray-600">
              Please provide your basic information to begin your loan application journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name as per PAN"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Aadhar Number
              </label>
              <input
                type="text"
                value={formData.aadhar}
                onChange={(e) => handleChange('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter 12-digit Aadhar number"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.aadhar ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={12}
              />
              {errors.aadhar && <p className="text-red-500 text-sm mt-1">{errors.aadhar}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                PAN Number
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase().slice(0, 10))}
                placeholder="Enter PAN (e.g., ABCDE1234F)"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.pan ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Why we need this:</strong> This information is required for KYC compliance
                and to verify your identity as per RBI guidelines.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Continue to Document Upload</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Your information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
