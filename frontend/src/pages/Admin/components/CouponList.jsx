import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAllCoupons, toggleCouponStatus } from '../../../services/operations/couponAPI';
import { toast } from 'react-hot-toast';
import CouponDetailsModal from '../../../components/common/CouponDetailsModal';
import { FiTag, FiCalendar, FiUsers, FiDollarSign, FiClock, FiEye, FiSearch, FiX, FiShare2, FiCopy } from 'react-icons/fi';

export default function CouponList() {
  const { token } = useSelector((state) => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showShareMenu, setShowShareMenu] = useState(null);

  // Admin configurable share options
  const [enabledShareOptions] = useState([
    'copy',
    'native'
  ]);

  const generateCouponShareContent = (coupon) => {
    const websiteUrl = window.location.origin;
    const expiryDate = new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🎉 Special Discount Coupon! 🎉

💳 Coupon Code: ${coupon.code}
💰 Discount: ${coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}% OFF` 
      : `₹${coupon.discountValue} OFF`}
🔗 Valid For: ${coupon.linkedTo === 'course' ? 'Individual Courses' : 'Bundle Courses'}
⏰ Valid Until: ${expiryDate}
${coupon.minimumOrderAmount > 0 ? `🛒 Minimum Order: ₹${coupon.minimumOrderAmount}` : ''}

🌐 Visit: ${websiteUrl}

Don't miss out on this amazing offer! 🚀`;
  };

  const handleShare = async (coupon, method) => {
    const shareContent = generateCouponShareContent(coupon);
    const websiteUrl = window.location.origin;

    try {
      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(shareContent);
          toast.success('Coupon details copied to clipboard!');
          break;

        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: `${coupon.code} - Special Discount Coupon`,
              text: shareContent,
              url: websiteUrl
            });
          } else {
            // If Web Share API is not supported, show all sharing options
            const shareData = {
              title: `${coupon.code} - Special Discount Coupon`,
              text: shareContent,
              url: websiteUrl
            };
            
            // Create a temporary element to trigger system share
            const shareButton = document.createElement('button');
            shareButton.addEventListener('click', async () => {
              try {
                await navigator.share(shareData);
              } catch (error) {
                if (error.name !== 'AbortError') {
                  // Fallback to clipboard if sharing fails
                  await navigator.clipboard.writeText(shareContent);
                  toast.success('Copied to clipboard (Sharing not supported)');
                }
              }
            });
            shareButton.click();
            shareButton.remove();
          }
          break;

        default:
          await navigator.clipboard.writeText(shareContent);
          toast.success('Copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing coupon:', error);
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(shareContent);
        toast.success('Coupon details copied to clipboard!');
      } catch (copyError) {
        toast.error('Failed to share coupon');
      }
    }
    setShowShareMenu(null);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('.share-menu-container')) {
        setShowShareMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons(token);
      setCoupons(response);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      setToggleLoading(prev => ({ ...prev, [couponId]: true }));
      const updatedCoupon = await toggleCouponStatus(couponId, token);
      
      // Update the coupon in the local state
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => 
          coupon._id === couponId ? updatedCoupon : coupon
        )
      );
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    } finally {
      setToggleLoading(prev => ({ ...prev, [couponId]: false }));
    }
  };

  const handleCouponClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusInfo = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expiryDate);

    if (!coupon.isActive) {
      return { 
        status: 'Inactive', 
        color: 'text-red-400', 
        bgColor: 'bg-red-900/20', 
        borderColor: 'border-red-500/30',
        icon: '⏸️'
      };
    }
    
    if (now < startDate) {
      return { 
        status: 'Upcoming', 
        color: 'text-yellow-400', 
        bgColor: 'bg-yellow-900/20', 
        borderColor: 'border-yellow-500/30',
        icon: '⏰'
      };
    }
    
    if (now > expiryDate) {
      return { 
        status: 'Expired', 
        color: 'text-red-400', 
        bgColor: 'bg-red-900/20', 
        borderColor: 'border-red-500/30',
        icon: '❌'
      };
    }
    
    return { 
      status: 'Active', 
      color: 'text-green-400', 
      bgColor: 'bg-green-900/20', 
      borderColor: 'border-green-500/30',
      icon: '✅'
    };
  };

  const getUsagePercentage = (coupon) => {
    if (coupon.usageLimit <= 0) return 0;
    return Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100);
  };

  // Filter coupons based on search term and status
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = searchTerm === "" ||
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && coupon.isActive) ||
      (statusFilter === "inactive" && !coupon.isActive) ||
      (statusFilter === "upcoming" && new Date(coupon.startDate) > new Date()) ||
      (statusFilter === "expired" && new Date(coupon.expiryDate) < new Date());
    
    return matchesSearch && matchesStatus;
  });

  const getShareOptionLabel = (option) => {
    const labels = {
      copy: 'Copy to Clipboard',
      native: 'Share via Apps'
    };
    return labels[option] || option;
  };

  const getShareOptionIcon = (option) => {
    const icons = {
      copy: <FiCopy className="text-xs" />,
      native: <FiShare2 className="text-xs" />
    };
    return icons[option] || <FiShare2 className="text-xs" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50"></div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-richblack-700 rounded-2xl p-8 border border-richblack-600">
          <FiTag className="mx-auto text-6xl text-richblack-400 mb-4" />
          <p className="text-richblack-300 text-xl font-semibold mb-2">No coupons created yet</p>
          <p className="text-richblack-400 text-sm">Click "Create Coupon" to add your first coupon and start offering discounts</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-richblack-400" />
            </div>
            <input
              type="text"
              placeholder="Search coupons by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-richblack-400 hover:text-richblack-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Coupons</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-richblack-600 text-richblack-200 rounded-lg hover:bg-richblack-500 transition-colors whitespace-nowrap"
            >
              <FiX className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredCoupons.map((coupon) => {
          const statusInfo = getStatusInfo(coupon);
          const usagePercentage = getUsagePercentage(coupon);
          
          return (
            <div
              key={coupon._id}
              className="bg-gradient-to-r from-richblack-800 to-richblack-700 border border-richblack-600 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-richblack-900/20 transition-all duration-300 hover:border-richblack-500"
            >
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-4 sm:gap-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <FiTag className="text-yellow-50 text-lg sm:text-xl" />
                    <h3 
                      className="text-lg sm:text-2xl font-bold text-richblack-5 cursor-pointer hover:text-yellow-50 transition-colors flex items-center gap-2 group"
                      onClick={() => handleCouponClick(coupon)}
                    >
                      {coupon.code}
                      <FiEye className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full font-medium border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} flex items-center gap-1 w-fit`}>
                      <span>{statusInfo.icon}</span>
                      {statusInfo.status}
                    </span>
                    <span className="text-sm sm:text-lg font-bold text-yellow-50 bg-yellow-900/20 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30 w-fit">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-richblack-400 cursor-pointer hover:text-richblack-300 transition-colors" onClick={() => handleCouponClick(coupon)}>
                    💡 Click coupon code to view detailed information
                  </p>
                </div>

                {/* Actions Section */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-richblack-400 mb-1">Usage</p>
                    <p className="text-base sm:text-lg font-bold text-richblack-200">
                      {coupon.usedCount}
                      {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                    </p>
                    {coupon.usageLimit > 0 && (
                      <div className="w-16 sm:w-20 bg-richblack-600 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col items-center gap-3">
                    {/* Share Button */}
                    <div className="relative share-menu-container">
                      <button
                        onClick={() => setShowShareMenu(showShareMenu === coupon._id ? null : coupon._id)}
                        className="flex items-center gap-1 px-2 py-1 text-yellow-50 hover:text-yellow-100 transition-colors"
                        title="Share Coupon"
                      >
                        <FiShare2 className="text-sm" />
                        <span className="text-xs">Share</span>
                      </button>

                      {/* Dynamic Share Menu - Matching existing design */}
                      {showShareMenu === coupon._id && (
                        <div className="absolute right-0 top-full mt-1 bg-richblack-700 border border-richblack-600 rounded-md shadow-lg z-50 min-w-[140px]">
                          <div className="py-1">
                            {enabledShareOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleShare(coupon, option)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-richblack-300 hover:bg-richblack-600 hover:text-richblack-100 transition-colors text-left"
                              >
                                {getShareOptionIcon(option)}
                                {getShareOptionLabel(option)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex flex-col items-center gap-2">
                      <span className={`text-xs font-medium ${coupon.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(coupon._id)}
                        disabled={toggleLoading[coupon._id]}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-richblack-800 ${
                          coupon.isActive
                            ? 'bg-green-500 focus:ring-green-500'
                            : 'bg-richblack-600 focus:ring-richblack-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            coupon.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {toggleLoading[coupon._id] && (
                        <div className="animate-spin rounded-full h-3 w-3 border border-richblack-400 border-t-transparent"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-richblack-700/50 p-3 sm:p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="text-blue-400 text-sm" />
                    <p className="text-richblack-400 text-xs sm:text-sm font-medium">Valid From</p>
                  </div>
                  <p className="text-richblack-200 font-semibold text-sm sm:text-base">{formatDate(coupon.startDate)}</p>
                </div>

                <div className="bg-richblack-700/50 p-3 sm:p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="text-red-400 text-sm" />
                    <p className="text-richblack-400 text-xs sm:text-sm font-medium">Valid Until</p>
                  </div>
                  <p className="text-richblack-200 font-semibold text-sm sm:text-base">{formatDate(coupon.expiryDate)}</p>
                </div>

                <div className="bg-richblack-700/50 p-3 sm:p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="text-green-400 text-sm" />
                    <p className="text-richblack-400 text-xs sm:text-sm font-medium">Min. Order</p>
                  </div>
                  <p className="text-richblack-200 font-semibold text-sm sm:text-base">
                    {coupon.minimumOrderAmount > 0 ? `₹${coupon.minimumOrderAmount}` : 'No minimum'}
                  </p>
                </div>

                <div className="bg-richblack-700/50 p-3 sm:p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="text-purple-400 text-sm" />
                    <p className="text-richblack-400 text-xs sm:text-sm font-medium">Per User Limit</p>
                  </div>
                  <p className="text-richblack-200 font-semibold text-sm sm:text-base">
                    {coupon.perUserLimit > 0 ? `${coupon.perUserLimit} uses` : 'Unlimited'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {(coupon.usageLimit > 0 || coupon.perUserLimit > 0) && (
                <div className="pt-3 sm:pt-4 border-t border-richblack-600/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                    {coupon.usageLimit > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-richblack-400">Total Usage Progress:</span>
                        <span className="text-richblack-300 font-medium">
                          {usagePercentage.toFixed(1)}% ({coupon.usedCount}/{coupon.usageLimit})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-richblack-400">Created:</span>
                      <span className="text-richblack-300">{formatDate(coupon.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CouponDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        coupon={selectedCoupon}
      />
    </>
  );
}
