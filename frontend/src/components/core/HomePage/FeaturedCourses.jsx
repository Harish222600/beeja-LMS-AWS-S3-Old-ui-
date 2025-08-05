import React, { useState, useEffect } from 'react';
import { getFeaturedCourses } from '../../../services/operations/featuredCoursesAPI';
import Course_Slider from '../Catalog/Course_Slider';

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState({
    popularPicks: [],
    topEnrollments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async () => {
    try {
      const response = await getFeaturedCourses();
      if (response) {
        setFeaturedCourses({
          popularPicks: response.popularPicks || [],
          topEnrollments: response.topEnrollments || []
        });
      }
    } catch (error) {
      console.error('Error loading featured courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 px-2 xs:px-4 sm:px-0">
      {/* Popular Picks Section */}
      {featuredCourses.popularPicks?.length > 0 && (
        <div>
          <h2 className="text-white mb-6 text-xl xs:text-2xl font-semibold">
            Popular Picks for You
          </h2>
          <Course_Slider Courses={featuredCourses.popularPicks} />
        </div>
      )}

      {/* Top Enrollments Section */}
      {featuredCourses.topEnrollments?.length > 0 && (
        <div>
          <h2 className="text-white mb-6 text-xl xs:text-2xl font-semibold">
            Top Enrollments Today
          </h2>
          <Course_Slider Courses={featuredCourses.topEnrollments} />
        </div>
      )}

      {/* Show message if no featured courses */}
      {(!featuredCourses.popularPicks?.length && !featuredCourses.topEnrollments?.length) && (
        <div className="text-center py-8">
          {/* <p className="text-richblack-300">No featured courses available at the moment</p> */}
        </div>
      )}
    </div>
  );
};

export default FeaturedCourses;
