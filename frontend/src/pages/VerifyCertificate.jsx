import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../services/operations/certificateAPI';
import CleanInternshipCertificate from '../components/core/Certificate/CleanInternshipCertificate';
import QuickLinks from '../components/common/QuickLinks';
import { formatDate } from '../utils/dateFormatter';

export default function VerifyCertificate() {
  const { certificateId: urlCertificateId } = useParams();
  const [certificateId, setCertificateId] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleVerification = async (id) => {
    if (!id.trim()) {
      setError("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    setError(null);
    setCertificateData(null);

    try {
      const data = await verifyCertificate(id);
      setCertificateData(data);
      setError(null);
    } catch (error) {
      setError(error.message || "Invalid certificate ID");
      setCertificateData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if certificateId is in URL
  useEffect(() => {
    if (urlCertificateId) {
      setCertificateId(urlCertificateId);
      handleVerification(urlCertificateId);
    }
  }, [urlCertificateId]);

  const handleSearch = async () => {
    handleVerification(certificateId);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-richblack-900">
      <div className="flex-1 py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-richblack-5 mb-4">
            Certificate Verification
          </h1>
          <p className="text-richblack-200">
            Enter the certificate ID to verify its authenticity
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter Certificate ID (e.g., BA-25FJ2849)"
              className="flex-1 bg-richblack-700 rounded-lg px-4 py-3 text-richblack-5 border border-richblack-600"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-100 transition-colors duration-200"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <p className="text-pink-200 text-center">{error}</p>
          </div>
        )}

        {/* Certificate Results */}
        {certificateData && !showCertificate && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-richblack-800 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl text-green-500 font-semibold">Certificate Verified Successfully</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-richblack-300">Student Name</label>
                  <p className="text-lg text-richblack-5 font-medium">{certificateData.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm text-richblack-300">Certificate ID</label>
                  <p className="text-richblack-5 font-mono">{certificateData.certificateId}</p>
                </div>
                <div>
                  <label className="block text-sm text-richblack-300">Course Name</label>
                  <p className="text-lg text-richblack-5 font-medium">{certificateData.courseName}</p>
                </div>
                <div>
                  <label className="block text-sm text-richblack-300">Completed on</label>
                  <p className="text-richblack-5">{formatDate(certificateData.completionDate)}</p>
                </div>
                <div>
                  <label className="block text-sm text-richblack-300">Email</label>
                  <p className="text-richblack-5">{certificateData.email}</p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="w-full bg-yellow-50 text-richblack-900 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-colors duration-200"
                  >
                    View Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {showCertificate && certificateData && (
          <div className="w-full flex flex-col items-center">
            <div className="mb-6 w-full max-w-6xl">
              <button
                onClick={() => setShowCertificate(false)}
                className="text-richblack-300 hover:text-yellow-50 transition-colors duration-200"
              >
                ← Back to Details
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 flex justify-center items-center" style={{ minWidth: '1100px', minHeight: '800px' }}>
              <CleanInternshipCertificate certificateData={certificateData} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Links Footer */}
      <QuickLinks />
    </div>
  );
}
