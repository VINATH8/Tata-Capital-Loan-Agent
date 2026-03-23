import { useEffect, useState } from 'react';
import { CheckCircle, Download } from 'lucide-react';
import { downloadSanctionLetter } from '../utils/pdfGenerator';

interface SuccessNotificationProps {
  sanctionLetterHtml: string;
  applicationId: string;
}

export default function SuccessNotification({ sanctionLetterHtml, applicationId }: SuccessNotificationProps) {
  const [showBanner, setShowBanner] = useState(true);
  const [showLetter, setShowLetter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
      setShowLetter(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    downloadSanctionLetter(sanctionLetterHtml, applicationId);
  };

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 px-8 shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
              <CheckCircle className="w-12 h-12 animate-bounce" />
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-1">Congratulations!</h2>
                <p className="text-xl text-green-100">
                  Thank you for choosing TATA CAPITAL
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <CheckCircle className="w-7 h-7 mr-3" />
                  Loan Sanctioned Successfully!
                </h2>
                <p className="text-green-100 text-sm mt-1">Your sanction letter is ready</p>
              </div>
              <button
                onClick={handleDownload}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="bg-white rounded-lg shadow-lg">
                <iframe
                  srcDoc={sanctionLetterHtml}
                  className="w-full h-[600px] border-0"
                  title="Sanction Letter"
                />
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Your loan application has been approved. Please download the sanction letter for your records.
                </p>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2 ml-4"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Letter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
