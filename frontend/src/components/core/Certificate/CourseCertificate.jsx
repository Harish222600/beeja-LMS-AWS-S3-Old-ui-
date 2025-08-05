import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatDate } from '../../../utils/dateFormatter';
import { beejaLogo, isoLogo, msmeLogo, founderSign } from '../../../assets/Images/certification img';

export default function CourseCertificate({ certificateData }) {
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
    <div className="relative w-full aspect-[1.414/1] bg-white p-8 text-black">
      {/* Certificate Border */}
      <div className="absolute inset-4 border-4 border-yellow-600"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <img src={beejaLogo} alt="Beeja Logo" className="h-16" />
        <div className="text-right">
          <p className="text-sm">Certificate ID:</p>
          <p className="font-semibold">{certificateData?.certificateId || 'BEEJA-XXXX-XXX'}</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Certificate of Completion</h1>
        <p className="text-xl">This is to certify that</p>
      </div>

      {/* Student Details */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{certificateData?.studentName}</h2>
        <p className="text-lg mb-4">{certificateData?.email}</p>
        <p className="text-xl">
          has successfully completed the course
        </p>
        <h3 className="text-2xl font-bold mt-2">
          {certificateData?.courseName}
        </h3>
      </div>

      {/* Date and Signature */}
      <div className="flex justify-between items-end mt-12">
        <div>
          <p className="text-sm">Date of Completion:</p>
          <p className="font-semibold">{formatDate(certificateData?.completionDate)}</p>
        </div>
        <div className="text-center">
          <img src={founderSign} alt="Founder's Signature" className="h-16 mb-2" />
          <p className="font-semibold">Founder's Signature</p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={isoLogo} alt="ISO Certification" className="h-12" />
            <img src={msmeLogo} alt="MSME Certification" className="h-12" />
          </div>
          <img src={qrCodeUrl} alt="Certificate QR Code" className="h-20" />
        </div>
      </div>
    </div>
  );
}
