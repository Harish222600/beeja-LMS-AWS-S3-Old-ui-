import { useState } from 'react';
import CouponForm from './components/CouponForm';
import CouponList from './components/CouponList';

export default function Coupons() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateCoupon = () => {
    setShowCreateForm(true);
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-medium text-richblack-5">
          Coupon Management
        </h1>
        {!showCreateForm && (
          <button
            onClick={handleCreateCoupon}
            className="bg-yellow-50 text-richblack-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium hover:scale-95 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
          >
            Create Coupon
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="flex flex-col gap-4 sm:gap-6 bg-richblack-800 p-4 sm:p-6 rounded-lg border-[1px] border-richblack-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h2 className="text-lg font-semibold text-richblack-5">
              Create New Coupon
            </h2>
            <button
              onClick={handleBackToList}
              className="text-richblack-300 hover:text-richblack-100 transition-colors text-sm sm:text-base self-start sm:self-auto"
            >
              ← Back to List
            </button>
          </div>
          <CouponForm onSuccess={handleBackToList} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          <CouponList />
        </div>
      )}
    </div>
  );
}
