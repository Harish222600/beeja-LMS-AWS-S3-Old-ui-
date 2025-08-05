import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { FiFileText } from "react-icons/fi";
import { apiConnector } from "../../../../services/apiConnector";
import { courseEndpoints } from "../../../../services/apis";
import OrderViewModal from "../../../../pages/Admin/components/OrderViewModal";

const { COURSE_PURCHASE_HISTORY_API } = courseEndpoints;

export default function PurchaseHistory() {
  const { token } = useSelector((state) => state.auth);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      setLoading(true);
      try {
        const response = await apiConnector(
          "GET",
          COURSE_PURCHASE_HISTORY_API,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        if (response?.data?.success) {
          setPurchases(response.data.data);
        } else {
          throw new Error("Could not fetch purchase history");
        }
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    };

    fetchPurchaseHistory();
  }, [token]);

  const handleViewInvoice = (purchase) => {
    // Convert purchase data to order format for the admin invoice modal
    const orderData = {
      _id: purchase._id,
      transactionId: purchase.transactionId || `TXN_${purchase._id.slice(-8)}`,
      purchaseDate: purchase.purchaseDate,
      amount: purchase.price,
      originalPrice: purchase.originalPrice || purchase.price,
      discountAmount: purchase.discountAmount || 0,
      couponUsed: purchase.couponUsed || null,
      paymentMethod: purchase.paymentMethod || 'Online',
      course: {
        courseName: purchase.courseName,
        instructor: {
          firstName: purchase.instructor || 'DineshKumar'
        }
      },
      user: {
        firstName: purchase.userFirstName || 'Student',
        lastName: purchase.userLastName || '',
        email: purchase.userEmail || 'N/A',
        additionalDetails: {
          contactNumber: purchase.userPhone || 'N/A'
        }
      }
    };
    
    setSelectedOrder(orderData);
    setShowInvoiceModal(true);
  };

  return (
    <div className="mx-auto w-11/12 max-w-[1000px] py-10">
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Purchase History</h1>
      {loading ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : purchases.length === 0 ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-richblack-5">
              No purchase history found
            </p>
            <p className="mt-1 text-sm text-richblack-300">
              You haven't purchased any courses yet.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block my-8 text-richblack-5">
            <div className="flex rounded-t-lg bg-richblack-500 ">
              <p className="w-[40%] px-5 py-3">Course</p>
              <p className="w-[18%] px-2 py-3">Purchase Date</p>
              <p className="w-[15%] px-2 py-3">Price</p>
              <p className="w-[15%] px-2 py-3">Status</p>
              <p className="w-[12%] px-2 py-3">Invoice</p>
            </div>
            {purchases.map((purchase, i, arr) => (
              <div
                className={`flex items-center border border-richblack-700 ${
                  i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                }`}
                key={purchase._id}
              >
                <div className="flex w-[40%] cursor-pointer items-center gap-4 px-5 py-3">
                  <img
                    src={purchase.thumbnail}
                    alt="course_img"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex max-w-xs flex-col gap-2">
                    <p className="font-semibold">{purchase.courseName}</p>
                    <p className="text-xs text-richblack-300">
                      {purchase.courseDescription?.length > 50
                        ? `${purchase.courseDescription.slice(0, 50)}...`
                        : purchase.courseDescription}
                    </p>
                  </div>
                </div>
                <div className="w-[18%] px-2 py-3">
                  <p className="text-sm font-medium text-richblack-100">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-[15%] px-2 py-3">
                  <p className="text-sm font-medium text-richblack-100">
                    {purchase.price === 0 ? "Free" : `₹${purchase.price}`}
                  </p>
                </div>
                <div className="w-[15%] px-2 py-3">
                  <p className="text-sm font-medium text-yellow-100">
                    {purchase.status}
                  </p>
                </div>
                <div className="w-[12%] px-2 py-3">
                  <button
                    onClick={() => handleViewInvoice(purchase)}
                    className="flex items-center gap-1 rounded-md bg-yellow-50 px-3 py-1 text-xs font-medium text-richblack-900 hover:bg-yellow-25"
                  >
                    <FiFileText size={14} />
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase._id} className="bg-richblack-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <img
                    src={purchase.thumbnail}
                    alt="course_img"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 flex flex-col">
                    <p className="font-semibold text-richblack-5">{purchase.courseName}</p>
                    <p className="text-xs text-richblack-300">
                      {purchase.courseDescription?.length > 50
                        ? `${purchase.courseDescription.slice(0, 50)}...`
                        : purchase.courseDescription}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-richblack-100">
                  <div>
                    <p className="font-medium">Purchase Date</p>
                    <p>{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Price</p>
                    <p>{purchase.price === 0 ? "Free" : `₹${purchase.price}`}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-yellow-100">Status</p>
                  <p>{purchase.status}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => handleViewInvoice(purchase)}
                    className="flex items-center gap-2 rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25"
                  >
                    <FiFileText size={16} />
                    Download Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
