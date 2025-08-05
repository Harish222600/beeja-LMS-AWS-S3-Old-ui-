import { useCallback, useEffect, useState } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../services/operations/authAPI";
import { useProfileImage } from "../../hooks/useProfileImage";

import { NavbarLinks } from "../../../data/navbar-links";
import BeejaLogo from "../../assets/Logo/Logo-Small-Light.png";
import { fetchCourseCategories } from "./../../services/operations/courseDetailsAPI";

import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";

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

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  const [showNavbar, setShowNavbar] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className={`fixed z-[1000] w-full flex items-center justify-center transition-all duration-500 ease-in-out ${
        showNavbar === "hide" ? "-translate-y-full" : 
        showNavbar === "show" ? "translate-y-0.5" : 
        "translate-y-0.5"
      }`}
    >
      <motion.div 
        className="w-[99%] max-w-[1400px] mx-auto rounded-full border border-white/20 bg-gradient-to-r from-richblack-900/90 to-richblack-800/90 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex items-center justify-between px-10 py-2.5 text-white"
        whileHover={{ 
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          scale: 1.01
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <Link to="/" aria-label="Home">
            <img
              src={BeejaLogo}
              width={120}
              height={30}
              loading="lazy"
              alt="BeejaAcademy Logo"
              className="transition-all duration-300 hover:brightness-110"
            />
          </Link>
        </motion.div>

        {/* Hamburger menu button - visible on small screens */}
        <motion.button
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          className="sm:hidden flex flex-col h-6 w-6 justify-between items-center group relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="h-0.5 w-full bg-white rounded-lg origin-center"
            animate={{
              rotate: mobileMenuOpen ? 45 : 0,
              y: mobileMenuOpen ? 6 : 0,
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
              y: mobileMenuOpen ? -6 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </motion.button>

        {/* Nav Links - visible for only large devices */}
        <motion.ul 
          className="hidden sm:flex gap-x-6 text-richblack-25"
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
                  className={`group relative flex cursor-pointer items-center gap-1 transition-all duration-300 hover:scale-105 ${
                    matchRoute("/catalog/:catalogName")
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl p-2 px-4 shadow-lg"
                      : "text-richblack-25 rounded-xl p-2 px-4 hover:bg-white/10 hover:backdrop-blur-sm"
                  }`}
                >
                  <p className="font-medium">{link.title}</p>
                  <motion.div
                    animate={{ rotate: 0 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MdKeyboardArrowDown />
                  </motion.div>
                  <motion.div
                    className="invisible absolute left-[50%] top-[50%] z-[1001] flex w-[200px] translate-x-[-50%] translate-y-[3em] 
                    flex-col rounded-xl bg-white/95 backdrop-blur-xl p-4 text-richblack-900 opacity-0 transition-all duration-300 group-hover:visible 
                    group-hover:translate-y-[2.5em] group-hover:opacity-100 lg:w-[300px] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute left-[50%] top-0 z-[100] h-4 w-4 translate-x-[80%] translate-y-[-50%] rotate-45 select-none rounded bg-white/95"></div>
                    {loading ? (<p className="text-center">Loading...</p>)
                      : subLinks.length ? (
                        <>
                          {subLinks?.map((subLink, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                                className="rounded-lg bg-transparent py-3 pl-4 hover:bg-richblack-50 block transition-all duration-200"
                              >
                                <p className="font-medium">{subLink.name}</p>
                              </Link>
                            </motion.div>
                          ))}
                        </>
                      ) : (
                        <p className="text-center">No Courses Found</p>
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
                      className={`font-medium transition-all duration-300 ${
                        matchRoute(link?.path)
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl p-2 px-4 shadow-lg"
                          : "text-richblack-25 rounded-xl p-2 px-4 hover:bg-white/10 hover:backdrop-blur-sm"
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
              <p className={`font-medium transition-all duration-300 ${
                matchRoute("/free-courses")
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl p-2 px-4 shadow-lg"
                  : "text-richblack-25 rounded-xl p-2 px-4 hover:bg-white/10 hover:backdrop-blur-sm"
              }`}>
                Free Courses
              </p>
            </Link>
          </motion.li>

          {/* Services Dropdown */}
          <motion.li 
            className="relative group flex cursor-pointer items-center gap-1 rounded-xl p-2 px-4 text-richblack-25 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-medium">Services</span>
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <MdKeyboardArrowDown />
            </motion.div>
            <motion.div 
              className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] -translate-x-1/2 translate-y-[3em] flex-col rounded-xl bg-white/95 backdrop-blur-xl p-4 text-richblack-900 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-[2.5em] group-hover:opacity-100 lg:w-[250px] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute left-[50%] top-0 z-[100] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 select-none rounded bg-white/95"></div>
              <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                <Link
                  to="/services/institute"
                  className="rounded-lg bg-transparent py-2 px-3 hover:bg-richblack-50 block font-medium transition-all duration-200"
                >
                  For Institute
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                <Link
                  to="/services/student"
                  className="rounded-lg bg-transparent py-2 px-3 hover:bg-richblack-50 block font-medium transition-all duration-200"
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
                  className="rounded-xl border border-richblack-600 bg-richblack-800/80 backdrop-blur-sm px-4 py-2 text-richblack-100 font-medium transition-all duration-300 hover:bg-richblack-700 hover:border-richblack-500"
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
                  className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 text-richblack-900 font-medium transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400 shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 6px 25px rgba(255,193,7,0.4)" }}
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
              className="relative ml-4 flex items-center group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <motion.img
                src={imageUrl || user?.image}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="h-10 w-10 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-yellow-400 transition-all duration-300"
                title={`${user?.firstName} ${user?.lastName}`}
                whileHover={{ scale: 1.1, borderColor: "#fbbf24" }}
              />
              {/* Dropdown Menu */}
              <motion.div 
                className="invisible absolute right-0 top-[120%] z-[1000] flex w-[200px] flex-col rounded-xl bg-white/95 backdrop-blur-xl p-4 text-richblack-900 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute right-4 top-0 h-4 w-4 rotate-45 translate-y-[-50%] select-none rounded bg-white/95"></div>
                <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                  <Link to="/dashboard/my-profile" className="rounded-lg py-2 px-3 hover:bg-richblack-50 block font-medium transition-all duration-200">
                    Dashboard
                  </Link>
                </motion.div>
                {user.accountType === "Admin" && (
                  <motion.div whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <Link to="/admin" className="rounded-lg py-2 px-3 hover:bg-richblack-50 block font-medium transition-all duration-200">
                      Admin Dashboard
                    </Link>
                  </motion.div>
                )}
                <motion.button 
                  onClick={() => {
                    dispatch(logout(navigate));
                    setMobileMenuOpen(false);
                  }} 
                  className="rounded-lg py-2 px-3 hover:bg-richblack-50 text-left font-medium transition-all duration-200"
                  whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                  Logout
                </motion.button>
              </motion.div>
            </motion.li>
          )}
        </motion.ul>

        {/* Mobile menu - visible on small devices */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="absolute top-16 left-0 z-50 w-full rounded-xl bg-richblack-900/95 backdrop-blur-xl p-4 sm:hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ul className="flex flex-col gap-4 text-white">
                {NavbarLinks.map((link, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {link.title === "Catalog" ? (
                      <details>
                        <summary className="cursor-pointer rounded-xl p-3 hover:bg-white/10 font-medium transition-all duration-300">
                          Catalog
                        </summary>
                        <div className="mt-2 flex flex-col gap-2 pl-4">
                          {loading ? (
                            <p>Loading...</p>
                          ) : subLinks.length ? (
                            subLinks.map((subLink, i) => (
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
                                  className="rounded-lg py-2 px-3 hover:bg-white/10 block transition-all duration-200"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subLink.name}
                                </Link>
                              </motion.div>
                            ))
                          ) : (
                            <p>No Courses Found</p>
                          )}
                        </div>
                      </details>
                    ) : (
                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <Link
                          to={link?.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-xl p-3 hover:bg-white/10 font-medium transition-all duration-300"
                        >
                          {link.title}
                        </Link>
                      </motion.div>
                    )}
                  </motion.li>
                ))}

                {/* Services for Mobile */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <details>
                    <summary className="cursor-pointer rounded-xl p-3 hover:bg-white/10 font-medium transition-all duration-300">
                      Services
                    </summary>
                    <div className="mt-2 flex flex-col gap-2 pl-4">
                      <motion.div whileHover={{ x: 5 }}>
                        <Link
                          to="/services/institute"
                          className="rounded-lg py-2 px-3 hover:bg-white/10 block transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          For Institute
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ x: 5 }}>
                        <Link
                          to="/services/student"
                          className="rounded-lg py-2 px-3 hover:bg-white/10 block transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          For Student
                        </Link>
                      </motion.div>
                    </div>
                  </details>
                </motion.li>

                {/* Auth Buttons for Mobile */}
                {!token && (
                  <>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <motion.button
                        onClick={handleLogin}
                        className="w-full text-left block rounded-xl p-3 hover:bg-white/10 font-medium transition-all duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Log in
                      </motion.button>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <motion.button
                        onClick={handleSignup}
                        className="w-full text-left block rounded-xl p-3 hover:bg-white/10 font-medium transition-all duration-300"
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
