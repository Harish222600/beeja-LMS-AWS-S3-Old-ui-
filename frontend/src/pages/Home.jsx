
import React, { useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';

import "./css style/home.css"

import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from "../components/core/HomePage/Button";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import TimelineSection from '../components/core/HomePage/TimelineSection';
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection';
import InstructorSection from '../components/core/HomePage/InstructorSection';
import ImprovedFooter from '../components/common/ImprovedFooter';
import ExploreMore from '../components/core/HomePage/ExploreMore';
import ReviewSlider from '../components/common/ReviewSlider';
import FeaturedCourses from '../components/core/HomePage/FeaturedCourses';

import TeamSlider from '../components/core/HomePage/TeamSlider';
import SplitScreen from '../components/core/HomePage/SplitScreen';

import { MdOutlineRateReview } from 'react-icons/md';
import { FaArrowRight } from "react-icons/fa";

import { motion } from 'framer-motion';
import { fadeIn, scaleUp, bounce } from './../components/common/motionFrameVarients';

import BackgroundEffect from './BackgroundEffect';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const dispatch = useDispatch();

  const learnerRef1 = useRef(null);
  const learnerRef2 = useRef(null);
  const learnerRef3 = useRef(null);

  const animateCount = (ref) => {
    if (!ref.current) return;
    let count = 0;
    const target = parseInt(ref.current.getAttribute('data-target'));
    const speed = 130; // Adjust speed as needed

    const updateCount = () => {
      const increment = Math.ceil(target / speed);
      count += increment;
      if (count > target) count = target;
      ref.current.innerText = count;
      if (count < target) {
        requestAnimationFrame(updateCount);
      }
    };

    updateCount();
  };

  useEffect(() => {
    animateCount(learnerRef1);
    animateCount(learnerRef2);
    animateCount(learnerRef3);
  }, []);



  return (
    <React.Fragment>
      {/* Background with Gradient and Particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-0"
      >
        <BackgroundEffect />
      </motion.div>

      {/* Main Content above background */}
      <div className="relative z-10">
        {/* Section 1 */}
        <div id='home-welcome' className='relative min-h-[300px] xs:min-h-[350px] sm:min-h-[400px] justify-center mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white px-3 xs:px-4 py-4 xs:py-6 sm:py-8 md:py-12'>

          <motion.div
            variants={fadeIn('left', 0.05)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className='text-center text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight xs:leading-snug'
          >
            Welcome to
            <HighlightText text={"Beeja "} />
            Igniting Minds, Transforming Futures
          </motion.div>

          <motion.div
            variants={fadeIn('right', 0.05)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className='mt-3 xs:mt-4 w-full md:w-[90%] text-center text-xs xs:text-sm sm:text-base lg:text-lg font-medium xs:font-bold text-richblack-200 max-w-3xl mx-auto leading-relaxed px-1 xs:px-2'
          >
            Embark on a seamless learning experienced with our state of the art platform. Dive into courses crafted to inspire, challenge, and empower you for success.
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-7 mt-4 xs:mt-6 sm:mt-8 w-full justify-center items-center max-w-xs xs:max-w-md sm:max-w-none'
          >
            <motion.div
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              className='w-full xs:w-full sm:w-auto'
            >
              <CTAButton active={true} linkto={"/signup"}>
                Get Started
              </CTAButton>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              className='w-full xs:w-full sm:w-auto'
            >
              <CTAButton active={false} linkto={"/login"}>
                <span className='flex items-center justify-center gap-2'>
                  Learn More <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-xs sm:text-sm' />
                </span>
              </CTAButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeIn('up', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.2 }}
          className='parent-count-container'
        >
          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='count-container'
          >
            <div className="increase-count">
              <i>
                <FontAwesomeIcon icon={faGraduationCap} />
              </i>
              <div className='num'>
                <div ref={learnerRef1} className="count-num" data-target="25">0</div>
                <div className="count-num">K+</div>
              </div>
              <div className='text'>Active Learners</div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className='count-container'
          >
            <div className="increase-count">
              <i>
                <FontAwesomeIcon icon={faGraduationCap} />
              </i>
              <div className='num'>
                <div ref={learnerRef3} className="count-num" data-target="100">0</div>
                <div className="count-num">+</div>
              </div>
              <div className='text'>Total Courses</div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.15 }}
            className='count-container'
          >
            <div className="increase-count">
              <i>
                <FontAwesomeIcon icon={faGraduationCap} />
              </i>
              <div className='num'>
                <div ref={learnerRef2} className="count-num" data-target="1200">0</div>
                <div className="count-num">+</div>
              </div>
              <div className='text'>Total Students</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Code Blocks */}
        <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between px-3 xs:px-4 sm:px-6 lg:px-0'>
          <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='w-full'
          >
            <CodeBlocks
              position={"lg:flex-row"}
              heading={<div className='text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight xs:leading-snug text-center lg:text-left'>Master Coding with <HighlightText text={"Beeja's Expert-Led "} /> courses</div>}
              subheading={"Elevate your programming skills with Beeja, where hands-on learning meets expert guidance to unlock your full coding potential."}
              ctabtn1={{ btnText: "try it yourself", link: "/login", active: true }}
              ctabtn2={{
                btnText: (
                  <>
                    Learn More <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-1 sm:ml-2 text-xs sm:text-sm" />
                  </>
                ),
                link: "/signup",
                active: false
              }}

              codeblock={`<<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n</head>\n<body>\n<h1><ahref="/">Header</a>\n</h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</a><ahref="three/">Three</a>\n</nav>`}
              codeColor={"text-yellow-25"}
              backgroundGradient={"code-block1-grad"}
            />
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.15)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='w-full'
          >
            <CodeBlocks
              position={"lg:flex-row-reverse"}
              heading={<div className="w-[100%] text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold lg:w-[50%] leading-tight xs:leading-snug text-center lg:text-left">Code Instantly  <HighlightText text={"with Beeja"} /></div>}
              subheading={"Jump right into coding at Beeja, where our interactive lessons get you building real-world projects from the very start."}
              ctabtn1={{ btnText: "Continue Lesson", link: "/signup", active: true }}
              ctabtn2={{ btnText: "Learn More", link: "/signup", active: false }}
              codeColor={"text-white"}
              codeblock={`import React from \"react\";\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
              backgroundGradient={"code-block2-grad"}
            />
          </motion.div>

          {/* Team Slider Section */}
          <motion.div
            variants={fadeIn('up', 0.05)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className='text-center text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-6 xs:mt-8 sm:mt-12 mb-4 xs:mb-6 sm:mb-8 px-3 xs:px-4 leading-tight xs:leading-snug'
          >
            Meet Our Expert
            <HighlightText text={" Team"} />
          </motion.div>
          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className='px-3 xs:px-4 sm:px-6 lg:px-0'
          >
            <TeamSlider />
          </motion.div>

          <div className="w-full py-6 xs:py-8 sm:py-12">
            {/* Section Header */}
            <motion.div
              variants={fadeIn('up', 0.05)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
              className='text-center mb-6 xs:mb-8 sm:mb-12 px-3 xs:px-4'
            >
              <h2 className='text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-3 xs:mb-4 leading-tight xs:leading-snug'>
                Our Technology
                <HighlightText text={" Partner"} />
              </h2>
            </motion.div>

            {/* Split Screen Section */}
            <div className='px-3 xs:px-4 sm:px-6 lg:px-0'>
              <SplitScreen />
            </div>
          </div>


          {/* Featured Courses Section */}
          <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="mx-auto box-content w-full max-w-maxContentTab px-3 xs:px-4 py-4 xs:py-6 sm:py-8 lg:max-w-maxContent overflow-hidden"
          >
            <FeaturedCourses />
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="mb-3 xs:mb-4 px-3 xs:px-4 sm:px-6 lg:px-0"
          >
            <ExploreMore />
          </motion.div>
        </div>

        {/* Section 2 */}
        <div className='bg-pure-greys-5 text-richblack-700 mt-8'>
          

          <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8 mt-[40px] sm:mt-[60px] px-4 sm:px-6 lg:px-0'>
              <motion.div
                variants={fadeIn('right', 0.1)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold w-full lg:w-[45%] text-center lg:text-left leading-tight sm:leading-normal'
              >
                Get the Skills you need for a <HighlightText text={"Job that is in demand"} />
              </motion.div>

              <motion.div
                variants={fadeIn('left', 0.1)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                className='flex flex-col gap-4 sm:gap-6 lg:gap-10 w-full lg:w-[40%] items-center lg:items-start text-center lg:text-left'
              >
                <div className='text-sm sm:text-base lg:text-[16px] leading-relaxed text-richblack-600 max-w-md lg:max-w-none'>
                  The modern BeejaAcademy dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                </div>
                <motion.div
                  whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                  className='w-full sm:w-auto'
                >
                  <CTAButton active={true} linkto={"/signup"}>
                    <div className='flex items-center justify-center gap-2 text-sm sm:text-base'>
                      Learn more <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-xs sm:text-sm' />
                    </div>
                  </CTAButton>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeIn('up', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
            >
              <TimelineSection />
            </motion.div>

            <motion.div
              variants={fadeIn('up', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
            >
              {/* <LearningLanguageSection /> */}
            </motion.div>
          </div>
        </div>

        {/* Section 3 */}
        <div className='mt-6 sm:mt-8 w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-6 bg-richblack-900 text-white px-4 sm:px-6 lg:px-0'>
          <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <InstructorSection />
          </motion.div>

          <motion.h1
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-x-3 px-4 leading-tight"
          >
            <span>Reviews from other learners</span>
            <motion.span
              variants={bounce}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
            >
              <MdOutlineRateReview className='text-yellow-25 text-2xl sm:text-3xl lg:text-4xl' />
            </motion.span>
          </motion.h1>

          <motion.div
            variants={fadeIn('up', 0.15)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='w-full'
          >
            <ReviewSlider />
          </motion.div>
        </div>

        {/* Footer */}
        <ImprovedFooter />
      </div>
    </React.Fragment>
  );
};

export default Home;
