import * as Icons from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"
import { resetCourseState } from "../../../slices/courseSlice"
import { setOpenSideMenu } from "../../../slices/sidebarSlice"

export default function SidebarLink({ link, iconName, isCollapsed }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()
  const { openSideMenu, screenSize } = useSelector(state => state.sidebar)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleClick = () => {
    dispatch(resetCourseState())
    if (openSideMenu && screenSize <= 640) dispatch(setOpenSideMenu(false))
  }

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={({ isActive }) => `
        group flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-2 px-3'} py-2 rounded transition-colors duration-200 relative
        ${isActive 
          ? 'bg-[#404040] text-white' 
          : 'text-[#cccccc] hover:bg-[#404040] hover:text-white'
        }
      `}
      title={isCollapsed ? link.name : ""}
    >
      {/* Icon */}
      <div className={`
        flex items-center justify-center w-6 h-6
        ${matchRoute(link.path)
          ? 'text-white'
          : 'text-[#cccccc] group-hover:text-white'
        }
        transition-colors duration-200
      `}>
        <Icon className="text-sm" />
      </div>

      {/* Link Text - Hidden when collapsed */}
      {!isCollapsed && (
        <span className="font-medium text-sm">{link.name}</span>
      )}

      {/* Active Indicator */}
      {matchRoute(link.path) && (
        <div className="absolute left-0 w-0.5 h-6 bg-[#666666] rounded-r-full" />
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-[#404040] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {link.name}
        </div>
      )}
    </NavLink>
  )
}
