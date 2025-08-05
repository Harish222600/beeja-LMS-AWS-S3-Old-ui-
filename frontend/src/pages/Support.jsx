import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHeadset, FaEnvelope, FaPhone, FaClock, FaQuestionCircle, FaSearch, FaChevronDown, FaChevronUp, FaComments, FaBook, FaVideo, FaTicketAlt } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Support = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const supportCategories = [
    { id: "all", name: "All Topics", icon: <FaQuestionCircle /> },
    { id: "account", name: "Account", icon: <FaHeadset /> },
    { id: "courses", name: "Courses", icon: <FaBook /> },
    { id: "technical", name: "Technical", icon: <FaVideo /> },
    { id: "billing", name: "Billing", icon: <FaTicketAlt /> }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. Enter your email address and we'll send you a reset link.",
      category: "account"
    },
    {
      id: 2,
      question: "Can I download course videos for offline viewing?",
      answer: "Yes, our mobile app allows you to download course videos for offline viewing. This feature is available for premium subscribers.",
      category: "courses"
    },
    {
      id: 3,
      question: "How do I get a refund for a course?",
      answer: "We offer a 30-day money-back guarantee. To request a refund, contact our support team with your order details within 30 days of purchase.",
      category: "billing"
    },
    {
      id: 4,
      question: "Why can't I access my enrolled course?",
      answer: "This could be due to payment issues, account verification, or technical problems. Check your account status and contact support if the issue persists.",
      category: "technical"
    },
    {
      id: 5,
      question: "How do I update my profile information?",
      answer: "Go to your Dashboard, click on 'My Profile', and you can edit your personal information, profile picture, and preferences.",
      category: "account"
    },
    {
      id: 6,
      question: "Do I get a certificate after completing a course?",
      answer: "Yes, you'll receive a verified certificate of completion for each course you finish. Certificates can be downloaded from your dashboard.",
      category: "courses"
    },
    {
      id: 7,
      question: "Can I change my subscription plan?",
      answer: "Yes, you can upgrade or downgrade your subscription plan at any time from your account settings. Changes take effect at the next billing cycle.",
      category: "billing"
    },
    {
      id: 8,
      question: "The video player is not working properly",
      answer: "Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection.",
      category: "technical"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const contactMethods = [
    {
      icon: <FaEnvelope className="text-3xl text-blue-400" />,
      title: "Email Support",
      description: "Get detailed help via email",
      contact: "support@beejaacademy.com",
      responseTime: "Within 24 hours",
      action: "Send Email"
    },
    {
      icon: <FaPhone className="text-3xl text-green-400" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+91 9150274222",
      responseTime: "Mon-Fri, 9 AM - 6 PM IST",
      action: "Call Now"
    },
    {
      icon: <FaComments className="text-3xl text-purple-400" />,
      title: "Live Chat",
      description: "Instant help through chat",
      contact: "Available on website",
      responseTime: "Real-time response",
      action: "Start Chat"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-green-900 via-richblack-900 to-teal-900 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-11/12 max-w-maxContent mx-auto text-center">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center">
              <FaHeadset className="text-3xl text-white" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We're Here to <span className="text-yellow-50">Help</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Get the support you need to succeed in your learning journey. Our team is ready to assist you 24/7.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-6xl mx-auto py-16 text-richblack-5">
        {/* Contact Methods */}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            variants={itemVariants}
          >
            Get in <span className="text-yellow-50">Touch</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                className="bg-richblack-800 p-6 rounded-xl border border-richblack-700 text-center hover:border-yellow-50/30 transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="mb-4 flex justify-center">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-richblack-50 group-hover:text-yellow-50 transition-colors">
                  {method.title}
                </h3>
                <p className="text-richblack-300 mb-4">{method.description}</p>
                <div className="space-y-2 mb-6">
                  <p className="text-richblack-200 font-semibold">{method.contact}</p>
                  <p className="text-richblack-400 text-sm">{method.responseTime}</p>
                </div>
                <button className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 group-hover:scale-105">
                  {method.action}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            variants={itemVariants}
          >
            Frequently Asked <span className="text-yellow-50">Questions</span>
          </motion.h2>

          {/* Search and Filter */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                    <input
                      type="text"
                      placeholder="Search frequently asked questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {supportCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeCategory === category.id
                          ? 'bg-yellow-50 text-richblack-900'
                          : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
                      }`}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ List */}
          <motion.div 
            className="space-y-4"
            variants={itemVariants}
          >
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-richblack-800 rounded-xl border border-richblack-700 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-richblack-700 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-richblack-50 pr-4">
                      {faq.question}
                    </h3>
                    <div className="text-richblack-400 flex-shrink-0">
                      {expandedFaq === faq.id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedFaq === faq.id ? "auto" : 0,
                      opacity: expandedFaq === faq.id ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 border-t border-richblack-700">
                      <p className="text-richblack-200 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                  <FaSearch className="text-4xl text-richblack-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-richblack-300 mb-2">No FAQs found</h3>
                  <p className="text-richblack-400">Try adjusting your search terms or category filter.</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Additional Support Resources */}
        <motion.section 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600">
            <h2 className="text-3xl font-bold text-center mb-8">
              Additional <span className="text-yellow-50">Resources</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBook className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Help Center</h3>
                <p className="text-richblack-300 text-sm">Comprehensive guides and tutorials</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaVideo className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                <p className="text-richblack-300 text-sm">Step-by-step video guides</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaComments className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Forum</h3>
                <p className="text-richblack-300 text-sm">Connect with other learners</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaClock className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-richblack-300 text-sm">Round-the-clock assistance</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact Form CTA */}
        <motion.section 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600 text-center">
            <div className="flex justify-center mb-4">
              <FaTicketAlt className="text-3xl text-yellow-50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-richblack-300 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help. 
              Submit a support ticket and we'll get back to you as soon as possible.
            </p>
            <button className="bg-yellow-50 text-richblack-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105">
              Submit Support Ticket
            </button>
          </div>
        </motion.section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Support;
