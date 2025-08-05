import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft, FaLinkedin, FaTwitter, FaFilter, FaSearch, FaPlay, FaGraduationCap, FaBriefcase } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Testimonials = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Web Developer",
      company: "TechCorp Solutions",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Priya",
      content: "The courses at Beeja Academy transformed my career. The practical approach and industry-relevant curriculum helped me land my dream job as a web developer. The instructors are highly knowledgeable and supportive.",
      rating: 5,
      course: "Full Stack Development",
      category: "development",
      salaryIncrease: "150%",
      timeToJob: "3 months",
      featured: true,
      videoTestimonial: true
    },
    {
      id: 2,
      name: "Rahul Patel",
      role: "Data Scientist",
      company: "DataMinds Analytics",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Rahul",
      content: "I completed the Data Science track, and it exceeded my expectations. The hands-on projects and real-world datasets gave me practical experience that I use daily in my work. The community support was invaluable.",
      rating: 5,
      course: "Data Science & Analytics",
      category: "data-science",
      salaryIncrease: "200%",
      timeToJob: "2 months",
      featured: true,
      videoTestimonial: false
    },
    {
      id: 3,
      name: "Ananya Kumar",
      role: "UI/UX Designer",
      company: "Creative Solutions",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Ananya",
      content: "The design courses here are exceptional. They cover both theoretical principles and practical applications. The feedback from industry experts helped me improve my portfolio significantly.",
      rating: 5,
      course: "UI/UX Design",
      category: "design",
      salaryIncrease: "120%",
      timeToJob: "4 months",
      featured: false,
      videoTestimonial: true
    },
    {
      id: 4,
      name: "Mohammed Ali",
      role: "Cloud Engineer",
      company: "CloudTech Systems",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Mohammed",
      content: "The cloud computing certification program was comprehensive and up-to-date with industry standards. The labs and practical exercises prepared me well for real-world scenarios.",
      rating: 4,
      course: "Cloud Computing",
      category: "cloud",
      salaryIncrease: "180%",
      timeToJob: "1 month",
      featured: true,
      videoTestimonial: false
    },
    {
      id: 5,
      name: "Sarah Wilson",
      role: "Full Stack Developer",
      company: "InnovateTech",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Sarah",
      content: "The full stack development bootcamp was intense but incredibly rewarding. The curriculum covered all modern technologies, and the project-based learning approach was very effective.",
      rating: 5,
      course: "Full Stack Development",
      category: "development",
      salaryIncrease: "160%",
      timeToJob: "2 months",
      featured: false,
      videoTestimonial: true
    },
    {
      id: 6,
      name: "Raj Malhotra",
      role: "DevOps Engineer",
      company: "AgileOps Solutions",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Raj",
      content: "The DevOps course helped me understand the complete CI/CD pipeline. The instructors shared valuable insights from their industry experience, which was incredibly helpful.",
      rating: 5,
      course: "DevOps & Cloud",
      category: "cloud",
      salaryIncrease: "140%",
      timeToJob: "3 months",
      featured: false,
      videoTestimonial: false
    },
    {
      id: 7,
      name: "Lisa Chen",
      role: "Machine Learning Engineer",
      company: "AI Innovations",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Lisa",
      content: "The AI and Machine Learning course was cutting-edge. The practical projects and mentorship helped me transition from a traditional software role to ML engineering.",
      rating: 5,
      course: "AI & Machine Learning",
      category: "data-science",
      salaryIncrease: "220%",
      timeToJob: "2 months",
      featured: true,
      videoTestimonial: true
    },
    {
      id: 8,
      name: "David Rodriguez",
      role: "Product Designer",
      company: "Design Studio Pro",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=David",
      content: "The design thinking methodology and user research techniques I learned here completely changed how I approach design problems. Highly recommended!",
      rating: 4,
      course: "Product Design",
      category: "design",
      salaryIncrease: "130%",
      timeToJob: "5 months",
      featured: false,
      videoTestimonial: false
    }
  ];

  const categories = [
    { id: "all", name: "All Stories", count: testimonials.length },
    { id: "development", name: "Development", count: testimonials.filter(t => t.category === "development").length },
    { id: "data-science", name: "Data Science", count: testimonials.filter(t => t.category === "data-science").length },
    { id: "design", name: "Design", count: testimonials.filter(t => t.category === "design").length },
    { id: "cloud", name: "Cloud & DevOps", count: testimonials.filter(t => t.category === "cloud").length }
  ];

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesCategory = activeFilter === "all" || testimonial.category === activeFilter;
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTestimonials = testimonials.filter(t => t.featured);

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

  const TestimonialCard = ({ testimonial, featured = false }) => (
    <motion.div
      className={`bg-richblack-800 p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl group relative ${
        featured ? 'border-yellow-50/30 bg-gradient-to-br from-richblack-800 to-richblack-700' : 'border-richblack-700 hover:border-richblack-600'
      }`}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      {featured && (
        <div className="absolute -top-3 -right-3 bg-yellow-50 text-richblack-900 px-3 py-1 rounded-full text-xs font-semibold">
          Featured
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <FaQuoteLeft className="text-2xl text-yellow-50/30" />
        {testimonial.videoTestimonial && (
          <button className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
            <FaPlay className="text-sm" />
          </button>
        )}
      </div>
      
      <p className="text-richblack-100 mb-6 leading-relaxed italic">
        "{testimonial.content}"
      </p>
      
      <div className="flex items-center mb-4">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full mr-4 border-2 border-richblack-600"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-richblack-50">{testimonial.name}</h3>
          <p className="text-sm text-richblack-300">{testimonial.role}</p>
          <p className="text-sm text-yellow-50">{testimonial.company}</p>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <FaStar 
              key={i} 
              className={`text-sm ${i < testimonial.rating ? 'text-yellow-400' : 'text-richblack-600'}`} 
            />
          ))}
        </div>
      </div>
      
      <div className="border-t border-richblack-700 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-richblack-400">Course: <span className="text-richblack-200">{testimonial.course}</span></span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-green-400">+{testimonial.salaryIncrease} salary</span>
          <span className="text-blue-400">Job in {testimonial.timeToJob}</span>
        </div>
      </div>
    </motion.div>
  );

  const stats = [
    { label: "Success Rate", value: "95%", icon: <FaGraduationCap /> },
    { label: "Avg Salary Increase", value: "165%", icon: <FaBriefcase /> },
    { label: "Job Placement", value: "3 months", icon: <FaStar /> },
    { label: "Student Satisfaction", value: "4.8/5", icon: <FaQuoteLeft /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-purple-900 via-richblack-900 to-pink-900 py-20"
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
            Success <span className="text-yellow-50">Stories</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover how Beeja Academy has helped thousands of students transform their careers and achieve their dreams.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-maxContent mx-auto py-16 text-richblack-5">
        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-richblack-800 p-6 rounded-xl text-center border border-richblack-700 hover:border-yellow-50/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl text-yellow-50 mb-3 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-yellow-50 mb-2">{stat.value}</div>
                <div className="text-richblack-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured <span className="text-yellow-50">Success Stories</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} featured={true} />
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-12">
          <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role, company, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeFilter === category.id
                        ? 'bg-yellow-50 text-richblack-900'
                        : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Testimonials */}
        <section>
          <h2 className="text-3xl font-bold mb-8">
            All Success Stories
            <span className="text-richblack-400 text-lg font-normal ml-3">
              ({filteredTestimonials.length} {filteredTestimonials.length === 1 ? 'story' : 'stories'})
            </span>
          </h2>
          
          {filteredTestimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                <FaSearch className="text-4xl text-richblack-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-richblack-300 mb-2">No stories found</h3>
                <p className="text-richblack-400">Try adjusting your search terms or category filter.</p>
              </div>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Write Your <span className="text-yellow-50">Success Story?</span>
            </h2>
            <p className="text-richblack-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful graduates who have transformed their careers with Beeja Academy. 
              Start your journey today and become our next success story.
            </p>
            <motion.button 
              className="bg-yellow-50 text-richblack-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Learning Today
            </motion.button>
          </div>
        </section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Testimonials;
