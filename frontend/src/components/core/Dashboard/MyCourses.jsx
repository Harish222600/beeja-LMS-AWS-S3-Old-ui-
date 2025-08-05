import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../common/IconBtn"
import CoursesTable from "./InstructorCourses/CoursesTable"



export default function MyCourses() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const result = await fetchInstructorCourses(token, user?.accountType)
      console.log('Instructors all courses  ', result);
      setLoading(false);
      if (result) {
        setCourses(result)
      }
    }
    fetchCourses()
  }, [])


  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-14 flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
        <h1 className="text-2xl md:text-4xl font-medium text-richblack-5 font-boogaloo text-center md:text-left">
          My Courses
        </h1>
      </div>
      {/* course Table */}
      <div className="w-full overflow-x-auto">
        {courses && <CoursesTable courses={courses} setCourses={setCourses} loading={loading} setLoading={setLoading} />}
      </div>
    </div>
  )
}