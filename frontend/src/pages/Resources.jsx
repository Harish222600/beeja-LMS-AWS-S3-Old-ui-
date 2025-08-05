import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaBook, FaCode, FaVideo, FaDownload, FaUsers, FaTools, FaGraduationCap, FaSearch, FaFilter, FaExternalLinkAlt, FaStar } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "All Resources", icon: <FaBook /> },
    { id: "study", name: "Study Materials", icon: <FaGraduationCap /> },
    { id: "tools", name: "Tools & Software", icon: <FaTools /> },
    { id: "community", name: "Community", icon: <FaUsers /> },
    { id: "external", name: "External Links", icon: <FaExternalLinkAlt /> }
  ];

  const resources = [
    {
      id: 1,
      title: "Complete JavaScript Course Notes",
      description: "Comprehensive notes covering ES6+, async programming, and modern frameworks",
      category: "study",
      type: "PDF",
      downloads: 1250,
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      title: "React Hooks Cheat Sheet",
      description: "Quick reference guide for all React hooks with practical examples",
      category: "study",
      type: "PDF",
      downloads: 890,
      rating: 4.9,
      featured: true
    },
    {
      id: 3,
      title: "Python Practice Exercises",
      description: "100+ coding challenges from beginner to advanced level",
      category: "study",
      type: "ZIP",
      downloads: 2100,
      rating: 4.7,
      featured: false
    },
    {
      id: 4,
      title: "VS Code Setup Guide",
      description: "Complete setup guide with essential extensions for web development",
      category: "tools",
      type: "Video",
      downloads: 750,
      rating: 4.6,
      featured: false
    },
    {
      id: 5,
      title: "Git & GitHub Masterclass",
      description: "Version control best practices and collaboration workflows",
      category: "tools",
      type: "Video",
      downloads: 1800,
      rating: 4.9,
      featured: true
    },
    {
      id: 6,
      title: "Study Group Finder",
      description: "Connect with peers and join study groups for collaborative learning",
      category: "community",
      type: "Platform",
      downloads: 0,
      rating: 4.5,
      featured: false
    },
    {
      id: 7,
      title: "MDN Web Docs",
      description: "Comprehensive documentation for web technologies",
      category: "external",
      type: "Website",
      downloads: 0,
      rating: 5.0,
      featured: true
    },
    {
      id: 8,
      title: "FreeCodeCamp",
      description: "Free coding bootcamp with interactive lessons",
      category: "external",
      type: "Website",
      downloads: 0,
      rating: 4.8,
      featured: false
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter(resource => resource.featured);

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

  const getTypeIcon = (type) => {
    switch (type) {
      case "PDF": return <FaBook className="text-red-400" />;
      case "Video": return <FaVideo className="text-blue-400" />;
      case "ZIP": return <FaCode className="text-green-400" />;
      case "Website": return <FaExternalLinkAlt className="text-purple-400" />;
      case "Platform": return <FaUsers className="text-yellow-400" />;
      default: return <FaBook className="text-gray-400" />;
    }
  };

  const ResourceCard = ({ resource, featured = false }) => (
    <motion.div
      className={`bg-richblack-800 p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
        featured ? 'border-yellow-50/30 bg-gradient-to-br from-richblack-800 to-richblack-700' : 'border-richblack-700 hover:border-richblack-600'
      }`}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getTypeIcon(resource.type)}
          <div>
            <h3 className={`text-lg font-semibold group-hover:text-yellow-50 transition-colors ${
              featured ? 'text-yellow-50' : 'text-richblack-50'
            }`}>
              {resource.title}
            </h3>
            <span className="text-sm text-richblack-400">{resource.type}</span>
          </div>
        </div>
        {featured && (
          <div className="bg-yellow-50 text-richblack-900 px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>
      
      <p className="text-richblack-300 mb-4 leading-relaxed">
        {resource.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-richblack-400">
          {resource.downloads > 0 && (
            <span className="flex items-center gap-1">
              <FaDownload /> {resource.downloads.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FaStar className="text-yellow-400" /> {resource.rating}
          </span>
        </div>
        <button className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 flex items-center gap-2 group-hover:scale-105">
          {resource.type === "Website" || resource.type === "Platform" ? "Visit" : "Download"}
          {resource.type === "Website" || resource.type === "Platform" ? <FaExternalLinkAlt /> : <FaDownload />}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-green-900 via-richblack-900 to-blue-900 py-20"
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
            Learning <span className="text-yellow-50">Resources</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto mb-8"
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Enhance your learning journey with our comprehensive collection of study materials, tools, and community resources.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-maxContent mx-auto py-16 text-richblack-5">
        {/* Featured Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured <span className="text-yellow-50">Resources</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} featured={true} />
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
                    placeholder="Search resources..."
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
        </section>

        {/* All Resources */}
        <section>
          <h2 className="text-3xl font-bold mb-8">
            All Resources
            <span className="text-richblack-400 text-lg font-normal ml-3">
              ({filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'})
            </span>
          </h2>
          
          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                <FaSearch className="text-4xl text-richblack-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-richblack-300 mb-2">No resources found</h3>
                <p className="text-richblack-400">Try adjusting your search terms or category filter.</p>
              </div>
            </div>
          )}
        </section>

        {/* Community Section */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600">
            <h2 className="text-3xl font-bold text-center mb-8">
              Join Our Learning <span className="text-yellow-50">Community</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Discussion Forums</h3>
                <p className="text-richblack-300 text-sm">Connect with fellow learners</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaGraduationCap className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Study Groups</h3>
                <p className="text-richblack-300 text-sm">Collaborative learning sessions</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStar className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mentorship</h3>
                <p className="text-richblack-300 text-sm">Guidance from experts</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTools className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Career Services</h3>
                <p className="text-richblack-300 text-sm">Job placement assistance</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Resources;
