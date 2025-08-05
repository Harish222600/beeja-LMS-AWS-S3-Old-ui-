const Coupon = require('../models/coupon');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      minimumOrderAmount,
      courses,
      categories,
      startDate,
      expiryDate,
      isActive,
      linkedTo,
      showOnFront,
      priority,
      isCombinable
    } = req.body;

    // Validate unique coupon code
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Additional validation for percentage discounts
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Validate negative values
    if (discountValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value cannot be negative'
      });
    }

    // Parse dates and ensure they are in UTC
    const parsedStartDate = new Date(startDate);
    const parsedExpiryDate = new Date(expiryDate);

    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedExpiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Ensure expiry date is after start date
    if (parsedExpiryDate <= parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after start date'
      });
    }

    // Create new coupon with parsed dates
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscountAmount: maxDiscountAmount || 0,
      usageLimit: usageLimit || 0,
      perUserLimit: perUserLimit || 0,
      minimumOrderAmount: minimumOrderAmount || 0,
      courses: courses || [],
      categories: categories || [],
      startDate: parsedStartDate,
      expiryDate: parsedExpiryDate,
      isActive: isActive !== undefined ? isActive : true,
      linkedTo: linkedTo || 'course',
      showOnFront: showOnFront || false,
      priority: priority || 0,
      isCombinable: isCombinable || false
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: newCoupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Validate and apply a coupon code (combined endpoint)
exports.validateAndApplyCoupon = async (req, res) => {
  try {
    const { code, courseId, totalAmount, checkoutType, applyImmediately = false } = req.body;
    const userId = req.user.id;

    console.log('Validating coupon:', {
      code: code.toUpperCase(),
      checkoutType,
      totalAmount,
      userId,
      applyImmediately
    });

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      linkedTo: checkoutType // Only find coupons linked to this checkout type
    });

    // Update analytics - increment validation attempts
    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.timesValidated': 1 }
      });
    }

    console.log('Found coupon:', coupon ? {
      code: coupon.code,
      linkedTo: coupon.linkedTo,
      isActive: coupon.isActive,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    } : 'No coupon found');

    if (!coupon) {
      // Update failed attempts analytics for any coupon with this code
      await Coupon.updateOne(
        { code: code.toUpperCase() },
        { $inc: { 'analytics.failedAttempts': 1 } }
      );
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code or not applicable for this checkout type'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.failedAttempts': 1 }
      });
      return res.status(400).json({
        success: false,
        message: 'Coupon is not active'
      });
    }

    // Check expiry - use more precise date comparison
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expiryDate);
    
    if (now < startDate) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.failedAttempts': 1 }
      });
      return res.status(400).json({
        success: false,
        message: 'Coupon is not yet active'
      });
    }
    
    if (now > expiryDate) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.failedAttempts': 1 }
      });
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.failedAttempts': 1 }
      });
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    // Check per-user limit
    const userUsage = coupon.userUsage.find(u => u.user.toString() === userId);
    if (coupon.perUserLimit > 0 && userUsage && userUsage.usedCount >= coupon.perUserLimit) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.failedAttempts': 1 }
      });
      return res.status(400).json({
        success: false,
        message: 'You have exceeded the usage limit for this coupon'
      });
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount > 0 && totalAmount < coupon.minimumOrderAmount) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 'analytics.failedAttempts': 1 }
      });
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      // Apply maximum discount limit if set
      if (coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, totalAmount);

    // If applyImmediately is true, update usage counts
    if (applyImmediately) {
      // Update usage counts
      coupon.usedCount += 1;
      coupon.lastUsed = new Date();

      // Update user usage
      const userUsageIndex = coupon.userUsage.findIndex(u => u.user.toString() === userId);
      if (userUsageIndex >= 0) {
        coupon.userUsage[userUsageIndex].usedCount += 1;
      } else {
        coupon.userUsage.push({ user: userId, usedCount: 1 });
      }

      // Update analytics
      coupon.analytics.successfulUses += 1;

      await coupon.save();
    }

    return res.status(200).json({
      success: true,
      message: applyImmediately ? 'Coupon applied successfully' : 'Coupon is valid',
      data: {
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        finalAmount: totalAmount - discountAmount,
        applied: applyImmediately
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Legacy validate endpoint (for backward compatibility)
exports.validateCoupon = async (req, res) => {
  // Call the new combined endpoint without applying
  req.body.applyImmediately = false;
  return exports.validateAndApplyCoupon(req, res);
};

// Legacy apply endpoint (for backward compatibility)
exports.applyCoupon = async (req, res) => {
  // Call the new combined endpoint with applyImmediately set to true
  req.body.applyImmediately = true;
  return exports.validateAndApplyCoupon(req, res);
};

// Get all coupons with analytics (admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Add conversion rate and other analytics
    const couponsWithAnalytics = coupons.map(coupon => {
      const validationAttempts = coupon.analytics?.timesValidated || 0;
      const successfulUses = coupon.analytics?.successfulUses || 0;
      const conversionRate = validationAttempts > 0 
        ? ((successfulUses / validationAttempts) * 100).toFixed(2) 
        : 0;

      return {
        ...coupon,
        analytics: {
          ...coupon.analytics,
          conversionRate: `${conversionRate}%`,
          totalDiscountAmount: coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% (max: ₹${coupon.maxDiscountAmount || 'unlimited'})`
            : `₹${coupon.discountValue}`,
          status: new Date() > new Date(coupon.expiryDate) ? 'Expired' : 'Active'
        }
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Coupons fetched successfully',
      data: couponsWithAnalytics
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get analytics for a specific coupon (admin only)
exports.getCouponAnalytics = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId).lean();
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    const validationAttempts = coupon.analytics?.timesValidated || 0;
    const successfulUses = coupon.analytics?.successfulUses || 0;
    const failedAttempts = coupon.analytics?.failedAttempts || 0;
    const timesViewed = coupon.analytics?.timesViewed || 0;

    const analytics = {
      code: coupon.code,
      totalViews: timesViewed,
      validationAttempts,
      successfulUses,
      failedAttempts,
      conversionRate: validationAttempts > 0 
        ? ((successfulUses / validationAttempts) * 100).toFixed(2) 
        : 0,
      clickThroughRate: timesViewed > 0 
        ? ((validationAttempts / timesViewed) * 100).toFixed(2) 
        : 0,
      status: new Date() > new Date(coupon.expiryDate) ? 'Expired' : 'Active',
      totalDiscountAmount: coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% (max: ₹${coupon.maxDiscountAmount || 'unlimited'})`
        : `₹${coupon.discountValue}`,
      usageLimit: coupon.usageLimit > 0 
        ? `${coupon.usedCount}/${coupon.usageLimit}`
        : 'Unlimited',
      daysRemaining: Math.max(0, Math.ceil(
        (new Date(coupon.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      ))
    };

    return res.status(200).json({
      success: true,
      message: 'Coupon analytics fetched successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching coupon analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cleanup expired coupons (can be called via cron job)
exports.cleanupExpiredCoupons = async (req, res) => {
  try {
    const now = new Date();
    
    // Find expired coupons that are still active
    const expiredCoupons = await Coupon.find({
      expiryDate: { $lt: now },
      isActive: true
    });

    // Deactivate expired coupons
    if (expiredCoupons.length > 0) {
      await Coupon.updateMany(
        { _id: { $in: expiredCoupons.map(c => c._id) } },
        { 
          $set: { 
            isActive: false,
            showOnFront: false 
          }
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Deactivated ${expiredCoupons.length} expired coupons`,
      data: expiredCoupons.map(c => c.code)
    });
  } catch (error) {
    console.error('Error cleaning up expired coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get frontend coupons (public endpoint)
exports.getFrontendCoupons = async (req, res) => {
  try {
    const { linkedTo } = req.query;
    const now = new Date();
    
    // Build filter object
    const filter = {
      showOnFront: true,
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gt: now } // Use $gt instead of $gte to ensure coupon hasn't expired
    };

    // Add linkedTo filter if provided
    if (linkedTo) {
      // Ensure linkedTo matches exactly one of the allowed values
      if (!['course', 'bundle'].includes(linkedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid linkedTo value. Must be either "course" or "bundle".'
        });
      }
      filter.linkedTo = linkedTo;
    }
    
    // Filter coupons that should be shown on frontend
    // Sort by priority (descending) then by creation date (newest first)
    const coupons = await Coupon.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .select('-userUsage -analytics'); // Exclude sensitive data

    // Update analytics - increment times viewed for all returned coupons
    if (coupons.length > 0) {
      const couponIds = coupons.map(coupon => coupon._id);
      await Coupon.updateMany(
        { _id: { $in: couponIds } },
        { $inc: { 'analytics.timesViewed': 1 } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Frontend coupons fetched successfully',
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching frontend coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle coupon status (active/inactive)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Toggle the isActive status
    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
