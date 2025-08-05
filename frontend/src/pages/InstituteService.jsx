import React from "react";
import { motion } from "framer-motion";
import { fadeIn, bounce, scaleUp } from "../components/common/motionFrameVarients";
import HighlightText from "../components/core/HomePage/HighlightText";
import ImprovedFooter from "../components/common/ImprovedFooter";
import { Link } from "react-router-dom";
import { FaUsers, FaRocket, FaCertificate, FaHandshake, FaChartLine, FaClock } from "react-icons/fa";
import BenefitsForEmployers from "../components/core/AboutPage/BenefitsForEmployers";

const InstituteService = () => {
  const services = [
    {
      icon: <FaUsers className="text-3xl text-yellow-50" />,
      title: "Talent Acquisition",
      description: "Access to pre-trained, industry-ready professionals who can contribute from day one."
    },
    {
      icon: <FaRocket className="text-3xl text-yellow-50" />,
      title: "Custom Training Programs",
      description: "Tailored training solutions designed specifically for your organization's needs."
    },
    {
      icon: <FaCertificate className="text-3xl text-yellow-50" />,
      title: "Certified Professionals",
      description: "All our candidates are certified and equipped with the latest industry skills."
    },
    {
      icon: <FaHandshake className="text-3xl text-yellow-50" />,
      title: "Partnership Support",
      description: "Ongoing support and collaboration to ensure successful integration."
    }
  ];

  const benefits = [
    {
      icon: <FaChartLine className="text-2xl text-caribbeangreen-300" />,
      title: "Accelerated Growth",
      description: "Speed up your organization's growth with skilled professionals"
    },
    {
      icon: <FaClock className="text-2xl text-caribbeangreen-300" />,
      title: "Time & Cost Efficient",
      description: "Save time and money on training with our pre-trained candidates"
    }
  ];

  return (
    <div className="bg-richblack-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white py-20">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <motion.div 
            variants={fadeIn('right', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="lg:w-[50%]"
          >
            <h1 className="text-4xl lg:text-5xl font-semibold mb-6">
              Beeja Academy for <HighlightText text="Employers" />
            </h1>
            <p className="text-richblack-300 text-lg mb-8 leading-relaxed">
              By partnering with Beeja Academy, employers get well-trained and highly skilled human resources who are well acquainted with the industry demands and can easily adapt to the work culture. Beeja Academy is a bridge between job seekers and employers which gives everyone an equal opportunity to grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <button className="bg-yellow-50 text-black px-6 py-3 rounded-lg font-semibold hover:scale-95 transition-all duration-200 hover:shadow-lg">
                  Partner With Us
                </button>
              </Link>
              <Link to="/about">
                <button className="border border-yellow-50 text-yellow-50 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 hover:text-black transition-all duration-200">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            variants={fadeIn('left', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="lg:w-[50%] relative"
          >
            <div className="bg-gradient-to-tr from-[#B55DFE] to-[#216AFD] absolute top-4 left-4 w-full h-full blur-2xl opacity-20 rounded-xl"></div>
            <div className="bg-richblack-800 rounded-xl p-8 relative z-10 border border-richblack-700">
              <div className="flex items-center justify-center h-64 bg-gradient-to-br from-richblack-700 to-richblack-600 rounded-lg">
                <div className="text-center">
                  <FaUsers className="text-6xl text-yellow-50 mx-auto mb-4" />
                  <p className="text-richblack-200">Professional Team Collaboration</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto w-11/12 max-w-maxContent py-20">
        <motion.div 
          variants={fadeIn('up', 0.2)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
            Our <HighlightText text="Services" />
          </h2>
          <p className="text-richblack-300 text-lg">
            Comprehensive solutions for your talent acquisition needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={scaleUp}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
              className="bg-richblack-800 p-6 rounded-xl border border-richblack-700 hover:border-yellow-50 transition-all duration-300 hover:scale-105"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-3">{service.title}</h3>
              <p className="text-richblack-300 text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Job Requirements Section */}
      <section className="w-full bg-gradient-to-r from-[#2C333F] to-[#161D29] py-20">
        <motion.div 
          variants={fadeIn('up', 0.2)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.2 }}
          className="mx-auto w-11/12 max-w-maxContent text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-8">
            Got Specific Job Requirements?
          </h2>
          <p className="text-richblack-100 text-lg mb-10 lg:w-[70%] mx-auto leading-relaxed">
            We provide customized training that are tailor made to your organization's specific needs. We'll work with you to understand your objectives to develop a customized solution for improving performance and productivity, and help you identify the right talent.
          </p>
          <Link to="/contact">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-50 text-black px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-200"
            >
              Contact Now
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto w-11/12 max-w-maxContent py-20">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <motion.div 
            variants={fadeIn('right', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="lg:w-[60%]"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-6">
              What do Employers Get from <HighlightText text="Beeja Academy?" />
            </h2>
            <p className="text-richblack-100 mb-8 text-lg">
              Beeja Academy's ProMent program transforms candidates to industry ready professionals
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4 p-4 bg-richblack-800 rounded-lg border-l-4 border-yellow-50">
                <div className="w-3 h-3 bg-yellow-50 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-richblack-100 leading-relaxed">
                  When employers associate with Beeja Academy, they get industry-ready candidates who can be assigned to real-time projects from day one, without you having to spend time and money on training them. Get immediate access to skilled professionals and speed up the growth of your organization.
                </p>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-richblack-800 rounded-lg border-l-4 border-caribbeangreen-300">
                <div className="w-3 h-3 bg-caribbeangreen-300 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-richblack-100 leading-relaxed">
                  Beeja Academy trains candidates according to current industry demands and makes them available for the industry. Each of our candidates is trained and acquainted with the role nuances the position demands.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={bounce}
                  initial='hidden'
                  whileInView={'show'}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-richblack-800 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {benefit.icon}
                    <h4 className="text-white font-semibold">{benefit.title}</h4>
                  </div>
                  <p className="text-richblack-300 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            <Link to="/contact">
              <button className="bg-yellow-50 text-black px-6 py-3 rounded-lg font-semibold hover:scale-95 transition-all duration-200 hover:shadow-lg">
                Get in Touch
              </button>
            </Link>
          </motion.div>

          <motion.div 
            variants={fadeIn('left', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="lg:w-[40%] relative"
          >
            <div className="bg-gradient-to-br from-caribbeangreen-300 to-blue-300 absolute top-4 left-4 w-full h-full blur-2xl opacity-20 rounded-xl"></div>
            <div className="bg-richblack-800 rounded-xl p-8 relative z-10 border border-richblack-700">
              <div className="flex items-center justify-center h-64 bg-gradient-to-br from-richblack-700 to-richblack-600 rounded-lg">
                <div className="text-center">
                  <FaHandshake className="text-6xl text-caribbeangreen-300 mx-auto mb-4" />
                  <p className="text-richblack-200">Professional Presentation</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
          >
            <BenefitsForEmployers />
          </motion.div>

      {/* CTA Section */}
      <section className="mx-auto w-11/12 max-w-maxContent py-20">
        <motion.div 
          variants={fadeIn('up', 0.2)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.2 }}
          className="bg-gradient-to-r from-[#B55DFE] to-[#216AFD] rounded-2xl p-10 text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-white/90 text-lg mb-8 lg:w-[60%] mx-auto">
            Join hundreds of companies that have already partnered with Beeja Academy to access top-tier talent and accelerate their growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="bg-white text-[#216AFD] px-8 py-3 rounded-lg font-semibold hover:scale-95 transition-all duration-200 hover:shadow-lg">
                Start Partnership
              </button>
            </Link>
            <Link to="/about">
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#216AFD] transition-all duration-200">
                Learn More
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      <ImprovedFooter />
    </div>
  );
};

export default InstituteService;
