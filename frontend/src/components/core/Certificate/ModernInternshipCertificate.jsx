import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatDate } from '../../../utils/dateFormatter';
import { founderSign, isoLogo, msmeLogo } from '../../../assets/Images/certification img';

export default function ModernInternshipCertificate({ certificateData }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      if (certificateData?.certificateId) {
        try {
          const url = await QRCode.toDataURL(
            `${window.location.origin}/verify-certificate/${certificateData.certificateId}`
          );
          setQrCodeUrl(url);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
    };
    generateQR();
  }, [certificateData?.certificateId]);

  return (
    <div className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-slate-50 to-blue-50 p-8 overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/3 left-4 w-16 h-16 bg-gradient-to-br from-pink-200 to-blue-200 transform rotate-45 opacity-20"></div>
      </div>

      {/* Main Certificate Container */}
      <div className="relative z-10 h-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-10">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            C.ID: {certificateData?.certificateId || 'ab71a6b'}
          </div>
          <div className="flex items-center gap-4">
            {/* Modern Logo */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">CS</span>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                CODSOFT
              </h1>
              <p className="text-xs text-gray-500 font-medium">TECHNOLOGY SOLUTIONS</p>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <h2 className="text-5xl font-bold text-gray-800 tracking-wide mb-2">
              CERTIFICATE
            </h2>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-gray-700">OF COMPLETION</p>
            <p className="text-lg text-gray-500">PROUDLY PRESENTED TO</p>
          </div>
        </div>

        {/* Recipient Name */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <h3 className="text-4xl font-bold text-gray-800 px-8 py-2">
              {certificateData?.studentName || 'Joshwa A'}
            </h3>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="text-center space-y-4 mb-12 max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed">
            has successfully completed <span className="font-bold text-blue-600">4 weeks</span> of a virtual Course program in
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 my-4">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {certificateData?.courseName || 'Web Development'}
            </h4>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            with wonderful remarks at <span className="font-bold text-purple-600">CODSOFT</span> from{' '}
            <span className="font-semibold text-blue-600">15/05/2025</span> to{' '}
            <span className="font-semibold text-blue-600">15/06/2025</span>
          </p>
          <p className="text-base text-gray-600 leading-relaxed italic">
            "We were truly amazed by his/her showcased skills and invaluable contributions to
            the tasks and projects throughout the Course."
          </p>
        </div>

        {/* Footer Section */}
        <div className="absolute bottom-8 left-10 right-10">
          <div className="flex justify-between items-end mb-6">
            
            {/* QR Code */}
            <div className="flex flex-col items-center">
              {qrCodeUrl && (
                <div className="p-3 bg-white rounded-xl shadow-lg border border-gray-100">
                  <img src={qrCodeUrl} alt="Certificate QR Code" className="w-16 h-16" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Verify Online</p>
            </div>

            {/* Signature */}
            <div className="text-center">
              <div className="mb-3">
                <img src={founderSign} alt="Founder's Signature" className="h-14 mx-auto" />
              </div>
              <div className="w-40 border-t-2 border-gray-300 pt-2">
                <p className="font-semibold text-gray-700 text-sm">Founder</p>
                <p className="text-xs text-gray-500">Chief Executive Officer</p>
              </div>
            </div>

            {/* Certification Badges */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white text-center leading-tight">ISO<br/>9001</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Certified</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <img src={msmeLogo} alt="MSME" className="w-8 h-8 object-contain brightness-0 invert" />
                </div>
                <p className="text-xs text-gray-500 mt-1">MSME</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              contact@codsoft.in
            </span>
            <span className="font-medium text-gray-700">www.codsoft.in</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Date: {formatDate(certificateData?.completionDate) || '18/06/2025'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
