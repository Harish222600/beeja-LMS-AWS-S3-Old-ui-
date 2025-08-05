import React from 'react'
// Using an abstract tech/code themed image
const Instructor = "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
import HighlightText from './HighlightText'
import CTAButton from "../HomePage/Button"
import { FaArrowRight } from 'react-icons/fa'
import Img from './../../common/Img';


import { motion } from 'framer-motion'
import { scaleUp } from './../../common/motionFrameVarients';


const InstructorSection = () => {
  return (
    <div>
      <div className='flex flex-col-reverse lg:flex-row gap-10 lg:gap-20 items-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 lg:p-12'>

        {/* Left side - Image */}
        <motion.div
          variants={scaleUp}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='lg:w-[45%] relative'
        >
          <div className="relative z-10">
            <Img
              src={Instructor}
              alt="Abstract technology and code visualization"
              className='rounded-2xl shadow-2xl shadow-purple-500/20 border-2 border-purple-500/20 w-full h-[400px] object-cover'
            />
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-yellow-400/30 rounded-tl-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-purple-500/30 rounded-br-2xl"></div>
          </div>
        </motion.div>

        {/* Right side - Content */}
        <motion.div 
          className='lg:w-[55%] flex flex-col relative z-10'
          variants={scaleUp}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
        >
          <h2 className='text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 text-transparent bg-clip-text'>
            Become an Instructor
          </h2>

          <p className='text-lg text-gray-300 leading-relaxed mb-8'>
            Join our community of expert instructors and share your knowledge with millions of eager learners worldwide. Our platform provides you with:
          </p>
            
          <ul className='space-y-6 mb-10'>
            <li className='flex items-center gap-4 text-gray-300'>
              <span className='flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20'>
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="text-lg">Powerful teaching tools and analytics</span>
            </li>
            <li className='flex items-center gap-4 text-gray-300'>
              <span className='flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20'>
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </span>
              <span className="text-lg">Global reach to millions of students</span>
            </li>
            <li className='flex items-center gap-4 text-gray-300'>
              <span className='flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20'>
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-lg">Flexible course creation and pricing</span>
            </li>
          </ul>

          <div className='w-fit'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-xl font-semibold text-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
              onClick={() => window.location.href = '/signup'}
            >
              Start Teaching Today →
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default InstructorSection
