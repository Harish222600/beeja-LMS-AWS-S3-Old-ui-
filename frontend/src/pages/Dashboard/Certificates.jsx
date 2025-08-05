import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserCertificates } from '../../services/operations/certificateAPI';
import CertificateModal from '../../components/core/Certificate/CertificateModal';
import { formatDate } from '../../utils/dateFormatter';

export default function Certificates() {
  const { token } = useSelector((state) => state.auth);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getUserCertificates(token);
        setCertificates(data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [token]);

  if (loading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">My Certificates</h1>
      {certificates.length === 0 ? (
        <p className="text-center text-richblack-100">
          You haven't earned any certificates yet. Complete a course to get your first certificate!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.certificateId}
              onClick={() => setSelectedCertificate(certificate)}
              className="cursor-pointer rounded-lg border border-richblack-700 bg-richblack-800 p-4 hover:scale-105 transition-transform"
            >
              <h3 className="text-lg font-semibold text-richblack-5 mb-2">
                {certificate.courseName}
              </h3>
              <div className="text-sm text-richblack-300">
                <p>Certificate ID: {certificate.certificateId}</p>
                <p>Completed on: {formatDate(certificate.completionDate)}</p>
              </div>
              <button className="mt-4 text-yellow-50 text-sm">
                View Certificate →
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <CertificateModal
          certificateData={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </>
  );
}
