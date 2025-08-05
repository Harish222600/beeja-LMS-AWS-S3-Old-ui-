import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { FaGift } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const CouponSuccessModal = ({ isOpen, onClose, discountAmount }) => {
  // Function to trigger confetti
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1500
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerConfetti();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-richblack-900 border border-richblack-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button with improved positioning and styling */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 text-richblack-300 hover:text-yellow-50 transition-colors p-2 hover:bg-richblack-700 rounded-full z-50"
            >
              <FiX size={24} />
            </button>

            {/* Party poppers animation */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-6 left-6 text-4xl"
              >
                <FaGift className="text-yellow-400 transform rotate-[-45deg] drop-shadow-lg" />
              </motion.div>

            </div>

            {/* Animated confetti */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ 
                    y: [null, Math.random() * 400],
                    x: [null, (Math.random() - 0.5) * 200],
                    rotate: [0, Math.random() * 360],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                  className={`absolute w-2 h-2 rounded-full ${
                    ['bg-yellow-400', 'bg-yellow-50', 'bg-caribbeangreen-200'][i % 3]
                  }`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10px'
                  }}
                />
              ))}
            </div>

            {/* Discount badge */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="relative mb-6"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-richblack-900 font-bold">₹{discountAmount}</span>
                </div>
              </div>
            </motion.div>

            {/* Success message with animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-yellow-50 mb-2">
                Awesome! Coupon Applied
              </h2>
              
              <div className="mb-4">
                <p className="text-xl text-richblack-5 mb-1">
                  You saved ₹{discountAmount} on this course!
                </p>
                <p className="text-sm text-richblack-300">
                  The discount has been applied to your order
                </p>
              </div>

              {/* Success checkmark animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", damping: 15 }}
                className="w-16 h-16 mx-auto bg-caribbeangreen-200 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-richblack-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CouponSuccessModal;
