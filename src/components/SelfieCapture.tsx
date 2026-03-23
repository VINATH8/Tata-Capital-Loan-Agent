import { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

interface SelfieCaptureProps {
  onCapture: (selfieData: string) => void;
  panCardPhoto?: string;
  aadharCardPhoto?: string;
  onClose?: () => void;
  standalone?: boolean;
}

export default function SelfieCapture({
  onCapture,
  panCardPhoto,
  aadharCardPhoto,
  onClose,
  standalone = false,
}: SelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedPhoto(photoData);
        stopCamera();
      }
    }
  };

  const verifyPhoto = async () => {
    if (!capturedPhoto) return;
    setIsVerifying(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated match logic — you can later integrate real face comparison APIs here.
    const matchScore = Math.random();
    if (matchScore > 0.3) {
      setVerificationResult('success');
      setTimeout(() => {
        onCapture(capturedPhoto);
      }, 1500);
    } else {
      setVerificationResult('failed');
      setTimeout(() => {
        setCapturedPhoto(null);
        setVerificationResult(null);
        setIsVerifying(false);
        startCamera();
      }, 2000);
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
    setVerificationResult(null);
    startCamera();
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 z-10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
        <h2 className="text-2xl font-bold">Identity Verification</h2>
        <p className="text-blue-100 text-sm mt-1">Capture a selfie for face verification</p>
      </div>

      <div className="p-8">
        {/* ✅ Preview Uploaded PAN/Aadhaar Photos */}
        {(panCardPhoto || aadharCardPhoto) && (
          <div className="flex gap-4 mb-6 justify-center">
            {panCardPhoto && (
              <div className="text-center">
                <img
                  src={panCardPhoto}
                  alt="PAN Card"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-300 shadow"
                />
                <p className="text-xs text-gray-600 mt-1">PAN Card</p>
              </div>
            )}
            {aadharCardPhoto && (
              <div className="text-center">
                <img
                  src={aadharCardPhoto}
                  alt="Aadhaar Card"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-300 shadow"
                />
                <p className="text-xs text-gray-600 mt-1">Aadhaar Card</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-900 rounded-xl overflow-hidden mb-6 relative aspect-video">
          {!capturedPhoto ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={capturedPhoto} alt="Captured selfie" className="w-full h-full object-cover" />
          )}

          {isVerifying && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Verifying your identity...</p>
              </div>
            </div>
          )}

          {verificationResult === 'success' && (
            <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
              <div className="text-white text-center">
                <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                <p className="text-2xl font-bold">Verification Successful!</p>
              </div>
            </div>
          )}

          {verificationResult === 'failed' && (
            <div className="absolute inset-0 bg-red-600 bg-opacity-90 flex items-center justify-center">
              <div className="text-white text-center">
                <AlertCircle className="w-20 h-20 mx-auto mb-4" />
                <p className="text-2xl font-bold">Verification Failed</p>
                <p className="mt-2">Please try again</p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 font-semibold">Instructions:</p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>Position your face in the center of the frame</li>
            <li>Ensure good lighting on your face</li>
            <li>Remove glasses or any face coverings</li>
            <li>Look directly at the camera</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          {!capturedPhoto ? (
            <button
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Photo</span>
            </button>
          ) : (
            !isVerifying &&
            !verificationResult && (
              <>
                <button
                  onClick={retake}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Retake
                </button>
                <button
                  onClick={verifyPhoto}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify & Continue</span>
                </button>
              </>
            )
          )}
        </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] p-4">
      {content}
    </div>
  );
}
