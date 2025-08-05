import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaRocket, FaGraduationCap, FaHeart, FaMapMarkerAlt, FaClock, FaEnvelope, FaArrowRight } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Careers = () => {
  const benefits = [
    {
      icon: <FaRocket className="text-2xl text-yellow-50" />,
      title: "Mission-Driven Work",
      description: "Be part of transforming education and empowering learners worldwide"
    },
    {
      icon: <FaUsers className="text-2xl text-blue-400" />,
      title: "Diverse Team",
      description: "Collaborate with talented professionals from diverse backgrounds"
    },
    {
      icon: <FaGraduationCap className="text-2xl text-green-400" />,
      title: "Continuous Learning",
      description: "Professional development opportunities and skill enhancement"
    },
    {
      icon: <FaHeart className="text-2xl text-pink-400" />,
      title: "Work-Life Balance",
      description: "Flexible work arrangements and remote-friendly culture"
    }
  ];

  const openPositions = [
    {
      title: "Software Engineer",
      department: "Engineering",
      type: "Full-time",
      location: "Remote",
      description: "Build scalable web applications and contribute to our learning platform architecture using modern technologies like React, Node.js, and cloud services.",
      requirements: ["3+ years experience", "React/Node.js", "Cloud platforms", "Agile methodology"]
    },
    {
      title: "Product Manager",
      department: "Product",
      type: "Full-time",
      location: "Hybrid",
      description: "Drive product strategy and work with cross-functional teams to deliver exceptional user experiences that impact millions of learners.",
      requirements: ["5+ years PM experience", "EdTech background", "Data-driven mindset", "User research skills"]
    },
    {
      title: "Content Creator",
      department: "Content",
      type: "Full-time",
      location: "Remote",
      description: "Create engaging educational content and collaborate with subject matter experts to develop world-class learning experiences.",
      requirements: ["Content creation experience", "Educational background", "Video production", "Creative writing"]
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      type: "Full-time",
      location: "Remote",
      description: "Design intuitive and beautiful user interfaces that make learning accessible and enjoyable for students worldwide.",
      requirements: ["4+ years design experience", "Figma/Sketch", "User research", "Design systems"]
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
        className="relative bg-gradient-to-br from-blue-900 via-richblack-900 to-purple-900 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-11/12 max-w-maxContent mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join Our <span className="text-yellow-50">Mission</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform education and empower learners worldwide. Join our passionate team of innovators, educators, and technologists.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button className="bg-yellow-50 text-richblack-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              View Open Positions
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-maxContent mx-auto py-16 text-richblack-5">
        {/* Why Work With Us Section */}
        <motion.section 
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Why Choose <span className="text-yellow-50">Beeja?</span>
          </motion.h2>
          <motion.p 
            className="text-richblack-300 text-center mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            We're not just building a company; we're creating the future of education. Here's what makes Beeja special.
          </motion.p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-richblack-800 p-6 rounded-xl text-center hover:bg-richblack-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-richblack-50">{benefit.title}</h3>
                <p className="text-richblack-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Open Positions Section */}
        <motion.section 
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Open <span className="text-yellow-50">Positions</span>
          </motion.h2>
          <motion.p 
            className="text-richblack-300 text-center mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Ready to make an impact? Explore our current openings and find your perfect role.
          </motion.p>
          
          <div className="grid gap-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={index}
                className="bg-richblack-800 p-8 rounded-xl border border-richblack-700 hover:border-yellow-50/30 transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-richblack-50 mb-2 group-hover:text-yellow-50 transition-colors">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-richblack-300">
                      <span className="flex items-center gap-1">
                        <FaUsers /> {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock /> {position.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> {position.location}
                      </span>
                    </div>
                  </div>
                  <button className="mt-4 lg:mt-0 bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 flex items-center gap-2 group-hover:scale-105">
                    Apply Now <FaArrowRight />
                  </button>
                </div>
                
                <p className="text-richblack-100 mb-6 leading-relaxed">
                  {position.description}
                </p>
                
                <div>
                  <h4 className="text-richblack-50 font-semibold mb-3">Key Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {position.requirements.map((req, reqIndex) => (
                      <span 
                        key={reqIndex}
                        className="bg-richblack-700 text-richblack-200 px-3 py-1 rounded-full text-sm border border-richblack-600"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Application Process Section */}
        <motion.section 
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-center mb-12"
            variants={itemVariants}
          >
            How to <span className="text-yellow-50">Apply</span>
          </motion.h2>
          
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div variants={itemVariants}>
                <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-richblack-900 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-richblack-50">Submit Application</h3>
                <p className="text-richblack-300">Send your resume and cover letter to our careers email</p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="bg-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-richblack-50">Initial Review</h3>
                <p className="text-richblack-300">Our team reviews your application within 2 weeks</p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="bg-green-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-richblack-50">Interview Process</h3>
                <p className="text-richblack-300">Multiple rounds including technical and cultural fit assessments</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="text-center mt-12"
              variants={itemVariants}
            >
              <p className="text-richblack-100 mb-6 text-lg">
                Ready to join our team? We'd love to hear from you!
              </p>
              <a 
                href="mailto:careers@beejaacademy.com"
                className="inline-flex items-center gap-3 bg-yellow-50 text-richblack-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaEnvelope />
                careers@beejaacademy.com
              </a>
            </motion.div>
          </div>
        </motion.section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Careers;
