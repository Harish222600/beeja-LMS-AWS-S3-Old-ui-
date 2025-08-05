import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaLock, FaEye, FaUserShield, FaDatabase, FaCookie, FaEnvelope, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: "overview",
      title: "Privacy Overview",
      icon: <FaShieldAlt className="text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            At Beeja Academy, we understand the importance of safeguarding your personal information. 
            This Privacy Policy outlines our approach to data protection and privacy to fulfill our 
            obligations under applicable laws and regulations.
          </p>
          <p className="text-richblack-100">
            We are committed to treating data privacy seriously and want you to know exactly what we do 
            with your personal data. This policy applies to all personal data processed by us, whether 
            in physical or electronic mode.
          </p>
        </div>
      )
    },
    {
      id: "collection",
      title: "Information We Collect",
      icon: <FaDatabase className="text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">We collect information in several ways:</p>
          
          <div className="space-y-3">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Information You Provide</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200">
                <li>Account registration details (name, email, password)</li>
                <li>Profile information and preferences</li>
                <li>Course enrollment and progress data</li>
                <li>Communication with support team</li>
                <li>Newsletter subscriptions</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Automatically Collected Information</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage patterns and learning analytics</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "usage",
      title: "How We Use Your Information",
      icon: <FaEye className="text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">We use your information to:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Service Delivery</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Provide and maintain our platform</li>
                <li>Process course enrollments</li>
                <li>Track learning progress</li>
                <li>Issue certificates</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Communication</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Send course updates</li>
                <li>Respond to inquiries</li>
                <li>Marketing communications</li>
                <li>Security notifications</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Improvement</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Analyze usage patterns</li>
                <li>Personalize experience</li>
                <li>Develop new features</li>
                <li>Quality assurance</li>
              </ul>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Legal Compliance</h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Meet regulatory requirements</li>
                <li>Prevent fraud and abuse</li>
                <li>Enforce terms of service</li>
                <li>Protect user safety</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sharing",
      title: "Information Sharing",
      icon: <FaUserShield className="text-orange-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            We do not sell, trade, or rent your personal information to third parties. 
            We may share your information only in the following circumstances:
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-yellow-50 pl-4">
              <h4 className="font-semibold text-richblack-50">Service Providers</h4>
              <p className="text-richblack-200 text-sm">
                With trusted third-party service providers who assist in operating our platform, 
                subject to strict confidentiality agreements.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-semibold text-richblack-50">Legal Requirements</h4>
              <p className="text-richblack-200 text-sm">
                When required by law, court order, or government regulation, or to protect 
                our rights and the safety of our users.
              </p>
            </div>
            
            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-semibold text-richblack-50">Business Transfers</h4>
              <p className="text-richblack-200 text-sm">
                In connection with a merger, acquisition, or sale of assets, with appropriate 
                notice to affected users.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "security",
      title: "Data Security",
      icon: <FaLock className="text-red-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            We implement comprehensive security measures to protect your personal information:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-richblack-700 to-richblack-600 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2 flex items-center gap-2">
                <FaLock className="text-red-400" />
                Technical Safeguards
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted data storage</li>
                <li>Regular security audits</li>
                <li>Secure access controls</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-richblack-700 to-richblack-600 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2 flex items-center gap-2">
                <FaShieldAlt className="text-blue-400" />
                Administrative Safeguards
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-richblack-200 text-sm">
                <li>Employee training on data privacy</li>
                <li>Limited access on need-to-know basis</li>
                <li>Regular policy updates</li>
                <li>Incident response procedures</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-yellow-100 text-sm">
              <strong>Important:</strong> While we implement robust security measures, no method of 
              transmission over the Internet or electronic storage is 100% secure. We cannot guarantee 
              absolute security but are committed to protecting your data using industry best practices.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: <FaCookie className="text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            We use cookies and similar technologies to enhance your experience:
          </p>
          
          <div className="space-y-3">
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Essential Cookies</h4>
              <p className="text-richblack-200 text-sm">
                Required for basic platform functionality, including authentication and security features.
              </p>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Analytics Cookies</h4>
              <p className="text-richblack-200 text-sm">
                Help us understand how users interact with our platform to improve user experience.
              </p>
            </div>
            
            <div className="bg-richblack-700 p-4 rounded-lg">
              <h4 className="font-semibold text-richblack-50 mb-2">Preference Cookies</h4>
              <p className="text-richblack-200 text-sm">
                Remember your settings and preferences for a personalized experience.
              </p>
            </div>
          </div>
          
          <p className="text-richblack-200 text-sm">
            You can control cookie settings through your browser preferences, though disabling certain 
            cookies may affect platform functionality.
          </p>
        </div>
      )
    },
    {
      id: "rights",
      title: "Your Rights",
      icon: <FaUserShield className="text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            You have several rights regarding your personal data:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-richblack-50">Access</h4>
                  <p className="text-richblack-200 text-sm">Request a copy of your personal data</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-richblack-50">Correction</h4>
                  <p className="text-richblack-200 text-sm">Update or correct inaccurate information</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-richblack-50">Deletion</h4>
                  <p className="text-richblack-200 text-sm">Request deletion of your personal data</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-richblack-50">Portability</h4>
                  <p className="text-richblack-200 text-sm">Export your data in a portable format</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <div>
                  <h4 className="font-semibold text-richblack-50">Restriction</h4>
                  <p className="text-richblack-200 text-sm">Limit how we process your data</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">6</span>
                </div>
                <div>
                  <h4 className="font-semibold text-richblack-50">Objection</h4>
                  <p className="text-richblack-200 text-sm">Object to certain data processing</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
            <p className="text-blue-100 text-sm">
              To exercise any of these rights, please contact us at 
              <span className="font-semibold"> privacy@beejaacademy.com</span>. 
              We will respond to your request within 30 days.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "updates",
      title: "Policy Updates",
      icon: <FaCalendarAlt className="text-indigo-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-richblack-100">
            We may update this Privacy Policy from time to time to reflect changes in our practices, 
            technology, legal requirements, or other factors.
          </p>
          
          <div className="bg-richblack-700 p-4 rounded-lg">
            <h4 className="font-semibold text-richblack-50 mb-2">How We Notify You</h4>
            <ul className="list-disc pl-6 space-y-1 text-richblack-200">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our website</li>
              <li>In-app notifications for significant changes</li>
              <li>Updated effective date at the top of this policy</li>
            </ul>
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
        className="relative bg-gradient-to-br from-blue-900 via-richblack-900 to-indigo-900 py-20"
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
            <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-3xl text-white" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Privacy <span className="text-yellow-50">Policy</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
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
              <FaEye className="text-yellow-50" />
              Quick Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">Transparent</div>
                <div className="text-sm text-richblack-300">Clear about data collection</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">Secure</div>
                <div className="text-sm text-richblack-300">Industry-standard protection</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">Your Control</div>
                <div className="text-sm text-richblack-300">You own your data</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Privacy Sections */}
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
            <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-richblack-300 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our data practices, 
              we're here to help. Contact our privacy team directly.
            </p>
            <a 
              href="mailto:privacy@beejaacademy.com"
              className="inline-flex items-center gap-2 bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105"
            >
              <FaEnvelope />
              privacy@beejaacademy.com
            </a>
          </div>
        </motion.section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default PrivacyPolicy;
