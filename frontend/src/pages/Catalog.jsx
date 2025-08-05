import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"

// import CourseCard from "../components/Catalog/CourseCard"
// import CourseSlider from "../components/Catalog/CourseSlider"
import ImprovedFooter from "../components/common/ImprovedFooter"
import Course_Card from '../components/core/Catalog/Course_Card'
import Course_Slider from "../components/core/Catalog/Course_Slider"
import BundleCourseSection from "../components/core/Catalog/BundleCourseSection"
import Loading from './../components/common/Loading';
import BackgroundEffect from './BackgroundEffect'

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchCourseCategories } from './../services/operations/courseDetailsAPI';




function Catalog() {

    const { catalogName } = useParams()
    const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null)
    const [categoryId, setCategoryId] = useState("")
    const [loading, setLoading] = useState(false);

    // Fetch All Categories
    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetchCourseCategories();
                const category_id = res.filter(
                    (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
                )[0]._id
                setCategoryId(category_id)
            } catch (error) {
                console.log("Could not fetch Categories.", error)
            }
        })()
    }, [catalogName])


    useEffect(() => {
        if (categoryId) {
            ; (async () => {
                setLoading(true)
                try {
                    const res = await getCatalogPageData(categoryId)
                    setCatalogPageData(res)
                } catch (error) {
                    console.log(error)
                }
                setLoading(false)
            })()
        }
    }, [categoryId])

    // console.log('======================================= ', catalogPageData)
    // console.log('categoryId ==================================== ', categoryId)

    if (loading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <Loading />
            </div>
        )
    }
    if (!loading && !catalogPageData) {
        return (
            <div className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex justify-center items-center mt-[15%] sm:mt-[20%] px-4 text-center">
                No Courses found for selected Category
            </div>)
    }

    // Check if we have valid data but no courses
    if (!loading && catalogPageData && (!catalogPageData.selectedCategory?.courses || catalogPageData.selectedCategory.courses.length === 0)) {
        return (
            <>
                {/* Background with Gradient and Particles */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-0"
                >
                    <BackgroundEffect />
                </motion.div>

                {/* Main Content above background */}
                <div className="relative z-10">
                    {/* Hero Section */}
                    <div className="relative box-content bg-richblack-800 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto flex min-h-[180px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px] max-w-maxContentTab flex-col justify-center gap-3 sm:gap-4 lg:max-w-maxContent">
                        <p className="text-xs sm:text-sm md:text-base text-richblack-300">
                            {`Home / Catalog / `}
                            <span className="text-yellow-25">
                                {catalogPageData?.selectedCategory?.name}
                            </span>
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-richblack-5 leading-tight sm:leading-snug">
                            {catalogPageData?.selectedCategory?.name}
                        </p>
                        <p className="max-w-[600px] sm:max-w-[700px] lg:max-w-[870px] text-sm sm:text-base md:text-lg lg:text-xl text-richblack-200 leading-relaxed sm:leading-relaxed md:leading-loose">
                            {catalogPageData?.selectedCategory?.description}
                        </p>
                        </div>
                    </div>

                    {/* No Courses Message */}
                    <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 lg:max-w-maxContent">
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📚</div>
                            <h2 className="text-2xl font-bold text-richblack-5 mb-4">No Courses Available Yet</h2>
                            <p className="text-richblack-300 mb-6">
                                Courses for this category are coming soon. Please check back later or explore other categories.
                            </p>
                            <button 
                                onClick={() => window.history.back()} 
                                className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-100 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>

                    <ImprovedFooter />
                </div>
            </>
        )
    }



    return (
        <>
            {/* Background with Gradient and Particles */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-0"
            >
                <BackgroundEffect />
            </motion.div>

            {/* Main Content above background */}
            <div className="relative z-10">
                {/* Hero Section */}
                <div className="relative box-content bg-richblack-800 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex min-h-[180px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px] max-w-maxContentTab flex-col justify-center gap-3 sm:gap-4 lg:max-w-maxContent">
                    <p className="text-xs sm:text-sm md:text-base text-richblack-300">
                        {`Home / Catalog / `}
                        <span className="text-yellow-25">
                            {catalogPageData?.selectedCategory?.name}
                        </span>
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-richblack-5 leading-tight sm:leading-snug">
                        {catalogPageData?.selectedCategory?.name}
                    </p>
                    <p className="max-w-[600px] sm:max-w-[700px] lg:max-w-[870px] text-sm sm:text-base md:text-lg lg:text-xl text-richblack-200 leading-relaxed sm:leading-relaxed md:leading-loose">
                        {catalogPageData?.selectedCategory?.description}
                    </p>
                </div>
                </div>

                {/* Section 1 */}
                <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 lg:max-w-maxContent">
                <div 
                    className="section_heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-richblack-5 mb-4 sm:mb-6"
                    
                    data-course-component="true"
                >
                    Courses to get you started
                </div>
                <div 
                    className="my-4 flex border-b border-b-richblack-600 text-sm sm:text-base overflow-x-auto"
                    style={{ opacity: 1, visibility: 'visible', transform: 'none', transition: 'none' }}
                    data-course-component="true"
                >
                    <p
                        className={`px-3 sm:px-4 py-2 whitespace-nowrap text-sm sm:text-base ${active === 1
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer hover:text-yellow-50`}
                        onClick={() => setActive(1)}
                        style={{ opacity: 1, visibility: 'visible', transform: 'none', transition: 'color 0.2s ease' }}
                    >
                        Most Popular
                    </p>
                    <p
                        className={`px-3 sm:px-4 py-2 whitespace-nowrap text-sm sm:text-base ${active === 2
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer hover:text-yellow-50`}
                        onClick={() => setActive(2)}
                        style={{ opacity: 1, visibility: 'visible', transform: 'none', transition: 'color 0.2s ease' }}
                    >
                        New
                    </p>
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.selectedCategory?.courses}
                    />
                </div>
                </div>

                {/* Section 2 */}
                <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 lg:max-w-maxContent">
                <div 
                    className="section_heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-richblack-5 mb-4 sm:mb-6"
                    style={{ opacity: 1, visibility: 'visible', transform: 'none', transition: 'none' }}
                    data-course-component="true"
                >
                    Top courses in {catalogPageData?.differentCategory?.name}
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.differentCategory?.courses}
                    />
                </div>
                </div>

                {/* Bundle Course Section */}
                <BundleCourseSection courses={catalogPageData?.selectedCategory?.courses} />

                <ImprovedFooter />
            </div>
        </>
    )
}

export default Catalog
