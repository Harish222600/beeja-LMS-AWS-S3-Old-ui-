import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatDate } from '../../../utils/dateFormatter';
import { founderSign, isoLogo, msmeLogo } from '../../../assets/Images/certification img';

export default function InternshipCertificate({ certificateData }) {
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
    <div className="relative w-full aspect-[1.414/1] bg-white overflow-hidden">
      {/* Background geometric design */}
      <div className="absolute inset-0">
        {/* Top left triangle */}
        <div className="absolute top-0 left-0 w-0 h-0 border-l-[200px] border-l-blue-100 border-b-[200px] border-b-transparent"></div>
        
        {/* Top right triangle */}
        <div className="absolute top-0 right-0 w-0 h-0 border-r-[300px] border-r-indigo-900 border-b-[150px] border-b-transparent"></div>
        
        {/* Bottom left triangle */}
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[250px] border-l-blue-200 border-t-[180px] border-t-transparent"></div>
        
        {/* Bottom right triangle */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[400px] border-r-indigo-900 border-t-[200px] border-t-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 p-12 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">C.ID:</span> {certificateData?.certificateId || 'ab71a6b'}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-indigo-900">CodSoft</h1>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4 tracking-wider">CERTIFICATE</h2>
          <p className="text-xl text-gray-600 mb-2">OF COMPLETION</p>
          <p className="text-lg text-gray-600">PROUDLY PRESENTED TO</p>
        </div>

        {/* Student Name */}
        <div className="text-center mb-8">
          <div className="border-b-2 border-gray-800 pb-2 mb-6 max-w-md mx-auto">
            <h3 className="text-4xl font-bold text-gray-800">{certificateData?.studentName || 'Joshwa A'}</h3>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed">
            has successfully completed <span className="font-semibold">4 weeks</span> of a virtual Course program in
          </p>
          <h4 className="text-2xl font-bold text-gray-800 my-3">
            {certificateData?.courseName || 'Web Development'}
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed">
            with wonderful remarks at <span className="font-bold">CODSOFT</span> from{' '}
            <span className="font-semibold">15/05/2025</span> to{' '}
            <span className="font-semibold">15/06/2025</span>.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            We were truly amazed by his/her showcased skills and invaluable contributions to
            the tasks and projects throughout the Course.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex justify-between items-end">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="Certificate QR Code" className="w-20 h-20" />
              )}
            </div>

            {/* Signature */}
            <div className="text-center">
              <div className="mb-2">
                <img src={founderSign} alt="Founder's Signature" className="h-16 mx-auto" />
              </div>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-sm font-semibold text-gray-700">Founder</p>
              </div>
            </div>

            {/* Award Badge */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-2 relative">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-900">AWARD</span>
                </div>
                {/* Badge ribbons */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-8 bg-yellow-400"></div>
                  <div className="w-6 h-4 bg-yellow-500 transform rotate-45 origin-top"></div>
                </div>
              </div>
            </div>

            {/* Certification Badges */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white text-center leading-tight">ISO<br/>9001:2015<br/>COMPANY</span>
              </div>
              <img src={msmeLogo} alt="MSME Certification" className="h-12" />
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
            <span>contact@codsoft.in</span>
            <span>www.codsoft.in</span>
            <span>Date: {formatDate(certificateData?.completionDate) || '18/06/2025'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
