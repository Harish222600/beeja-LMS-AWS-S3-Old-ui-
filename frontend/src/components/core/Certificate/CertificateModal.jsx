import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import CleanInternshipCertificate from './CleanInternshipCertificate';
import IconBtn from '../../common/IconBtn';

export default function CertificateModal({ onClose, certificateData }) {
  const certificateRef = useRef();

  const handleDownload = useReactToPrint({
    contentRef: certificateRef,
    documentTitle: `${certificateData?.courseName}_Enhanced_Certificate`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        html, body {
          margin: 0;
          padding: 0;
          background: white;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        body > div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `
  });

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="min-h-[80vh] w-11/12 max-w-[1200px] rounded-lg border border-richblack-400 bg-richblack-800 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-richblack-5">Course Certificate</p>
          <button
            onClick={onClose}
            className="text-richblack-5 hover:text-richblack-50"
          >
            Close
          </button>
        </div>
        
        <div className="mt-4 flex flex-col items-center">
          <div ref={certificateRef} className="w-full overflow-x-auto">
            <CleanInternshipCertificate certificateData={certificateData} />
          </div>
          
          <div className="mt-4">
            <IconBtn
              text="Download Course Certificate"
              onClick={handleDownload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
