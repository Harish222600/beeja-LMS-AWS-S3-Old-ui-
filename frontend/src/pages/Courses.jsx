import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCode, FaDatabase, FaMobile, FaCloud, FaShieldAlt, FaCogs, FaSearch, FaFilter, FaStar, FaClock, FaUsers, FaPlay, FaBookmark, FaArrowRight } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";
import { getAllCourses } from "../services/operations/courseDetailsAPI";

const Courses = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const coursesData = await getAllCourses();
      console.log("Raw courses data:", coursesData);
      console.log("Is array?", Array.isArray(coursesData));
      console.log("Length:", coursesData?.length);
      
      if (Array.isArray(coursesData)) {
        console.log("First course:", coursesData[0]);
        setCourses(coursesData);
      } else {
        console.log("Courses data is not an array, setting empty array");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]); // Set empty array on error
    }
    setLoading(false);
  };

  const filteredCourses = courses.filter(course => {
    if (!course) return false;

    // Exclude drafted courses by draft flags or status
    if (course.draft === true || course.isDraft === true || course.status === "Draft") return false;
    
    const matchesCategory = activeCategory === "all" || 
                          (course.category && course.category === activeCategory);
    
    const matchesSearch = 
      (course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.courseDescription && course.courseDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.tag && Array.isArray(course.tag) && 
       course.tag.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case "popular": return (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0);
      case "rating": return (b.averageRating || 0) - (a.averageRating || 0);
      case "price-low": return (a.price || 0) - (b.price || 0);
      case "price-high": return (b.price || 0) - (a.price || 0);
      default: return 0;
    }
  });

  const featuredCourses = courses.filter(course => course && course.featured && !(course.draft === true || course.isDraft === true || course.status === "Draft"));

  

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

  const CourseCard = ({ course, featured = false }) => (
    <motion.div
      className={`bg-richblack-800 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
        featured ? 'border-yellow-50/30' : 'border-richblack-700 hover:border-richblack-600'
      }`}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        <img 
          src={course.thumbnail || course.image} 
          alt={course.courseName}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {course.bestseller && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Bestseller
            </span>
          )}
          {featured && (
            <span className="bg-yellow-50 text-richblack-900 px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          )}
        </div>
        <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FaPlay />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-yellow-50 font-semibold">{course.level}</span>
          <button className="text-richblack-400 hover:text-yellow-50 transition-colors">
            <FaBookmark />
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-richblack-50 mb-2 group-hover:text-yellow-50 transition-colors">
          {course.courseName}
        </h3>
        
        <p className="text-richblack-300 text-sm mb-4 line-clamp-2">
          {course.courseDescription}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-richblack-400 mb-4">
          <span className="flex items-center gap-1">
            <FaClock /> {course.totalDuration || "N/A"}
          </span>
          <span className="flex items-center gap-1">
            <FaUsers /> {course.studentsEnrolled?.length?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaStar className="text-yellow-400" /> {course.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tag?.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="bg-richblack-700 text-richblack-200 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {course.tag && course.tag.length > 3 && (
            <span className="text-richblack-400 text-xs">+{course.tag.length - 3} more</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {course.courseType === 'Free' || course.adminSetFree ? (
              <span className="text-2xl font-bold text-green-400">Free</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-yellow-50">₹{course.price}</span>
                {course.originalPrice && course.originalPrice !== course.price && (
                  <span className="text-richblack-400 line-through ml-2">₹{course.originalPrice}</span>
                )}
              </>
            )}
          </div>
          <button 
            onClick={() => navigate(`/courses/${course._id}`)}
            className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 flex items-center gap-2 group-hover:scale-105"
          >
            Enroll Now <FaArrowRight />
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-richblack-700">
          <p className="text-sm text-richblack-400">
            Instructor: <span className="text-richblack-200">
              {course.instructor?.firstName} {course.instructor?.lastName}
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-indigo-900 via-richblack-900 to-purple-900 py-20"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-11/12 max-w-maxContent mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our <span className="text-yellow-50">Courses</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto mb-8"
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Master new skills and advance your career with our comprehensive, industry-relevant courses designed by experts.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-maxContent mx-auto py-16 text-richblack-5">
        {/* Featured Courses */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured <span className="text-yellow-50">Courses</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} featured={true} />
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
                    placeholder="Search courses, skills, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              
              {/* Sort */}
              <div className="w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        

        {/* All Courses */}
        <section>
          <h2 className="text-3xl font-bold mb-8">
            All Courses
            <span className="text-richblack-400 text-lg font-normal ml-3">
              ({sortedCourses.length} {sortedCourses.length === 1 ? 'course' : 'courses'})
            </span>
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50"></div>
            </div>
          ) : sortedCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCourses.map((course) => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                <FaSearch className="text-4xl text-richblack-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-richblack-300 mb-2">No courses found</h3>
                <p className="text-richblack-400">Try adjusting your search terms or category filter.</p>
              </div>
            </div>
          )}
        </section>

        {/* Why Choose Our Courses */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our <span className="text-yellow-50">Courses?</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCode className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Industry-Relevant</h3>
                <p className="text-richblack-300 text-sm">Curriculum designed by industry experts</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPlay className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Hands-On Projects</h3>
                <p className="text-richblack-300 text-sm">Real-world applications and portfolio building</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaClock className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Flexible Learning</h3>
                <p className="text-richblack-300 text-sm">Learn at your own pace, anytime</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Courses;
