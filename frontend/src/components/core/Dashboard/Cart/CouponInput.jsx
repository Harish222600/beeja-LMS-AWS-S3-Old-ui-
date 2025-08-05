import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { validateAndApplyCoupon, getAllCoupons } from '../../../../services/operations/couponAPI';
import { toast } from 'react-hot-toast';
import CouponSuccessModal from '../../../common/CouponSuccessModal';

export default function CouponInput({ totalAmount, onCouponApply, checkoutType = 'course' }) {
  const { token } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [pricePreview, setPricePreview] = useState(null);

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        // Use null for token to force using the frontend endpoint, pass checkoutType as linkedTo
        const coupons = await getAllCoupons(null, checkoutType);
        
        // Additional safety check to ensure only coupons with matching linkedTo are shown
        const filteredCoupons = coupons.filter(coupon => coupon.linkedTo === checkoutType);
        
        setAvailableCoupons(filteredCoupons);
      } catch (error) {
        // Silently handle error - coupons will just not be displayed
      }
    };

    fetchAvailableCoupons();
  }, [checkoutType]);

  const handleCouponValidation = async (code) => {
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    // Check if user is authenticated
    if (!token) {
      toast.error('Please login to apply coupons');
      return;
    }

    setLoading(true);
    setPricePreview(null);
    
    try {
      // Use the new combined endpoint to validate and apply in one call
      const result = await validateAndApplyCoupon(
        {
          code,
          totalAmount,
          checkoutType
        },
        token
      );

      if (result.success) {
        // Store the applied coupon details
        setAppliedCoupon({
          code,
          discountAmount: result.data.discountAmount,
          finalAmount: result.data.finalAmount
        });
        
        // Call the parent component's callback with discount details
        onCouponApply(result.data);
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Clear any price preview
        setPricePreview(null);
      }
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message && error.message.includes('Token is Missing')) {
        toast.error('Please login to apply coupons');
      } else if (error.message && error.message.includes('Too many coupon attempts')) {
        toast.error('Too many attempts. Please wait before trying again.');
      } else if (error.message && error.message.includes('not applicable for this checkout type')) {
        toast.error('This coupon cannot be used for this type of purchase.');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Invalid coupon code. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleApplyCoupon = () => handleCouponValidation(couponCode);
  const handleApplyCouponWithCode = (code) => handleCouponValidation(code);

  const handleCancelCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setPricePreview(null);
    onCouponApply({ discountAmount: 0 });
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-6 border-[1px] border-richblack-700 rounded-lg bg-richblack-800">
        {/* Available Coupons Section - Above input field */}
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div className="mb-4">
            <p className="text-sm text-yellow-50 font-medium mb-3">Available Coupons:</p>
            <div className="flex flex-wrap gap-3">
              {availableCoupons.map((coupon) => (
                <button
                  key={coupon._id}
                  onClick={async () => {
                    setCouponCode(coupon.code);
                    // Apply coupon directly with the coupon code
                    await handleApplyCouponWithCode(coupon.code);
                  }}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-richblack-700 to-richblack-600 
                    text-yellow-50 rounded-lg hover:from-richblack-600 hover:to-richblack-700 
                    transition-all duration-200 flex items-center gap-3 group border border-richblack-600
                    hover:border-yellow-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-yellow-100 font-semibold">{coupon.code}</span>
                    <span className="text-xs text-richblack-300 group-hover:text-richblack-200">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% off` 
                        : `₹${coupon.discountValue} off`}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-100 rounded-full border border-yellow-700">
                    Click to apply
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-lg font-semibold text-richblack-5">Have a coupon?</p>
          <div className="flex gap-4">
            <input
              type="text"
              value={appliedCoupon ? appliedCoupon.code : couponCode}
              onChange={(e) => !appliedCoupon && setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className={`w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 
                placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 
                focus:border-transparent transition-all duration-200 ${
                appliedCoupon ? 'bg-richblack-600 text-richblack-300' : 'hover:bg-richblack-600/50'
              }`}
              disabled={loading || appliedCoupon}
            />
            <button
              onClick={appliedCoupon ? handleCancelCoupon : handleApplyCoupon}
              disabled={loading}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 
                ${appliedCoupon 
                  ? 'bg-richblack-700 text-yellow-50 hover:bg-richblack-600 border border-yellow-50/20 hover:border-yellow-50/40' 
                  : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-richblack-900 hover:from-yellow-100 hover:to-yellow-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-richblack-900 border-t-transparent rounded-full animate-spin"></div>
                  Applying...
                </>
              ) : appliedCoupon ? (
                'Cancel Coupon'
              ) : (
                'Apply'
              )}
            </button>
          </div>
        </div>


        {appliedCoupon && (
          <div className="flex items-center gap-2 text-sm text-caribbeangreen-100">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              Coupon applied successfully!
            </span>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <CouponSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        discountAmount={appliedCoupon?.discountAmount || 0}
      />
    </>
  );
}
