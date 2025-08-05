import { useEffect, useState, Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// Core components that should be loaded immediately
import Toast from "./components/common/Toast";
import ModernNavbar from "./components/common/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";
import ProtectedRoute from "./components/core/Auth/ProtectedRoute";
import AuthChecker from "./components/common/AuthChecker";
import FaqButton from "./components/common/FaqButton";
import { ACCOUNT_TYPE } from './utils/constants';
import { HiArrowNarrowUp } from "react-icons/hi";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-50"></div>
  </div>
);

// Lazy load all page components
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));

// Public pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Faqs = lazy(() => import("./pages/Faqs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Support = lazy(() => import("./pages/Support"));
const Courses = lazy(() => import("./pages/Courses"));
const FinalDynamicCareers = lazy(() => import("./pages/FinalDynamicCareers"));
const Resources = lazy(() => import("./pages/Resources"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Partnership = lazy(() => import("./pages/Partnership"));
const Business = lazy(() => import("./pages/Business"));
const PressHours = lazy(() => import("./pages/PressHours"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const TestAnalytics = lazy(() => import("./pages/TestAnalytics"));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const Catalog = lazy(() => import('./pages/Catalog'));
const InstituteService = lazy(() => import("./pages/InstituteService"));
const StudentService = lazy(() => import("./pages/StudentService"));
const FreeCourses = lazy(() => import('./components/core/Catalog/FreeCourses'));

// Admin components
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const EnhancedAnalytics = lazy(() => import("./pages/Admin/components/EnhancedAnalytics"));
const CourseCategories = lazy(() => import("./components/core/Dashboard/AddCategory/CourseCategories"));
const BundleAccessRequests = lazy(() => import("./pages/Admin/components/BundleAccessRequests"));
const Coupons = lazy(() => import("./pages/Admin/Coupons"));
const Orders = lazy(() => import("./pages/Admin/components/Orders"));
const StudentProgress = lazy(() => import("./pages/Admin/components/StudentProgress/StudentProgress"));
const AdminChats = lazy(() => import("./pages/Dashboard/AdminChats"));

// Dashboard components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyProfile = lazy(() => import("./components/core/Dashboard/MyProfile"));
const Settings = lazy(() => import("./components/core/Dashboard/Settings/Settings"));
const MyCourses = lazy(() => import('./components/core/Dashboard/MyCourses'));
const EditCourse = lazy(() => import('./components/core/Dashboard/EditCourse/EditCourse'));
const Instructor = lazy(() => import('./components/core/Dashboard/Instructor'));
const Cart = lazy(() => import("./components/core/Dashboard/Cart/Cart"));
const EnrolledCourses = lazy(() => import("./components/core/Dashboard/EnrolledCourses"));
const AddCourse = lazy(() => import("./components/core/Dashboard/AddCourse/AddCourse"));
const AccessRequests = lazy(() => import("./components/core/Dashboard/AccessRequests"));
const PurchaseHistory = lazy(() => import("./components/core/Dashboard/PurchaseHistory/PurchaseHistory"));
const Certificates = lazy(() => import("./pages/Dashboard/Certificates"));
const UserAnalytics = lazy(() => import("./components/core/Dashboard/UserAnalytics"));
const InstructorChats = lazy(() => import("./pages/Dashboard/InstructorChats"));

// Course viewing components
const ViewCourse = lazy(() => import("./pages/ViewCourse"));
const BundleCheckout = lazy(() => import("./pages/BundleCheckout"));
const CourseCheckout = lazy(() => import("./pages/CourseCheckout"));
const VideoDetails = lazy(() => import('./components/core/ViewCourse/VideoDetails'));
const QuizView = lazy(() => import('./components/core/ViewCourse/QuizView'));


function App() {

  const { user } = useSelector((state) => state.profile)

  // Disable right-click, text selection, and drag functionality
  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    const disableTextSelection = (e) => {
      e.preventDefault();
      return false;
    };

    const disableDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const disableKeyboardShortcuts = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
        (e.ctrlKey && e.keyCode === 83) // Ctrl+S
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('selectstart', disableTextSelection);
    document.addEventListener('dragstart', disableDragStart);
    document.addEventListener('keydown', disableKeyboardShortcuts);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('selectstart', disableTextSelection);
      document.removeEventListener('dragstart', disableDragStart);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
    };
  }, []);

  // Scroll to the top of the page when the component mounts
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Go upward arrow - show , unshow
  const [showArrow, setShowArrow] = useState(false);

  const handleArrow = () => {
    if (window.scrollY > 500) {
      setShowArrow(true);
    } else setShowArrow(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleArrow);
    return () => {
      window.removeEventListener("scroll", handleArrow);
    };
  }, [showArrow]);

  return (
    <div className="w-full min-h-screen bg-richblack-900 flex flex-col font-inter pt-12 xs:pt-14 sm:pt-16 md:pt-18 lg:pt-20 overflow-x-hidden">
      <ModernNavbar />
      <Toast />

      {/* go upward arrow */}
      <button
        onClick={() => window.scrollTo(0, 0)}
        className={`bg-yellow-25 hover:bg-yellow-50 hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-50 duration-500 ease-in-out ${
          showArrow ? "bottom-6" : "-bottom-24"
        } `}
      >
        <HiArrowNarrowUp />
      </button>

      {/* FAQ Button */}
      <FaqButton />

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/careers" element={<FinalDynamicCareers />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/business" element={<Business />} />
          <Route path="/press-hours" element={<PressHours />} />
          <Route path="/home" element={<Home />} />
          <Route path="/community-courses" element={<Courses />} />
          <Route path="/services/institute" element={<InstituteService />} />
          <Route path="/services/student" element={<StudentService />} />
          <Route path="catalog/:catalogName" element={<Catalog />} />
          <Route path="free-courses" element={<FreeCourses />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="verify-certificate" element={<VerifyCertificate />} />
          <Route path="verify-certificate/:certificateId" element={<VerifyCertificate />} />
          <Route path="bundle-checkout" element={<BundleCheckout />} />
          <Route path="course-checkout" element={<CourseCheckout />} />

          {/* Open Route - for Only Non Logged in User */}
          <Route
            path="signup" element={
              <OpenRoute>
                <Signup />
              </OpenRoute>
            }
          />

          <Route
            path="login" element={
              <OpenRoute>
                <Login />
              </OpenRoute>
            }
          />

          <Route
            path="forgot-password" element={
              <OpenRoute>
                <ForgotPassword />
              </OpenRoute>
            }
          />

          <Route
            path="verify-email" element={
              <OpenRoute>
                <VerifyEmail />
              </OpenRoute>
            }
          />

          <Route
            path="update-password/:id" element={
              <OpenRoute>
                <UpdatePassword />
              </OpenRoute>
            }
          />




          {/* Protected Route - for Only Logged in User */}
          {/* Dashboard */}
          <Route element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
          >
            <Route path="dashboard/my-profile" element={<MyProfile />} />
            <Route path="dashboard/Settings" element={<Settings />} />

            {/* Route only for Students */}
            {/* cart , EnrolledCourses */}
            {user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="dashboard/cart" element={<Cart />} />
                <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
                <Route path="dashboard/purchase-history" element={<PurchaseHistory />} />
                <Route path="dashboard/access-requests" element={<AccessRequests />} />
                <Route path="dashboard/certificates" element={<Certificates />} />
                <Route path="dashboard/user-analytics" element={<UserAnalytics />} />
              </>
            )}

            {/* Route only for Instructors */}
            {/* add course , MyCourses, EditCourse*/}
            {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="dashboard/instructor" element={<Instructor />} />
                <Route path="dashboard/my-courses" element={<MyCourses />} />
                <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
                <Route path="dashboard/instructor-chats" element={<InstructorChats />} />
              </>
            )}

            {/* Route only for Admin */}
            {user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <>
                <Route path="dashboard/admin/analytics" element={<EnhancedAnalytics />} />
                <Route path="dashboard/admin/categories" element={<CourseCategories />} />
                <Route path="dashboard/admin/bundle-requests" element={<BundleAccessRequests />} />
                <Route path="dashboard/admin/coupons" element={<Coupons />} />
                <Route path="dashboard/admin/orders" element={<Orders />} />
                <Route path="dashboard/admin/student-progress" element={<StudentProgress />} />
                <Route path="dashboard/admin/chats" element={<AdminChats />} />
              </>
            )}
          </Route>

          {/* Admin routes protected */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* For the watching course lectures */}
          <Route
            element={
              <ProtectedRoute>
                <ViewCourse />
              </ProtectedRoute>
            }
          >
            {user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route
                  path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                  element={<VideoDetails />}
                />
                <Route
                  path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId/quiz"
                  element={<QuizView />}
                />
              </>
            )}
          </Route>




          {/* Test Route for Analytics */}
          <Route path="/test-analytics" element={<TestAnalytics />} />

          {/* Page Not Found (404 Page ) */}
          <Route path="*" element={<PageNotFound />} />

        </Routes>
      </Suspense>

      <AuthChecker />
    </div>
  );
}

export default App;
