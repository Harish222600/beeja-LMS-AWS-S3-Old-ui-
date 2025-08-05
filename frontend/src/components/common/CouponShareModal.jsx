import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShare2, FiCopy, FiMail, FiMessageCircle, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaTelegram } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CouponShareModal = ({ isOpen, onClose, coupon }) => {
  const [copied, setCopied] = useState(false);

  if (!coupon) return null;

  const generateShareText = () => {
    const discountText = coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}% OFF` 
      : `₹${coupon.discountValue} OFF`;
    
    const minOrderText = coupon.minimumOrderAmount > 0 
      ? ` (Min order: ₹${coupon.minimumOrderAmount})` 
      : '';

    return `🎉 Exclusive Coupon Alert! 🎉\n\nUse code: ${coupon.code}\nGet ${discountText}${minOrderText}\n\nValid until: ${new Date(coupon.expiryDate).toLocaleDateString('en-IN')}\n\nDon't miss out on this amazing deal! 🛒✨`;
  };

  const generateShareUrl = () => {
    // You can customize this URL to point to your checkout page with the coupon pre-applied
    const baseUrl = window.location.origin;
    return `${baseUrl}/courses?coupon=${coupon.code}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success('Coupon code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy coupon code');
    }
  };

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      toast.success('Share text copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share text');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl());
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share link');
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="text-green-500" />,
      action: () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://wa.me/?text=${text}`, '_blank');
      },
      bgColor: 'hover:bg-green-500/10',
      borderColor: 'hover:border-green-500/30'
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="text-blue-500" />,
      action: () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://t.me/share/url?text=${text}`, '_blank');
      },
      bgColor: 'hover:bg-blue-500/10',
      borderColor: 'hover:border-blue-500/30'
    },
    {
      name: 'Twitter',
      icon: <FaTwitter className="text-blue-400" />,
      action: () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
      },
      bgColor: 'hover:bg-blue-400/10',
      borderColor: 'hover:border-blue-400/30'
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="text-blue-600" />,
      action: () => {
        const url = encodeURIComponent(generateShareUrl());
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      },
      bgColor: 'hover:bg-blue-600/10',
      borderColor: 'hover:border-blue-600/30'
    },
    {
      name: 'Email',
      icon: <FiMail className="text-yellow-500" />,
      action: () => {
        const subject = encodeURIComponent(`Exclusive Coupon: ${coupon.code}`);
        const body = encodeURIComponent(generateShareText());
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      },
      bgColor: 'hover:bg-yellow-500/10',
      borderColor: 'hover:border-yellow-500/30'
    }
  ];

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
            className="relative bg-richblack-800 rounded-2xl p-6 max-w-md w-full border border-richblack-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FiShare2 className="text-yellow-50 text-xl" />
                <h2 className="text-xl font-bold text-richblack-5">Share Coupon</h2>
              </div>
              <button
                onClick={onClose}
                className="text-richblack-400 hover:text-richblack-200 transition-colors p-2 hover:bg-richblack-700 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Coupon Info */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-50 mb-2">{coupon.code}</h3>
                <p className="text-lg font-semibold text-yellow-100">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}% OFF` 
                    : `₹${coupon.discountValue} OFF`}
                </p>
                {coupon.minimumOrderAmount > 0 && (
                  <p className="text-sm text-yellow-200 mt-1">
                    Min order: ₹{coupon.minimumOrderAmount}
                  </p>
                )}
                <p className="text-xs text-yellow-300 mt-2">
                  Valid until: {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center justify-center gap-3 p-3 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 hover:border-richblack-500 rounded-lg transition-all duration-200"
              >
                {copied ? <FiCheck className="text-green-400" /> : <FiCopy className="text-richblack-300" />}
                <span className="text-richblack-100 font-medium">
                  {copied ? 'Copied!' : 'Copy Coupon Code'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyShareText}
                  className="flex items-center justify-center gap-2 p-3 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 hover:border-richblack-500 rounded-lg transition-all duration-200"
                >
                  <FiCopy className="text-richblack-300 text-sm" />
                  <span className="text-richblack-100 text-sm font-medium">Copy Text</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 p-3 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 hover:border-richblack-500 rounded-lg transition-all duration-200"
                >
                  <FiCopy className="text-richblack-300 text-sm" />
                  <span className="text-richblack-100 text-sm font-medium">Copy Link</span>
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div>
              <h4 className="text-sm font-medium text-richblack-300 mb-3">Share via:</h4>
              <div className="grid grid-cols-3 gap-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className={`flex flex-col items-center gap-2 p-3 bg-richblack-700 border border-richblack-600 rounded-lg transition-all duration-200 ${option.bgColor} ${option.borderColor}`}
                  >
                    <div className="text-xl">{option.icon}</div>
                    <span className="text-xs text-richblack-300 font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-richblack-600">
              <p className="text-xs text-richblack-400 text-center">
                Share this coupon to help others save money! 💰
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CouponShareModal;
