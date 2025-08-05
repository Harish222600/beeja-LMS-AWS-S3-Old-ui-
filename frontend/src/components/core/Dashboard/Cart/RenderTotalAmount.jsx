import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

import IconBtn from "../../../common/IconBtn"
import CouponInput from "./CouponInput"
import { FiCreditCard, FiShield, FiZap, FiGift } from "react-icons/fi"
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI"

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const finalAmount = total - discountAmount

  const handleCouponApply = (couponData) => {
    setAppliedCoupon(couponData)
    setDiscountAmount(couponData.discountAmount)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
  }

  const handleBuyCourse = async () => {
    // Check if total amount is not zero - prevent purchase and show message
    if (finalAmount !== 0 && finalAmount !== null) {
      toast.error("You have to pay first")
      return
    }
    
    const courses = cart.map((course) => course._id)
    await buyCourse(token, courses, user, navigate, dispatch)
  }

  const savings = Math.round(total * 0.3)
  const originalPrice = total + savings

  return (
    <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <div className="mb-4">
        <p className="mb-1 text-sm font-medium text-richblack-300">Subtotal:</p>
        <p className="text-2xl font-medium text-richblack-100">₹ {total}</p>
      </div>

      {appliedCoupon && (
        <div className="mb-4 p-3 bg-green-900 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-green-200">Coupon Applied</p>
              <p className="text-sm font-medium text-green-100">
                {appliedCoupon.discountType === 'percentage' 
                  ? `${appliedCoupon.discountValue}% OFF` 
                  : `₹${appliedCoupon.discountValue} OFF`}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Remove
            </button>
          </div>
          <p className="text-sm text-green-200 mt-1">
            Discount: -₹{discountAmount}
          </p>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-1 text-sm font-medium text-richblack-300">Total:</p>
        <p className="mb-6 text-3xl font-medium text-yellow-100">₹ {finalAmount}</p>
      </div>

      {!appliedCoupon && (
        <div className="mb-4">
          <CouponInput totalAmount={total} onCouponApply={handleCouponApply} />
        </div>
      )}

      <IconBtn
        text="Buy Now"
        onClick={handleBuyCourse}
        customClasses="w-full justify-center"
      />
    </div>
  )
}
