import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTag, FiCalendar, FiUsers, FiPercent, FiDollarSign, FiClock, FiShoppingCart, FiShare2 } from 'react-icons/fi';

const CouponDetailsModal = ({ isOpen, onClose, coupon }) => {
  if (!coupon) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expiryDate);

    if (!coupon.isActive) {
      return { status: 'Inactive', color: 'text-red-400', bgColor: 'bg-red-900/20', borderColor: 'border-red-700' };
    }
    
    if (now < startDate) {
      return { status: 'Upcoming', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20', borderColor: 'border-yellow-700' };
    }
    
    if (now > expiryDate) {
      return { status: 'Expired', color: 'text-red-400', bgColor: 'bg-red-900/20', borderColor: 'border-red-700' };
    }
    
    return { status: 'Active', color: 'text-green-400', bgColor: 'bg-green-900/20', borderColor: 'border-green-700' };
  };

  const statusInfo = getStatusInfo();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-richblack-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-richblack-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FiTag className="text-yellow-50 text-2xl" />
                <h2 className="text-2xl font-bold text-richblack-5">Coupon Details</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    // Small delay to prevent modal overlap
                    setTimeout(() => {
                      if (typeof window !== 'undefined') {
                        // Create and dispatch a custom event
                        const event = new CustomEvent('shareCoupon', { detail: coupon });
                        window.dispatchEvent(event);
                      }
                    }, 100);
                  }}
                  className="text-richblack-400 hover:text-yellow-50 transition-colors p-2 hover:bg-richblack-700 rounded-lg group"
                  title="Share Coupon"
                >
                  <FiShare2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={onClose}
                  className="text-richblack-400 hover:text-richblack-200 transition-colors p-2 hover:bg-richblack-700 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Coupon Code and Status */}
            <div className={`p-6 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor} mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-bold text-richblack-5 mb-2">{coupon.code}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                      {statusInfo.status}
                    </span>
                    <span className="text-lg font-semibold text-yellow-50">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-richblack-400">Usage</p>
                  <p className="text-xl font-bold text-richblack-5">
                    {coupon.usedCount}
                    {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Discount Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 mb-2">
                  {coupon.discountType === 'percentage' ? (
                    <FiPercent className="text-green-400" />
                  ) : (
                    <FiDollarSign className="text-green-400" />
                  )}
                  <h4 className="font-semibold text-richblack-5">Discount Type</h4>
                </div>
                <p className="text-richblack-300 capitalize">{coupon.discountType}</p>
                <p className="text-lg font-bold text-green-400">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : `₹${coupon.discountValue}`}
                </p>
              </div>

              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 mb-2">
                  <FiShoppingCart className="text-blue-400" />
                  <h4 className="font-semibold text-richblack-5">Minimum Order</h4>
                </div>
                <p className="text-richblack-300">Required amount</p>
                <p className="text-lg font-bold text-blue-400">
                  {coupon.minimumOrderAmount > 0 ? `₹${coupon.minimumOrderAmount}` : 'No minimum'}
                </p>
              </div>
            </div>

            {/* Date Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="text-yellow-400" />
                  <h4 className="font-semibold text-richblack-5">Valid From</h4>
                </div>
                <p className="text-richblack-300">{formatDate(coupon.startDate)}</p>
              </div>

              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="text-red-400" />
                  <h4 className="font-semibold text-richblack-5">Valid Until</h4>
                </div>
                <p className="text-richblack-300">{formatDate(coupon.expiryDate)}</p>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-purple-400" />
                  <h4 className="font-semibold text-richblack-5">Total Usage Limit</h4>
                </div>
                <p className="text-richblack-300">
                  {coupon.usageLimit > 0 ? `${coupon.usageLimit} uses` : 'Unlimited'}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-richblack-400 mb-1">
                    <span>Used</span>
                    <span>{coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}</span>
                  </div>
                  {coupon.usageLimit > 0 && (
                    <div className="w-full bg-richblack-600 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-orange-400" />
                  <h4 className="font-semibold text-richblack-5">Per User Limit</h4>
                </div>
                <p className="text-richblack-300">
                  {coupon.perUserLimit > 0 ? `${coupon.perUserLimit} uses per user` : 'Unlimited per user'}
                </p>
              </div>
            </div>

            {/* User Usage Details */}
            {coupon.userUsage && coupon.userUsage.length > 0 && (
              <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600 mb-6">
                <h4 className="font-semibold text-richblack-5 mb-3 flex items-center gap-2">
                  <FiUsers className="text-cyan-400" />
                  User Usage History ({coupon.userUsage.length} users)
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  {coupon.userUsage.slice(0, 5).map((usage, index) => (
                    <div key={index} className="flex justify-between items-center py-1 text-sm">
                      <span className="text-richblack-300">User ID: {usage.user}</span>
                      <span className="text-richblack-400">{usage.usedCount} uses</span>
                    </div>
                  ))}
                  {coupon.userUsage.length > 5 && (
                    <p className="text-xs text-richblack-400 mt-2">
                      ... and {coupon.userUsage.length - 5} more users
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
              <h4 className="font-semibold text-richblack-5 mb-3">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-richblack-400">Created</p>
                  <p className="text-richblack-300">{formatDate(coupon.createdAt)}</p>
                </div>
                <div>
                  <p className="text-richblack-400">Last Updated</p>
                  <p className="text-richblack-300">{formatDate(coupon.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-richblack-600 text-richblack-200 rounded-lg hover:bg-richblack-500 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CouponDetailsModal;
