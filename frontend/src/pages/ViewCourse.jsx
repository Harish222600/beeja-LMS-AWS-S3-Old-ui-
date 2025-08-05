import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedQuizzes,
  setPassedQuizzes,
} from "../slices/viewCourseSlice"

import { setCourseViewSidebar } from "../slices/sidebarSlice"

export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [reviewModal, setReviewModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Memoized function to calculate total lectures
  const calculateTotalLectures = useCallback((courseContent) => {
    return courseContent?.reduce((total, section) => total + section.subSection.length, 0) || 0
  }, [])

  // Memoized function to reset course state
  const resetCourseState = useCallback(() => {
    dispatch(setCourseSectionData([]))
    dispatch(setEntireCourseData({}))
    dispatch(setCompletedLectures([]))
    dispatch(setCompletedQuizzes([]))
    dispatch(setPassedQuizzes([]))
    dispatch(setTotalNoOfLectures(0))
  }, [dispatch])

  // Get current course data from Redux store
  const currentCourseData = useSelector(state => state.viewCourse.courseEntireData)

  // Memoized course data fetching
  const fetchCourseDetails = useCallback(async () => {
    if (!courseId || !token) return
    
    // Prevent duplicate fetches if we already have the data
    if (currentCourseData?._id === courseId) return
    
    setLoading(true)
    try {
      const courseData = await getFullDetailsOfCourse(courseId, token)
      
      if (courseData?.courseDetails) {
        // Check if course is deleted/deactivated or order is inactive
        if (courseData.courseDetails.isDeactivated || courseData.courseDetails.isOrderInactive) {
          console.error("Course access is restricted")
          resetCourseState()
          navigate('/dashboard/enrolled-courses')
          return
        }

        const totalLectures = calculateTotalLectures(courseData.courseDetails.courseContent)
        
        // Batch dispatch to reduce re-renders
        dispatch((dispatch) => {
          dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
          dispatch(setEntireCourseData(courseData.courseDetails))
          dispatch(setCompletedLectures(courseData.completedVideos || []))
          dispatch(setCompletedQuizzes(courseData.completedQuizzes || []))
          dispatch(setPassedQuizzes(courseData.passedQuizzes || []))
          dispatch(setTotalNoOfLectures(totalLectures))
        })
      } else {
        console.error("Course data not found or invalid response")
        resetCourseState()
        navigate('/dashboard/enrolled-courses')
        toast.error("Unable to access this course")
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
      resetCourseState()
      navigate('/dashboard/enrolled-courses')
      toast.error(error?.response?.data?.message || "Error loading course")
    } finally {
      setLoading(false)
    }
  }, [courseId, token, navigate, dispatch, calculateTotalLectures, resetCourseState, currentCourseData])

  useEffect(() => {
    fetchCourseDetails()
  }, [fetchCourseDetails])


  // Memoized sidebar handling for small devices
  const { courseViewSidebar } = useSelector(state => state.sidebar)
  const [screenSize, setScreenSize] = useState(window.innerWidth)

  // Optimized resize handler with RAF for better performance
  useEffect(() => {
    let rafId;
    let lastWidth = window.innerWidth;

    const handleScreenSize = () => {
      rafId = requestAnimationFrame(() => {
        const currentWidth = window.innerWidth;
        // Only update if width actually changed
        if (currentWidth !== lastWidth) {
          lastWidth = currentWidth;
          setScreenSize(currentWidth);
        }
      });
    };

    window.addEventListener('resize', handleScreenSize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScreenSize);
    };
  }, []);

  // Memoized sidebar visibility update
  const updateSidebarVisibility = useCallback(() => {
    dispatch(setCourseViewSidebar(screenSize > 640));
  }, [screenSize, dispatch]);

  useEffect(() => {
    updateSidebarVisibility();
  }, [updateSidebarVisibility])

  // Memoized components
  const SidebarComponent = useMemo(() => (
    courseViewSidebar && (
      <div className="w-[320px]">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
      </div>
    )
  ), [courseViewSidebar, setReviewModal]);

  const MainContent = useMemo(() => (
    <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto mt-14">
      <div className="mx-6">
        <Outlet />
      </div>
    </div>
  ), []);

  const ReviewModalComponent = useMemo(() => (
    reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />
  ), [reviewModal, setReviewModal]);

  // Loading state with optimized animation
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50 will-change-transform"></div>
      </div>
    )
  }

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        {SidebarComponent}
        {MainContent}
      </div>
      {ReviewModalComponent}
    </>
  )
}
