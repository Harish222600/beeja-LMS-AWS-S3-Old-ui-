import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUsers, FaEye, FaEdit, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { getAllCourses } from '../../../services/operations/courseDetailsAPI';
import { getFeaturedCourses, updateFeaturedCourses } from '../../../services/operations/featuredCoursesAPI';
import { toast } from 'react-hot-toast';

const FeaturedCoursesManagement = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState({
    popularPicks: [],
    topEnrollments: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('popularPicks');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
    loadFeaturedCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const courses = await getAllCourses();
      if (courses && Array.isArray(courses)) {
        const publishedCourses = courses.filter(course => course.status === 'Published');
        setAllCourses(publishedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedCourses = async () => {
    try {
      const response = await getFeaturedCourses();
      if (response) {
        setFeaturedCourses({
          popularPicks: response.popularPicks?.map(course => course._id) || [],
          topEnrollments: response.topEnrollments?.map(course => course._id) || []
        });
      }
    } catch (error) {
      console.error('Error loading featured courses:', error);
      toast.error('Failed to load featured courses');
    }
  };

  const saveFeaturedCourses = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Extract just the course IDs from the state
      const dataToSend = {
        popularPicks: featuredCourses.popularPicks,
        topEnrollments: featuredCourses.topEnrollments
      };
      await updateFeaturedCourses(dataToSend, token);
      
    } catch (error) {
      console.error('Error saving featured courses:', error);
      toast.error('Failed to save featured courses');
    } finally {
      setSaving(false);
    }
  };

  const addToFeatured = (courseId, section) => {
    if (featuredCourses[section].includes(courseId)) {
      toast.error('Course already added to this section');
      return;
    }

    setFeaturedCourses(prev => ({
      ...prev,
      [section]: [...prev[section], courseId]
    }));
  };

  const removeFromFeatured = (courseId, section) => {
    setFeaturedCourses(prev => ({
      ...prev,
      [section]: prev[section].filter(id => id !== courseId)
    }));
  };

  const getFeaturedCoursesData = (section) => {
    return featuredCourses[section]
      .map(courseId => allCourses.find(course => course._id === courseId))
      .filter(Boolean);
  };

  const getAvailableCourses = (section) => {
    const availableCourses = allCourses.filter(course => !featuredCourses[section].includes(course._id));
    
    if (searchTerm === '') {
      return availableCourses;
    }
    
    return availableCourses.filter(course =>
      course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFeaturedCoursesFiltered = (section) => {
    const featuredCoursesData = getFeaturedCoursesData(section);
    
    if (searchTerm === '') {
      return featuredCoursesData;
    }
    
    return featuredCoursesData.filter(course =>
      course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const CourseCard = ({ course, isFeatured, section, onAdd, onRemove }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-richblack-800 p-4 rounded-lg shadow-lg flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-richblack-5 line-clamp-1">{course.courseName}</h3>
          <p className="text-sm text-richblack-300 line-clamp-2">{course.courseDescription}</p>
        </div>
        {isFeatured ? (
          <button
            onClick={() => onRemove(course._id)}
            className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors flex items-center gap-1"
          >
            <FaTimes /> Remove
          </button>
        ) : (
          <button
            onClick={() => onAdd(course._id)}
            className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30 transition-colors flex items-center gap-1"
          >
            <FaStar /> Add
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-richblack-300">
        <div className="flex items-center gap-2">
          <FaUsers className="text-yellow-100" />
          <span>{course.studentsEnrolled?.length || 0} enrolled</span>
        </div>
        <div className="flex items-center gap-2">
          <FaEye className="text-yellow-100" />
          <span>{course.totalViews || 0} views</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-richblack-5">Featured Courses Management</h2>
          <p className="text-sm text-richblack-300">Manage courses displayed in Popular Picks and Top Enrollments sections</p>
        </div>
        <button
          onClick={saveFeaturedCourses}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-black rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : (
            <>
              <FaSave /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-richblack-700">
        <button
          onClick={() => setActiveTab('popularPicks')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'popularPicks'
              ? 'text-yellow-50 border-b-2 border-yellow-50'
              : 'text-richblack-300 hover:text-richblack-100'
          }`}
        >
          Popular Picks
        </button>
        <button
          onClick={() => setActiveTab('topEnrollments')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'topEnrollments'
              ? 'text-yellow-50 border-b-2 border-yellow-50'
              : 'text-richblack-300 hover:text-richblack-100'
          }`}
        >
          Top Enrollments
        </button>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-richblack-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by name, description, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-richblack-400 hover:text-richblack-200"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="text-sm text-richblack-300 flex items-center">
            Searching: "{searchTerm}"
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-50"></div>
        </div>
      ) : (
        <div className="grid gap-8">
          {/* Featured Courses */}
          <div>
            <h3 className="text-lg font-semibold text-richblack-50 mb-4">
              Featured in {activeTab === 'popularPicks' ? 'Popular Picks' : 'Top Enrollments'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFeaturedCoursesFiltered(activeTab).length > 0 ? (
                getFeaturedCoursesFiltered(activeTab).map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isFeatured={true}
                    section={activeTab}
                    onRemove={(courseId) => removeFromFeatured(courseId, activeTab)}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-richblack-300">
                  {searchTerm ? 'No featured courses match your search criteria.' : 'No featured courses added yet.'}
                </div>
              )}
            </div>
          </div>

          {/* Available Courses */}
          <div>
            <h3 className="text-lg font-semibold text-richblack-50 mb-4">Available Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableCourses(activeTab).length > 0 ? (
                getAvailableCourses(activeTab).map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isFeatured={false}
                    section={activeTab}
                    onAdd={(courseId) => addToFeatured(courseId, activeTab)}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-richblack-300">
                  {searchTerm ? 'No available courses match your search criteria.' : 'No available courses found.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedCoursesManagement;
