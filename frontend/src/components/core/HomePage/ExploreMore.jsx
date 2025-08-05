import React, { useState } from "react";
import { HomePageExplore } from "../../../../data/homepage-explore";
import CourseCard from "./CourseCard";
import HighlightText from "./HighlightText";

const tabsName = [
  "Free",
  "New to coding",
  "Most popular",
  "Skills paths",
  "Career paths",
];


const ExploreMore = () => {
  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  const [currentCard, setCurrentCard] = useState(
    HomePageExplore[0].courses[0].heading
  );

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.filter((course) => course.tag === value);
    setCourses(result[0].courses);
    setCurrentCard(result[0].courses[0].heading);
  };

  return (
    <div className="w-full py-8 relative">
      {/* Explore more section */}
      <div className="mb-8 px-4">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center mb-4">
          Unlock the
          <HighlightText text={" Power of Code"} />
        </div>
        <p className="text-center text-richblack-300 text-sm sm:text-base lg:text-lg font-semibold">
          Learn to Build Anything You Can Imagine
        </p>
      </div>

      {/* Tabs Section */}
      <div className="mb-10 px-4">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 lg:gap-5 mx-auto max-w-4xl bg-richblack-800 text-richblack-200 p-1 sm:p-2 lg:p-1 rounded-full font-medium drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] overflow-x-auto">
          {tabsName.map((ele, index) => {
            return (
              <div
                className={`text-xs sm:text-sm lg:text-[16px] flex flex-row items-center gap-1 sm:gap-2 whitespace-nowrap ${currentTab === ele
                  ? "bg-richblack-900 text-richblack-5 font-medium shadow-lg"
                  : "text-richblack-200 hover:text-richblack-100"
                  } px-2 sm:px-4 lg:px-7 py-1.5 sm:py-2 lg:py-[7px] rounded-full transition-all duration-200 cursor-pointer hover:bg-richblack-900 hover:text-richblack-5 hover:shadow-md`}
                key={index}
                onClick={() => setMyCards(ele)}
              >
                {ele}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full text-black px-4 max-w-7xl mx-auto">
        {courses.map((ele, index) => {
          return (
            <CourseCard
              key={index}
              cardData={ele}
              currentCard={currentCard}
              setCurrentCard={setCurrentCard}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ExploreMore;
