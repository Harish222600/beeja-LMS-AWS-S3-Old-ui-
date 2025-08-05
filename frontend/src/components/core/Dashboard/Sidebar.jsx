import { useEffect, useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from './../../../../data/dashboard-links';
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"
import SidebarLink from "./SidebarLink"
import Loading from './../../common/Loading';

import { HiMenuAlt1 } from 'react-icons/hi'
import { IoMdClose } from 'react-icons/io'
import { FiSettings } from 'react-icons/fi'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'

import { setOpenSideMenu, setScreenSize, toggleSidebarCollapse } from "../../../slices/sidebarSlice";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [confirmationModal, setConfirmationModal] = useState(null)
  const { openSideMenu, screenSize, isCollapsed } = useSelector((state) => state.sidebar)

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth))
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (screenSize <= 640) {
      dispatch(setOpenSideMenu(false))
    }
    else dispatch(setOpenSideMenu(true))
  }, [screenSize])

  if (profileLoading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] min-w-[200px] items-center justify-center bg-[#2d2d2d] border-r border-[#404040]">
        <div className="relative">
          <div className="w-6 h-6 border-2 border-[#404040] border-t-[#666666] rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="sm:hidden fixed top-16 left-2 z-[60]">
        <button 
          onClick={() => dispatch(setOpenSideMenu(!openSideMenu))}
          className="p-2 rounded-lg bg-[#2d2d2d] border border-[#404040] text-white hover:bg-[#404040] transition-colors duration-200 shadow-lg"
        >
          {openSideMenu ? <IoMdClose size={18} /> : <HiMenuAlt1 size={18} />}
        </button>
      </div>

      {/* Sidebar */}
      {openSideMenu && (
        <>
          {/* Mobile Overlay */}
          {screenSize <= 640 && (
            <div 
              className="fixed inset-0 bg-black/50 z-[45] sm:hidden"
              onClick={() => dispatch(setOpenSideMenu(false))}
            />
          )}
          
          <div className={`fixed sm:relative h-[100vh] ${
            isCollapsed ? 'w-[56px]' : 'w-[280px] xs:w-[260px] sm:w-[200px]'
          } flex flex-col bg-[#2d2d2d] border-r border-[#404040] transition-all duration-300 z-50 shadow-xl`}>
            {/* Collapse/Expand Button - Desktop Only */}
            {screenSize > 640 && (
              <div className="absolute -right-2 top-20 z-[1001]">
                <button
                  onClick={() => dispatch(toggleSidebarCollapse())}
                  className="w-6 h-6 bg-[#404040] border border-[#666666] rounded-full flex items-center justify-center text-[#cccccc] hover:text-white hover:bg-[#4d4d4d] transition-colors duration-200"
                >
                  {isCollapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowLeft size={14} />}
                </button>
              </div>
            )}

            {/* Top Spacer */}
            <div className="h-16 sm:h-0 flex-shrink-0"></div>

            {/* User Profile Section */}
            <div className={`${isCollapsed ? 'p-2' : 'px-3 py-2'} border-b border-[#404040] transition-all duration-300 flex-shrink-0`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative">
                  <img
                    src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#666666] xs:w-7 xs:h-7"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2d2d2d]"></div>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-xs truncate">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-[#cccccc] text-xs truncate capitalize">
                      {user?.accountType}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links - Scrollable Container */}
            <div className="flex-1 overflow-hidden">
              <div className={`h-full py-2 ${isCollapsed ? 'px-1' : 'px-2'} overflow-y-auto scrollbar-thin scrollbar-track-[#2d2d2d] scrollbar-thumb-[#404040] hover:scrollbar-thumb-[#4d4d4d] scrollbar-thumb-rounded-full scrollbar-track-rounded-full`}>
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                    if (link.type && user?.accountType !== link.type) return null
                    return (
                      <SidebarLink key={link.id} link={link} iconName={link.icon} isCollapsed={isCollapsed} />
                    )
                  })}
                </nav>

                {/* Divider */}
                <div className="my-3 h-px bg-[#404040]" />

                {/* Settings & Logout */}
                <div className="space-y-1">
                  <SidebarLink
                    link={{ name: "Settings", path: "/dashboard/settings" }}
                    iconName={"VscSettingsGear"}
                    isCollapsed={isCollapsed}
                  />

                  <button
                    onClick={() =>
                      setConfirmationModal({
                        text1: "Are you sure?",
                        text2: "You will be logged out of your account.",
                        btn1Text: "Logout",
                        btn2Text: "Cancel",
                        btn1Handler: () => dispatch(logout(navigate)),
                        btn2Handler: () => setConfirmationModal(null),
                      })
                    }
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-2 px-3'} py-2 text-[#cccccc] hover:text-white hover:bg-[#404040] rounded transition-colors duration-200 group`}
                    title={isCollapsed ? "Logout" : ""}
                  >
                    <VscSignOut className="text-sm group-hover:text-red-400 transition-colors duration-200" />
                    {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                  </button>
                </div>

                {/* Footer */}
                {!isCollapsed && (
                  <div className="mt-4 pt-2 border-t border-[#404040]">
                    <div className="text-center">
                      <p className="text-xs text-[#999999]">
                        © 2024 Beeja
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} closeModal={() => setConfirmationModal(null)} />}
    </>
  )
}
