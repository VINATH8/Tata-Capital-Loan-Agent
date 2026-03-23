import { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { calculateEMI } from '../utils/loanCalculations';
import type { EMIBreakdown } from '../utils/loanCalculations';

interface EMICalculatorProps {
  onClose: () => void;
  initialAmount?: number;
  initialTenure?: number;
}

export default function EMICalculator({ onClose, initialAmount, initialTenure }: EMICalculatorProps) {
  const [amount, setAmount] = useState(initialAmount || 200000);
  const [tenure, setTenure] = useState(initialTenure || 12);
  const [interestRate, setInterestRate] = useState(12.5);
  const [breakdown, setBreakdown] = useState<EMIBreakdown | null>(null);

  useEffect(() => {
    const result = calculateEMI(amount, interestRate, tenure);
    setBreakdown(result);
  }, [amount, tenure, interestRate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Calculator className="w-7 h-7 mr-3" />
              EMI Calculator
            </h2>
            <p className="text-green-100 text-sm mt-1">Calculate your monthly installment</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Loan Amount
                </label>
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">₹50,000</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-500">₹10,00,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Loan Tenure (Months)
                </label>
                <input
                  type="range"
                  min="6"
                  max="60"
                  step="6"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">6 months</span>
                  <span className="text-2xl font-bold text-green-600">{tenure} months</span>
                  <span className="text-sm text-gray-500">60 months</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="range"
                  min="10.5"
                  max="18"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">10.5%</span>
                  <span className="text-2xl font-bold text-green-600">{interestRate}%</span>
                  <span className="text-sm text-gray-500">18%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {breakdown && (
                <>
                  <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Monthly EMI</span>
                    </div>
                    <div className="text-4xl font-bold">
                      ₹{breakdown.emi.toLocaleString('en-IN')}
                    </div>
                    <p className="text-green-100 text-sm mt-2">
                      Pay this amount every month for {tenure} months
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Detailed Breakdown
                    </h3>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Principal Amount</span>
                      <span className="font-semibold text-gray-900">
                        ₹{amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="font-semibold text-orange-600">
                        ₹{breakdown.totalInterest.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Processing Fee (2%)</span>
                      <span className="font-semibold text-gray-900">
                        ₹{breakdown.processingFee.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">GST on Fee (18%)</span>
                      <span className="font-semibold text-gray-900">
                        ₹{breakdown.gst.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-3 mt-3">
                      <span className="font-semibold text-blue-900">Net Disbursement</span>
                      <span className="font-bold text-blue-600 text-lg">
                        ₹{breakdown.netDisbursement.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between py-3 bg-green-50 rounded-lg px-3">
                      <span className="font-semibold text-green-900">Total Payable</span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹{breakdown.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-5">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-900">Note:</strong> This calculation is indicative and for reference only.
              Actual EMI may vary based on final approval and terms. Processing fees and GST are deducted from
              the loan amount before disbursement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
