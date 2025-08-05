import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaGavel, FaUserShield, FaExclamationTriangle, FaLock, FaFileContract, FaBalanceScale, FaChevronDown, FaChevronUp, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Terms = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <FaFileContract className="text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            By accessing and using Beeja Academy's platform, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-100 mb-2">Important Notice</h4>
            <p className="text-blue-200 text-sm">
              If you do not agree to these terms, please do not use our platform. 
              Your continued use constitutes acceptance of any updates to these terms.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "platform-usage",
      title: "Platform Usage",
      icon: <FaUserShield className="text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            Our platform is designed for educational purposes. You agree to use it responsibly and in accordance with these guidelines:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Permitted Uses</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Personal learning and skill development</li>
                <li>Professional development and training</li>
                <li>Educational research and study</li>
                <li>Creating portfolios with course projects</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-2">Prohibited Uses</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Sharing account credentials</li>
                <li>Downloading and redistributing content</li>
                <li>Commercial use without permission</li>
                <li>Reverse engineering or copying</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      icon: <FaLock className="text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            When you create an account with us, you are responsible for maintaining its security and accuracy.
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-purple-400 pl-4">
              <h4 className="font-semibold text-richblack-50">Account Security</h4>
              <p className="text-richblack-200 text-sm">
                You are responsible for maintaining the confidentiality of your login credentials 
                and for all activities that occur under your account.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-semibold text-richblack-50">Accurate Information</h4>
              <p className="text-richblack-200 text-sm">
                You agree to provide accurate, current, and complete information during registration 
                and to update such information as necessary.
              </p>
            </div>
            
            <div className="border-l-4 border-red-400 pl-4">
              <h4 className="font-semibold text-richblack-50">Account Termination</h4>
              <p className="text-richblack-200 text-sm">
                We reserve the right to suspend or terminate accounts that violate these terms 
                or engage in fraudulent activities.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "content-policy",
      title: "Content and Intellectual Property",
      icon: <FaBalanceScale className="text-orange-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            All content on our platform is protected by intellectual property laws. Here's what you need to know:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Our Content</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Videos, text, and course materials</li>
                <li>Beeja Academy trademarks and logos</li>
                <li>Platform design and functionality</li>
                <li>Assessment and quiz content</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Your Content</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Discussion forum posts</li>
                <li>Project submissions</li>
                <li>Profile information</li>
                <li>Feedback and reviews</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
            <p className="text-orange-100 text-sm">
              <strong>License:</strong> We grant you a limited, non-exclusive, non-transferable license 
              to access and use our content for personal educational purposes only.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "payments",
      title: "Payments and Refunds",
      icon: <FaGavel className="text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            Our payment and refund policies are designed to be fair and transparent:
          </p>
          
          <div className="space-y-3">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Payment Terms</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>All prices are in USD unless otherwise specified</li>
                <li>Payment is required before accessing premium content</li>
                <li>We accept major credit cards and digital payment methods</li>
                <li>Subscription fees are billed according to your chosen plan</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Refund Policy</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>30-day money-back guarantee for most courses</li>
                <li>Refunds processed within 5-10 business days</li>
                <li>No refunds for completed courses or certificates issued</li>
                <li>Subscription cancellations take effect at the end of billing period</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "security",
      title: "Platform Security",
      icon: <FaExclamationTriangle className="text-red-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            You agree not to engage in any activities that could compromise the security or integrity of our platform:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-2">Prohibited Activities</h4>
              <ul className="list-disc pl-6 space-y-1 text-red-200 text-sm">
                <li>Attempting to hack or breach security</li>
                <li>Using automated tools to access content</li>
                <li>Distributing malware or viruses</li>
                <li>Interfering with other users' experience</li>
              </ul>
            </div>
            
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Security Measures</h4>
              <ul className="list-disc pl-6 space-y-1 text-green-200 text-sm">
                <li>SSL encryption for all data transmission</li>
                <li>Regular security audits and updates</li>
                <li>Monitoring for suspicious activities</li>
                <li>Incident response procedures</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-yellow-100 text-sm">
              <strong>Reporting:</strong> If you discover any security vulnerabilities, 
              please report them to security@beejaacademy.com immediately.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: <FaBalanceScale className="text-indigo-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            While we strive to provide the best educational experience, there are certain limitations to our liability:
          </p>
          
          <div className="space-y-3">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Service Availability</h4>
              <p className="text-richblack-200 text-sm">
                We aim for 99.9% uptime but cannot guarantee uninterrupted service. 
                Maintenance windows and technical issues may occasionally affect availability.
              </p>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Educational Outcomes</h4>
              <p className="text-richblack-200 text-sm">
                While our courses are designed to provide valuable skills and knowledge, 
                we cannot guarantee specific career outcomes or job placement.
              </p>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Third-Party Content</h4>
              <p className="text-richblack-200 text-sm">
                We are not responsible for the accuracy or reliability of third-party 
                content, links, or services referenced in our courses.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "modifications",
      title: "Modifications to Terms",
      icon: <FaCalendarAlt className="text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            We may update these Terms of Service from time to time to reflect changes in our practices or legal requirements.
          </p>
          
          <div className="bg-richblack-700 p-4 rounded-lg">
            <h4 className="font-semibold text-richblack-50 mb-2">How We Notify You</h4>
            <ul className="list-disc pl-6 space-y-1 text-richblack-200">
              <li>Email notification to all registered users</li>
              <li>Prominent notice on our website homepage</li>
              <li>In-app notifications for significant changes</li>
              <li>30-day notice period for major changes</li>
            </ul>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-yellow-100 text-sm">
              <strong>Continued Use:</strong> Your continued use of the platform after changes 
              are posted constitutes acceptance of the updated terms.
            </p>
          </div>
          
          <p className="text-richblack-200">
            <strong>Last Updated:</strong> January 15, 2024
          </p>
        </div>
      )
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
        className="relative bg-gradient-to-br from-indigo-900 via-richblack-900 to-purple-900 py-20"
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
            <div className="bg-indigo-500 w-20 h-20 rounded-full flex items-center justify-center">
              <FaGavel className="text-3xl text-white" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Terms of <span className="text-yellow-50">Service</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Please read these terms carefully before using our platform. They govern your use of Beeja Academy's services.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-4xl mx-auto py-16 text-richblack-5">
        {/* Quick Summary */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-6 rounded-xl border border-richblack-600">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FaFileContract className="text-yellow-50" />
              Terms Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">Fair Use</div>
                <div className="text-sm text-richblack-300">Educational purposes only</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">Protected</div>
                <div className="text-sm text-richblack-300">Your rights are respected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">Transparent</div>
                <div className="text-sm text-richblack-300">Clear and understandable</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Terms Sections */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                className="bg-richblack-800 rounded-xl border border-richblack-700 overflow-hidden"
                variants={itemVariants}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-richblack-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-richblack-50">
                      {section.title}
                    </h3>
                  </div>
                  <div className="text-richblack-400">
                    {expandedSection === section.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedSection === section.id ? "auto" : 0,
                    opacity: expandedSection === section.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-richblack-700">
                    {section.content}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600 text-center">
            <div className="flex justify-center mb-4">
              <FaEnvelope className="text-3xl text-yellow-50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-richblack-300 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service or need clarification 
              on any provisions, our legal team is here to help.
            </p>
            <a 
              href="mailto:legal@beejaacademy.com"
              className="inline-flex items-center gap-2 bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105"
            >
              <FaEnvelope />
              legal@beejaacademy.com
            </a>
          </div>
        </motion.section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Terms;
