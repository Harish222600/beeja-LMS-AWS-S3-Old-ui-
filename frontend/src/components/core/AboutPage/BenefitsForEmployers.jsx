import React from 'react'
import { motion } from 'framer-motion'

const BenefitsForEmployers = () => {
  const benefits = [
    {
      id: "01",
      title: "Get Skilled RESOURCE",
      description: "Access to highly trained and qualified professionals",
      icon: "👥"
    },
    {
      id: "02", 
      title: "Zero Investment on Training",
      description: "Save costs with pre-trained talent pool",
      icon: "💰"
    },
    {
      id: "03",
      title: "Zero Investment on Recruitment",
      description: "Streamlined hiring process at no additional cost",
      icon: "📋"
    },
    {
      id: "04",
      title: "Get highly Productive & Efficient Team",
      description: "Work with motivated and skilled professionals",
      icon: "🎯"
    }
  ]

  return (
    <div className='relative w-11/12 max-w-maxContent mx-auto py-20'>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-richblack-900 to-richblack-900 opacity-90"></div>
      
      {/* Content Container */}
      <div className='relative z-10'>
        {/* Section Title */}
        <div className='text-center mb-16'>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl font-bold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent mb-4'
          >
            Benefits for Employers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-richblack-300 text-lg max-w-2xl mx-auto'
          >
            Partner with us to access top talent and transform your workforce
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative'>
          {/* Connecting Lines - Visible on larger screens */}
          <div className='hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] transform -translate-y-1/2 opacity-20'></div>

          {/* Benefits Cards */}
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className='relative'
            >
              {/* Card Container */}
              <div className='bg-richblack-800 rounded-2xl p-6 h-full border border-richblack-700 hover:border-[#833AB4] transition-all duration-300'>
                {/* Number Badge */}
                <div className='absolute -top-4 left-6 bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg'>
                  {benefit.id}
                </div>

                {/* Icon */}
                <div className='text-4xl mb-4 mt-2'>{benefit.icon}</div>

                {/* Content */}
                <h3 className='text-xl font-semibold text-white mb-2'>
                  {benefit.title}
                </h3>
                <p className='text-richblack-300 text-sm'>
                  {benefit.description}
                </p>
              </div>

              {/* Connecting Line for larger screens */}
              {index < benefits.length - 1 && (
                <div className='hidden lg:block absolute top-1/2 right-[-2rem] w-16 border-t border-dashed border-richblack-500 transform -translate-y-1/2'></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BenefitsForEmployers
