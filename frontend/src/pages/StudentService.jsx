import React from "react";
import { motion } from "framer-motion";
import { fadeIn, bounce, scaleUp } from "../components/common/motionFrameVarients";
import HighlightText from "../components/core/HomePage/HighlightText";
import ImprovedFooter from "../components/common/ImprovedFooter";
import { Link } from "react-router-dom";
import { 
  FaRocket, 
  FaCode, 
  FaBrain, 
  FaUsers, 
  FaTrophy, 
  FaLightbulb,
  FaGraduationCap,
  FaChartLine,
  FaStar,
  FaPlay,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";

const StudentService = () => {
  const features = [
    {
      icon: <FaRocket className="text-4xl text-pink-400" />,
      title: "Launch Your Career",
      description: "From zero to hero in tech with our accelerated learning programs for the students",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <FaCode className="text-4xl text-blue-400" />,
      title: "Master Modern Tech",
      description: "Learn cutting-edge technologies that companies are actively hiring for",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaBrain className="text-4xl text-richblue-100" />,
      title: "Think Like a Pro",
      description: "Develop problem-solving skills and technical mindset of industry experts",
      color: "from-white to-indigo-500"
    },
    {
      icon: <FaUsers className="text-4xl text-brown-400" />,
      title: "Join the Community",
      description: "Connect with peers, mentors, and industry professionals in our network",
      color: "from-brown-400 to-emerald-500"
    }
  ];

  const learningPath = [
    {
      step: "Discover",
      title: "Find Your Path",
      description: "Explore different tech domains and discover what excites you most",
      icon: <FaLightbulb className="text-2xl" />
    },
    {
      step: "Learn",
      title: "Build Skills",
      description: "Master fundamentals through hands-on projects and real-world scenarios",
      icon: <FaGraduationCap className="text-2xl" />
    },
    {
      step: "Practice",
      title: "Apply Knowledge",
      description: "Work on industry-level projects and build an impressive portfolio",
      icon: <FaCode className="text-2xl" />
    },
    {
      step: "Launch",
      title: "Start Career",
      description: "Get placed in top companies with our comprehensive job assistance",
      icon: <FaRocket className="text-2xl" />
    }
  ];

  const stats = [
    { number: "5000+", label: "Students Trained", icon: <FaUsers /> },
    { number: "95%", label: "Placement Rate", icon: <FaTrophy /> },
    { number: "200+", label: "Partner Companies", icon: <FaChartLine /> },
    { number: "4.8/5", label: "Student Rating", icon: <FaStar /> }
  ];

  return (
    <div className="bg-richblack-900 min-h-screen overflow-hidden">
      {/* Hero Section with Unique Design */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 mx-auto w-11/12 max-w-maxContent text-center">
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-violet-500/20 backdrop-blur-sm border border-pink-500/30 rounded-full px-6 py-2 mb-8">
              <FaStar className="text-yellow-400" />
              <span className="text-white text-sm font-medium">Rated #1 Tech Training Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <div className="text-white mb-2">Your</div>
              <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-4 rounded-2xl inline-block mb-2">
                <span className="text-white font-extrabold">Dream Tech Career</span>
              </div>
              <div className="text-white">Starts Here</div>
            </h1>
            
            <p className="text-xl text-richblack-200 mb-10 lg:w-[60%] mx-auto leading-relaxed">
              Transform from a beginner to a job-ready developer with our immersive, project-based learning experience designed by industry experts.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link to="/free-courses">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
                >
                  Browse Free Courses <FaGraduationCap className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 hover:bg-white hover:text-richblack-900 hover:shadow-lg hover:shadow-white/50 transition-all duration-300"
                >
                  Sign Up Now <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>

    
          </motion.div>
        </div>
      </section>

      {/* Features Section with Card Design */}
      <section className="py-20 relative">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <motion.div 
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <div className="text-white mb-2">Why Students</div>
              <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-4 rounded-2xl inline-block mb-2">
                <span className="text-white font-extrabold">Choose Us</span>
              </div>
            </h2>
            <p className="text-richblack-300 text-xl lg:w-[50%] mx-auto">
              We don't just teach code, we build careers and transform lives
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn(index % 2 === 0 ? 'right' : 'left', 0.2)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: index * 0.2 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className="relative bg-richblack-800/50 backdrop-blur-sm border border-richblack-700 rounded-2xl p-8 hover:border-richblack-600 transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-richblack-300 text-lg leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Timeline */}
      <section className="py-20 bg-gradient-to-b from-richblack-900 to-richblack-800">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <motion.div 
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <div className="text-white mb-2">Your</div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-2xl inline-block">
                <span className="text-white font-extrabold">Learning Journey</span>
              </div>
            </h2>
            <p className="text-richblack-300 text-xl">
              A structured path from beginner to professional
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 rounded-full hidden lg:block"></div>
            
            {learningPath.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn(index % 2 === 0 ? 'right' : 'left', 0.2)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-center mb-16 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                  <div className="bg-richblack-800 rounded-2xl p-8 border border-richblack-700 hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-gradient-to-r from-pink-500 to-richblack-800 p-3 rounded-full text-white">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-purple-400 font-semibold text-sm uppercase tracking-wider text-white">{item.step}</div>
                        <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-richblack-300 text-lg">{item.description}</p>
                  </div>
                </div>
                
                {/* Timeline Node */}
                <div className="hidden lg:block relative z-10">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-richblack-900"></div>
                </div>
                
                <div className="lg:w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-cyan-900/20"></div>
        <div className="relative mx-auto w-11/12 max-w-maxContent">
          <motion.div 
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center mb-16"
          >
            {/* <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Success Stories</span> That Inspire
            </h2> */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-2xl inline-block">
                <span className="text-white font-extrabold">Success Stories</span>
              </div>
              <div className="text-white mb-2">That Inspire</div>
            </h2>
            <p className="text-richblack-300 text-xl">
              Real students, real transformations, real careers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Frontend Developer at Google", salary: "₹18 LPA", story: "From marketing to tech in 6 months" },
              { name: "Rahul Sharma", role: "Full Stack Developer at Microsoft", salary: "₹22 LPA", story: "College dropout to tech leader" },
              { name: "Priya Patel", role: "Data Scientist at Amazon", salary: "₹25 LPA", story: "Career switch at 30, now thriving" }
            ].map((story, index) => (
              <motion.div
                key={index}
                variants={scaleUp}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: index * 0.2 }}
                className="bg-richblack-800/50 backdrop-blur-sm border border-richblack-700 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-400 border-2 border-purple-400 rounded-full flex items-center justify-center text-richblack-900 font-bold hover:bg-purple-400 hover:text-white transition-all duration-300 shadow-lg shadow-purple-400/20">
                    {story.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{story.name}</h4>
                    <p className="text-white text-sm">{story.role}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2">{story.salary}</div>
                <p className="text-richblack-300">{story.story}</p>
                <div className="flex text-yellow-400 mt-3">
                  {[...Array(5)].map((_, i) => <FaStar key={i} className="text-sm" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Unique Design */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/30 via-purple-900/30 to-cyan-900/30"></div>
        <div className="relative mx-auto w-11/12 max-w-maxContent">
          <motion.div 
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center bg-richblack-800/50 backdrop-blur-sm border border-richblack-700 rounded-3xl p-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to <span className=" text-pink-400 to-cyan-400 bg-clip-text  ">Transform</span> Your Life?
            </h2>
            <p className="text-richblack-200 text-xl mb-8 lg:w-[60%] mx-auto">
              Join thousands of students who've already started their journey to a successful tech career
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Link to="/courses">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
                >
                  Start Your Journey Today
                </motion.button>
              </Link>
              
              <Link to="/contact">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 hover:bg-white hover:text-richblack-900 hover:shadow-lg hover:shadow-white/50 transition-all duration-300"
                >
                  Talk to Counselor <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 text-richblack-300">
              <FaCheckCircle className="text-green-400" />
              <span>No hidden fees</span>
              <span>•</span>
              <FaCheckCircle className="text-green-400" />
              <span>100% Job assistance</span>
              <span>•</span>
              <FaCheckCircle className="text-green-400" />
              <span>Lifetime support</span>
            </div>
          </motion.div>
        </div>
      </section>

      <ImprovedFooter />
    </div>
  );
};

export default StudentService;
