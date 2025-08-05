import React, { useState, useEffect } from 'react'
import HighlightText from '../HomePage/HighlightText'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '../../common/motionFrameVarients'
import { getPublishedFaqs, submitQuestion } from '../../../services/operations/faqAPI'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa'

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null)
  const [faqData, setFaqData] = useState([])
  const [filteredFaqs, setFilteredFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ question: '' })
  const [submitting, setSubmitting] = useState(false)

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  // Fallback FAQ data in case API fails
  const fallbackFaqData = [
    {
      question: "How does Beeja ensure the quality of its courses?",
      answer: "At Beeja, course quality is our priority. We collaborate with industry experts to design and update our curriculum, ensuring it aligns with the latest trends and standards. Our rigorous review process includes user feedback and continuous assessments. Rest assured, our commitment to providing high-quality, relevant content ensures an enriching learning experience for our users, preparing them for success in their chosen fields."
    },
    {
      question: "How does Beeja stand out from other online learning platforms?",
      answer: "Beeja distinguishes itself through a combination of diverse, expert-curated content and an interactive learning environment. Our courses are crafted by industry professionals, ensuring real-world relevance. We prioritize user engagement with interactive elements, fostering a dynamic and effective learning experience. Additionally, personalized learning paths cater to individual needs."
    },
    {
      question: "What types of learning formats does Beeja offer?",
      answer: "Beeja offers a diverse range of learning formats including video lectures, interactive assignments, live sessions, hands-on projects, and peer collaboration opportunities. Our platform supports both self-paced learning and structured courses, complemented by practical exercises and real-world case studies to ensure comprehensive skill development."
    },
    {
      question: "How does Beeja ensure the accessibility of its courses for learners with different schedules?",
      answer: "We understand the importance of flexibility in learning. Our platform offers 24/7 access to course materials, allowing learners to study at their own pace. Content is available on multiple devices, and courses are structured in digestible modules. We also provide downloadable resources and mobile-friendly content for learning on-the-go."
    },
    {
      question: "Can I get a refund if I'm unsatisfied with a course on Beeja?",
      answer: "Yes, we offer a satisfaction guarantee. If you're unsatisfied with your course, you can request a refund within the first 7 days of purchase. Our support team will guide you through the refund process and gather feedback to help us improve our offerings. Terms and conditions apply to specific courses and circumstances."
    }
  ]

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const publishedFaqs = await getPublishedFaqs()
        
        if (publishedFaqs && Array.isArray(publishedFaqs) && publishedFaqs.length > 0) {
          setFaqData(publishedFaqs)
          setFilteredFaqs(publishedFaqs)
        } else {
          // Use fallback data if no published FAQs are available
          console.log('No published FAQs found, using fallback data')
          setFaqData(fallbackFaqData)
          setFilteredFaqs(fallbackFaqData)
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        // Use fallback data on error
        setFaqData(fallbackFaqData)
        setFilteredFaqs(fallbackFaqData)
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = faqData.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFaqs(filtered)
    } else {
      setFilteredFaqs(faqData)
    }
  }, [searchTerm, faqData])

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Please login to submit a question')
      return
    }

    if (!formData.question.trim()) {
      toast.error('Please enter your question')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitQuestion(formData.question, token)
      if (result) {
        setFormData({ question: '' })
        setShowModal(false)
        
      }
    } catch (error) {
      console.error('Error submitting question:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
<section className="mx-auto w-11/12 max-w-maxContent py-16 text-white relative">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-grid-white/5 opacity-10"></div>
      
      <motion.div
        variants={fadeIn('up', 0.1)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.1 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-[100px] -z-10"></div>
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-richblack-300 bg-clip-text text-transparent">
          Frequently Asked <HighlightText text="Questions" />
        </h2>
        <p className="text-richblack-300 mt-4 text-lg max-w-2xl mx-auto">
          Find answers to common questions about our platform and courses
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        variants={fadeIn('up', 0.2)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.1 }}
        className="max-w-[600px] mx-auto mb-12"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-richblack-800 border border-richblack-600 rounded-xl text-white placeholder-richblack-400 focus:outline-none focus:border-blue-500 transition-all duration-300"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-richblack-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 space-y-6 max-w-[800px] mx-auto relative">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="glass-bg border border-richblack-600 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-richblack-600 rounded mb-4"></div>
                  <div className="h-4 bg-richblack-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center text-richblack-300 py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl">No FAQs found matching your search.</p>
            <p className="text-sm mt-2">Try different keywords or browse all questions.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeIn('up', 0.1 * (index + 1))}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
              className={`glass-bg border-[0.5px] border-richblack-600 rounded-xl overflow-hidden transition-all duration-300 hover:border-richblack-400 ${activeIndex === index ? 'shadow-lg shadow-purple-500/10' : ''}`}
            >
              <button
                className="w-full px-8 py-5 text-left transition-all duration-300 flex justify-between items-center gap-4"
                onClick={() => toggleAccordion(index)}
              >
                <span className={`text-lg font-medium transition-all duration-300 ${activeIndex === index ? 'text-blue-100' : 'text-richblack-5'}`}>
                  {faq.question}
                </span>
                <span 
                  className={`transform transition-all duration-300 text-xl min-w-[24px]
                    ${activeIndex === index ? 'text-blue-100 rotate-180' : 'text-richblack-5'}`}
                >
                  ▼
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden
                  ${activeIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="px-8 pb-6 text-richblack-300 text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Ask a Question Section */}
      <motion.div
        variants={fadeIn('up', 0.3)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.1 }}
        className="text-center mt-16"
      >
        <div className="glass-bg border border-richblack-600 rounded-xl p-8 max-w-[600px] mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Still have questions?
          </h3>
          <p className="text-richblack-300 mb-6">
            Can't find the answer you're looking for? We're here to help!
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Ask a Question
          </button>
        </div>
      </motion.div>

      {/* Ask Question Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-richblack-800 rounded-lg p-6 w-full max-w-md mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Ask a Question</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-richblack-300 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {user && (
                  <div className="text-sm text-richblack-300">
                    <p>Submitting as: <span className="text-white">{user.firstName} {user.lastName}</span></p>
                    <p>Email: <span className="text-white">{user.email}</span></p>
                  </div>
                )}

                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-richblack-200 mb-2">
                    Your Question *
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Type your question here..."
                    rows={4}
                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-richblack-700 text-richblack-200 rounded-md hover:bg-richblack-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.question.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Question'}
                  </button>
                </div>
              </form>

              {!token && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <p className="text-yellow-400 text-sm">
                    Please <a href="/login" className="underline hover:text-yellow-300">login</a> to submit a question.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default FAQSection
