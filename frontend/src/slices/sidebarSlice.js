import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    openSideMenu: false,
    screenSize: undefined,
    isCollapsed: false,  // New state for sidebar collapse

    // course view side bar
    courseViewSidebar: false,
}

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        setOpenSideMenu: (state, action) => {
            // console.log('action.payload == ', action.payload)
            state.openSideMenu = action.payload
        },
        setScreenSize: (state, action) => {
            state.screenSize = action.payload
        },
        setCourseViewSidebar: (state, action) => {
            state.courseViewSidebar = action.payload
        },
        toggleSidebarCollapse: (state) => {
            state.isCollapsed = !state.isCollapsed
        }

    }
})

export const { setOpenSideMenu, setScreenSize, setCourseViewSidebar, toggleSidebarCollapse } = sidebarSlice.actions

export default sidebarSlice.reducer



