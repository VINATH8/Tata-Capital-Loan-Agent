import { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete: (docs: {
    panCard?: string;
    aadharCard?: string;
    salarySlip?: string;
  }) => void;
    onClose?: () => void;
  standalone?: boolean;
}

interface Uploads {
  panCard?: string;
  aadharCard?: string;
  salarySlip?: string;
}

export default function DocumentUpload({ onUploadComplete, standalone = false }: DocumentUploadProps) {
  const [uploads, setUploads] = useState<Uploads>({});

  const handleFileUpload = (type: keyof Uploads, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploads(prev => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (uploads.panCard && uploads.aadharCard && uploads.salarySlip) {
      onUploadComplete(uploads);
    }
  };

  const allUploaded = uploads.panCard && uploads.aadharCard && uploads.salarySlip;

  const content = (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
        <div>
          <h2 className="text-2xl font-bold">Document Upload</h2>
          <p className="text-blue-100 text-sm mt-1">Please upload the required documents</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {(['panCard', 'aadharCard', 'salarySlip'] as const).map(type => (
          <div
            key={type}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition"
          >
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(type, e)}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {type === 'panCard'
                        ? 'PAN Card'
                        : type === 'aadharCard'
                        ? 'Aadhar Card'
                        : 'Salary Slip'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {type === 'salarySlip'
                        ? "Latest month's salary slip"
                        : 'Upload clear image or PDF'}
                    </p>
                  </div>
                </div>
                {uploads[type] ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </label>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> All documents should be clear and readable. Accepted formats: JPG, PNG, PDF (max 5MB each)
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allUploaded}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {allUploaded ? 'Continue to Identity Verification' : 'Upload All Documents'}
        </button>
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      {content}
    </div>
  );
}
