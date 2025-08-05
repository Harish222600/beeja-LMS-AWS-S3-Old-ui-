import React, { useCallback, useEffect, useState } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../services/operations/authAPI";
import { useProfileImage } from "../../hooks/useProfileImage";

import { NavbarLinks } from "../../../data/navbar-links";
import beejaLogo from "/beejalogo.png";
import { fetchCourseCategories } from "./../../services/operations/courseDetailsAPI";

import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import * as Icons from "react-icons/fa";
import NotificationPanel from "./NotificationPanel";

const ModernNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user, imageUrl } = useProfileImage();
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNavbar, setShowNavbar] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [catalogDropdownOpen, setCatalogDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const fetchSublinks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchCourseCategories()
      setSubLinks(res)
    } catch (error) {
      console.log("Could not fetch the category list = ", error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSublinks();
  }, [fetchSublinks]);

  // Listen for category updates
  useEffect(() => {
    const handleCategoriesUpdate = (event) => {
      setSubLinks(event.detail);
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
    };
  }, []);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  const controlNavbar = useCallback(() => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY) setShowNavbar("hide");
      else setShowNavbar("show");
    } else setShowNavbar("top");
    setLastScrollY(window.scrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [controlNavbar]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown-container')) {
        console.log('Clicking outside profile dropdown, closing it');
        setProfileDropdownOpen(false);
      }
      if (catalogDropdownOpen && !event.target.closest('.catalog-dropdown-container')) {
        setCatalogDropdownOpen(false);
      }
      if (servicesDropdownOpen && !event.target.closest('.services-dropdown-container')) {
        setServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, catalogDropdownOpen, servicesDropdownOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/signup");
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 z-[100] w-full flex items-center justify-center transition-all duration-500 ease-in-out ${
        showNavbar === "hide" ? "-translate-y-full" : 
        showNavbar === "show" ? "" : 
        "translate-y-0"
      }`}
    >
      <motion.div 
        className="w-full xs:w-[98%] sm:w-[95%] lg:w-[90%] max-w-[1000px] mx-auto xs:rounded-lg sm:rounded-xl lg:rounded-[20px] bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-fuchsia-500/20 backdrop-blur-2xl shadow-2xl flex items-center justify-between px-2 xs:px-3 sm:px-4 lg:px-6 py-2 xs:py-2.5 sm:py-3 text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 50%, rgba(217,70,239,0.2) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: '0 20px 50px -15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
        whileHover={{ 
          boxShadow: "0 25px 60px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          background: "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.25) 50%, rgba(217,70,239,0.25) 100%)",
          scale: 1.005
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <Link to="/" aria-label="Home" className="flex items-center gap-1 xs:gap-2">
            <img
              src={beejaLogo}
              width={40}
              height={12}
              loading="lazy"
              alt="Beeja Logo"
              className="w-[24px] xs:w-[28px] sm:w-[32px] md:w-[36px] lg:w-[40px] h-auto transition-all duration-300 hover:brightness-110"
            />
            <span className="text-white font-medium text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wide hidden xs:block">
              Beeja Academy
            </span>
          </Link>
        </motion.div>

        {/* Mobile Right Section - Profile + Menu */}
        <div className="lg:hidden flex items-center gap-1 xs:gap-1.5 sm:gap-2">
          {/* Mobile Profile Picture */}
          {token && user && (
            <motion.div 
              className="relative flex items-center gap-1 xs:gap-1.5 profile-dropdown-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <NotificationPanel />
              <div
                className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 rounded-full cursor-pointer border border-transparent hover:border-emerald-400 transition-all duration-300 overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Mobile profile clicked, current state:', profileDropdownOpen);
                  const newState = !profileDropdownOpen;
                  console.log('Setting mobile profile dropdown to:', newState);
                  setProfileDropdownOpen(newState);
                }}
                title={`${user.firstName} ${user.lastName}`}
              >
                <img
                  src={imageUrl || user?.image}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Mobile Profile Dropdown */}
              <motion.div 
                className={`absolute right-0 top-full z-[999] flex w-[160px] xs:w-[180px] mt-1 flex-col rounded-lg bg-white backdrop-blur-xl p-2 xs:p-3 text-richblack-900 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 transition-all duration-300 ${
                  profileDropdownOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
                }`}
                initial={false}
                animate={{ 
                  scale: profileDropdownOpen ? 1 : 0.8, 
                  opacity: profileDropdownOpen ? 1 : 0,
                  y: profileDropdownOpen ? 0 : -10
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute right-2 xs:right-4 top-0 h-2 w-2 xs:h-3 xs:w-3 rotate-45 translate-y-[-50%] select-none rounded bg-white"></div>
                <motion.div whileHover={{ x: 3, backgroundColor: "rgba(0,0,0,0.05)" }}>
                  <Link 
                    to="/dashboard/my-profile" 
                    className="rounded-lg py-1.5 xs:py-2 px-2 xs:px-3 hover:bg-richblack-50 block text-xs xs:text-sm font-medium transition-all duration-200"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                </motion.div>
                {user.accountType === "Admin" && (
                  <motion.div whileHover={{ x: 3, backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <Link 
                      to="/admin" 
                      className="rounded-lg py-1.5 xs:py-2 px-2 xs:px-3 hover:bg-richblack-50 block text-xs xs:text-sm font-medium transition-all duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </motion.div>
                )}
                <motion.button 
                  onClick={() => {
                    dispatch(logout(navigate));
                    setProfileDropdownOpen(false);
                  }} 
                  className="rounded-lg py-1.5 xs:py-2 px-2 xs:px-3 hover:bg-richblack-50 text-left text-xs xs:text-sm font-medium transition-all duration-200"
                  whileHover={{ x: 3, backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                  Logout
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Hamburger menu button */}
          <motion.button
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="flex flex-col h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 justify-between items-center group relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="h-0.5 w-full bg-white rounded-lg origin-center"
              animate={{
                rotate: mobileMenuOpen ? 45 : 0,
                y: mobileMenuOpen ? 4 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.span
              className="h-0.5 w-full bg-white rounded-lg"
              animate={{
                opacity: mobileMenuOpen ? 0 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.span
              className="h-0.5 w-full bg-white rounded-lg origin-center"
              animate={{
                rotate: mobileMenuOpen ? -45 : 0,
                y: mobileMenuOpen ? -4 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.button>
        </div>

        {/* Nav Links - visible for only large devices */}
        <motion.ul 
          className="hidden lg:flex items-center gap-x-4 text-richblack-25"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {NavbarLinks.map((link, index) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {link.title === "Catalog" ? (
                <div
                  className={`relative flex cursor-pointer items-center gap-1 transition-all duration-300 hover:scale-105 catalog-dropdown-container ${
                    matchRoute("/catalog/:catalogName")
                      ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-white rounded-lg p-1.5 px-3 shadow-[0_4px_20px_rgba(20,184,166,0.3)]"
                      : "text-richblack-25 rounded-lg p-1.5 px-3 hover:bg-white/10 hover:backdrop-blur-sm"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCatalogDropdownOpen(!catalogDropdownOpen);
                  }}
                >
                  <p className="text-sm font-medium">{link.title}</p>
                  <motion.div
                    animate={{ rotate: catalogDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MdKeyboardArrowDown size={14} />
                  </motion.div>
                  <motion.div
                    className={`absolute left-0 top-full z-[91] flex w-[180px] mt-2 flex-col rounded-lg bg-white/95 backdrop-blur-xl p-3 text-richblack-900 lg:w-[250px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 ${
                      catalogDropdownOpen ? 'visible opacity-100' : 'invisible opacity-0'
                    }`}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#D1D5DB transparent'
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: catalogDropdownOpen ? 1 : 0.8, 
                      opacity: catalogDropdownOpen ? 1 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setCatalogDropdownOpen(true)}
                    onMouseLeave={() => setCatalogDropdownOpen(false)}
                  >
                    <div className="absolute left-4 top-0 z-[100] h-3 w-3 translate-y-[-50%] rotate-45 select-none rounded bg-white/95"></div>
                    {loading ? (<p className="text-center text-sm">Loading...</p>)
                      : subLinks.length ? (
                        <>
                          {subLinks?.map((subLink, i) => (
                            <motion.div key={i} whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                              <Link
                                to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                                className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50 flex items-center gap-3"
                                transition={{ duration: 0.2 }}
                              >
                                {subLink.icon && Icons[subLink.icon] ? 
                                  React.createElement(Icons[subLink.icon], { className: "w-5 h-5" })
                                  : <Icons.FaBook className="w-5 h-5" />
                                }
                                <p>{subLink.name}</p>
                              </Link>
                            </motion.div>
                          ))}
                          {/* View All Courses Section */}
                          <div className="border-t border-richblack-200 mt-2 pt-2">
                            <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                              <Link
                                to="/courses"
                                className="rounded-lg bg-transparent py-3 pl-4 hover:bg-richblack-50 flex items-center gap-3 text-blue-600 font-medium"
                                transition={{ duration: 0.2 }}
                              >
                                <Icons.FaGraduationCap className="w-5 h-5" />
                                <p>View All Courses</p>
                              </Link>
                            </motion.div>
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-sm">No Courses Found</p>
                      )}
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={link?.path}>
                    <p
                      className={`text-sm font-medium transition-all duration-300 ${
                        matchRoute(link?.path)
                          ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-white rounded-lg p-1.5 px-3 shadow-[0_4px_20px_rgba(20,184,166,0.3)]"
                          : "text-richblack-25 rounded-lg p-1.5 px-3 hover:bg-white/10 hover:backdrop-blur-sm"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                </motion.div>
              )}
            </motion.li>
          ))}

          {/* Free Courses Link */}
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/free-courses">
              <p className={`text-sm font-medium transition-all duration-300 ${
                matchRoute("/free-courses")
                  ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-white rounded-lg p-1.5 px-3 shadow-[0_4px_20px_rgba(20,184,166,0.3)]"
                  : "text-richblack-25 rounded-lg p-1.5 px-3 hover:bg-white/10 hover:backdrop-blur-sm"
              }`}>
                Free Courses
              </p>
            </Link>
          </motion.li>

          {/* Services Dropdown */}
          <motion.li 
            className="relative flex cursor-pointer items-center gap-1 rounded-lg p-1.5 px-3 text-richblack-25 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 services-dropdown-container"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              setServicesDropdownOpen(!servicesDropdownOpen);
            }}
          >
            <span className="text-sm font-medium">Services</span>
            <motion.div
              animate={{ rotate: servicesDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <MdKeyboardArrowDown size={14} />
            </motion.div>
            <motion.div 
              className={`absolute left-0 top-full z-[91] flex w-[180px] mt-2 flex-col rounded-lg bg-white/95 backdrop-blur-xl p-3 text-richblack-900 lg:w-[220px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 ${
                servicesDropdownOpen ? 'visible opacity-100' : 'invisible opacity-0'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: servicesDropdownOpen ? 1 : 0.8, 
                opacity: servicesDropdownOpen ? 1 : 0 
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute left-4 top-0 z-[100] h-3 w-3 translate-y-[-50%] rotate-45 select-none rounded bg-white/95"></div>
              <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                <Link
                  to="/services/institute"
                  className="rounded-lg bg-transparent py-2 px-3 hover:bg-richblack-50 block text-sm font-medium transition-all duration-200"
                >
                  For Institute
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                <Link
                  to="/services/student"
                  className="rounded-lg bg-transparent py-2 px-3 hover:bg-richblack-50 block text-sm font-medium transition-all duration-200"
                >
                  For Student
                </Link>
              </motion.div>
            </motion.div>
          </motion.li>

          {/* Auth Buttons - Show only when user is not logged in */}
          {!token && (
            <>
              <motion.li
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <motion.button 
                  onClick={handleLogin}
                  className="rounded-lg border border-richblack-600 bg-richblack-800/80 backdrop-blur-sm px-3 py-1.5 text-richblack-100 text-sm font-medium transition-all duration-300 hover:bg-richblack-700 hover:border-richblack-500"
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log in
                </motion.button>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <motion.button 
                  onClick={handleSignup}
                  className="rounded-lg bg-gradient-to-r from-teal-400 to-emerald-400 px-3 py-1.5 text-white text-sm font-medium transition-all duration-300 hover:from-teal-300 hover:to-emerald-300 shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 6px 25px rgba(20,184,166,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up
                </motion.button>
              </motion.li>
            </>
          )}

          {/* User Profile Picture with Dropdown */}
          {token && user && (
            <motion.li 
              className="relative ml-3 flex items-center justify-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <NotificationPanel />
              <div className="relative profile-dropdown-container">
                <div
                  className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-emerald-400 transition-all duration-300 overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Desktop profile clicked, current state:', profileDropdownOpen);
                    setMobileMenuOpen(false);
                    const newState = !profileDropdownOpen;
                    console.log('Setting desktop profile dropdown to:', newState);
                    setProfileDropdownOpen(newState);
                  }}
                  title={`${user.firstName} ${user.lastName}`}
                >
                  <img
                    src={imageUrl || user?.image}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Desktop Profile Dropdown Menu */}
                <motion.div 
                  className={`absolute right-0 top-full z-[999] flex w-[180px] mt-2 flex-col rounded-lg bg-white backdrop-blur-xl p-3 text-richblack-900 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 transition-all duration-300 ${
                    profileDropdownOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
                  }`}
                  initial={false}
                  animate={{ 
                    scale: profileDropdownOpen ? 1 : 0.8, 
                    opacity: profileDropdownOpen ? 1 : 0,
                    y: profileDropdownOpen ? 0 : -10
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute right-4 top-0 h-3 w-3 rotate-45 translate-y-[-50%] select-none rounded bg-white"></div>
                  <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <Link 
                      to="/dashboard/my-profile" 
                      className="rounded-lg py-2 px-3 hover:bg-richblack-50 block text-sm font-medium transition-all duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  {user.accountType === "Admin" && (
                    <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                      <Link 
                        to="/admin" 
                        className="rounded-lg py-2 px-3 hover:bg-richblack-50 block text-sm font-medium transition-all duration-200"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    </motion.div>
                  )}
                  <motion.button 
                    onClick={() => {
                      dispatch(logout(navigate));
                      setProfileDropdownOpen(false);
                    }} 
                    className="rounded-lg py-2 px-3 hover:bg-richblack-50 text-left text-sm font-medium transition-all duration-200"
                    whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}
                  >
                    Logout
                  </motion.button>
                </motion.div>
              </div>
            </motion.li>
          )}
        </motion.ul>

        {/* Mobile menu - visible on small devices */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="absolute top-full left-0 right-0 z-[91] mx-0 xs:mx-1 sm:mx-2 mt-0 xs:mt-1 sm:mt-2 xs:rounded-lg sm:rounded-lg bg-richblack-900/95 backdrop-blur-xl p-1.5 xs:p-2 sm:p-3 lg:hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ul className="flex flex-col gap-0.5 xs:gap-1 sm:gap-2 text-white">
                {NavbarLinks.map((link, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {link.title === "Catalog" ? (
                      <details>
                        <summary className="cursor-pointer rounded-lg p-1 xs:p-1.5 sm:p-2 hover:bg-white/10 text-[10px] xs:text-xs sm:text-sm font-medium transition-all duration-300">
                          Catalog
                        </summary>
                        <div className="mt-0.5 xs:mt-1 flex flex-col gap-0.5 xs:gap-1 pl-2 xs:pl-3 max-h-[150px] xs:max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#D1D5DB transparent'
                        }}>
                          {loading ? (
                            <p className="text-sm">Loading...</p>
                          ) : subLinks.length ? (
                            <>
                              {subLinks.map((subLink, i) => (
                                <motion.div
                                  key={i}
                                  whileHover={{ x: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Link
                                    to={`/catalog/${subLink.name
                                      .split(" ")
                                      .join("-")
                                      .toLowerCase()}`}
                                    className="rounded-lg py-1 xs:py-1.5 px-2 hover:bg-white/10 block text-xs xs:text-sm transition-all duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subLink.name}
                                  </Link>
                                </motion.div>
                              ))}
                              {/* View All Courses for Mobile */}
                              <div className="border-t border-white/20 mt-2 pt-2">
                                <motion.div whileHover={{ x: 5 }}>
                                  <Link
                                    to="/courses"
                                    className="rounded-lg py-1 xs:py-1.5 px-2 hover:bg-white/10 block text-xs xs:text-sm transition-all duration-200 text-blue-300 font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    📚 View All Courses
                                  </Link>
                                </motion.div>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm">No Courses Found</p>
                          )}
                        </div>
                      </details>
                    ) : (
                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <Link
                          to={link?.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                        >
                          {link.title}
                        </Link>
                      </motion.div>
                    )}
                  </motion.li>
                ))}

                {/* Free Courses for Mobile */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link
                      to="/free-courses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                    >
                      Free Courses
                    </Link>
                  </motion.div>
                </motion.li>

                {/* Services for Mobile */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <details>
                    <summary className="cursor-pointer rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300">
                      Services
                    </summary>
                    <div className="mt-1 flex flex-col gap-1 pl-3">
                      <motion.div whileHover={{ x: 5 }}>
                        <Link
                          to="/services/institute"
                          className="rounded-lg py-1 xs:py-1.5 px-2 hover:bg-white/10 block text-xs xs:text-sm transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          For Institute
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ x: 5 }}>
                        <Link
                          to="/services/student"
                          className="rounded-lg py-1 xs:py-1.5 px-2 hover:bg-white/10 block text-xs xs:text-sm transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          For Student
                        </Link>
                      </motion.div>
                    </div>
                  </details>
                </motion.li>

                {/* Profile Options for Mobile - Show when logged in */}
                {token && user && (
                  <>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <Link
                          to="/dashboard/my-profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                        >
                          Dashboard
                        </Link>
                      </motion.div>
                    </motion.li>
                    {user.accountType === "Admin" && (
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                          >
                            Admin Dashboard
                          </Link>
                        </motion.div>
                      </motion.li>
                    )}
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                    >
                      <motion.button
                        onClick={() => {
                          dispatch(logout(navigate));
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Logout
                      </motion.button>
                    </motion.li>
                  </>
                )}

                {/* Auth Buttons for Mobile - Show when not logged in */}
                {!token && (
                  <>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <motion.button
                        onClick={handleLogin}
                        className="w-full text-left block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Log in
                      </motion.button>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <motion.button
                        onClick={handleSignup}
                        className="w-full text-left block rounded-lg p-1.5 xs:p-2 hover:bg-white/10 text-xs xs:text-sm font-medium transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Sign up
                      </motion.button>
                    </motion.li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  );
};

export default ModernNavbar;
