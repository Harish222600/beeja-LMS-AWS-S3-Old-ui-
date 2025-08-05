import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  courseSectionData: [],
  courseEntireData: [],
  completedLectures: [],
  completedQuizzes: [],
  passedQuizzes: [],
  totalNoOfLectures: 0,
}

const viewCourseSlice = createSlice({
  name: "viewCourse",
  initialState,
  reducers: {
    setCourseSectionData: (state, action) => {
      state.courseSectionData = action.payload
    },
    setEntireCourseData: (state, action) => {
      state.courseEntireData = action.payload
    },
    setTotalNoOfLectures: (state, action) => {
      state.totalNoOfLectures = action.payload
    },
    setCompletedLectures: (state, action) => {
      state.completedLectures = action.payload
    },
    updateCompletedLectures: (state, action) => {
      state.completedLectures = [...state.completedLectures, action.payload]
    },
    setCompletedQuizzes: (state, action) => {
      state.completedQuizzes = action.payload
    },
    updateCompletedQuizzes: (state, action) => {
      state.completedQuizzes = [...state.completedQuizzes, action.payload]
    },
    setPassedQuizzes: (state, action) => {
      state.passedQuizzes = action.payload
    },
    updatePassedQuizzes: (state, action) => {
      state.passedQuizzes = [...state.passedQuizzes, action.payload]
    },
  },
})

export const {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
  setCompletedQuizzes,
  updateCompletedQuizzes,
  setPassedQuizzes,
  updatePassedQuizzes,
} = viewCourseSlice.actions

export default viewCourseSlice.reducer