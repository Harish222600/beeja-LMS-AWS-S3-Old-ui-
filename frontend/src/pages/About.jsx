import React from "react"
import { motion } from 'framer-motion'
import BackgroundEffect from "./BackgroundEffect"
import FoundingStory from "../assets/Images/FoundingStory.png"
import BannerImage1 from "../assets/Images/aboutus1.webp"
import BannerImage2 from "../assets/Images/aboutus2.webp"
import BannerImage3 from "../assets/Images/aboutus3.webp"

import ImprovedFooter from "../components/common/ImprovedFooter"
// import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"

import HighlightText from "../components/core/HomePage/HighlightText"
import Img from "../components/common/Img"
import ReviewSlider from './../components/common/ReviewSlider';
import { fadeIn } from "../components/common/motionFrameVarients"
import TeamCard from "./Card/components/TeamCard"
import FAQSection from "../components/core/AboutPage/Faqs"
// import BenefitsForEmployers from "../components/core/AboutPage/BenefitsForEmployers"

const About = () => {
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

      <div className="relative z-10">
      <section className="bg-richblack-700/50 backdrop-blur-sm">
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-white">
          <motion.header
            className="mx-auto py-20 text-4xl font-semibold lg:w-[70%]"
          >
            <motion.p
              variants={fadeIn('down', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
            > Empowering Minds Through <br />
              <HighlightText text={"Technology and Community"} />
            </motion.p>

            <motion.p
              variants={fadeIn('up', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
              className="mx-auto mt-3 text-center text-base font-medium text-richblack-300 lg:w-[95%]">
              BeejaAcademy is at the forefront of driving innovation in online
              education. We're passionate about creating a brighter future by
              offering cutting-edge courses, leveraging emerging technologies,
              and nurturing a vibrant learning community.
            </motion.p>
          </motion.header>

          <div className="sm:h-[70px] lg:h-[150px]"></div>

          <div className=" absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-5">
            <Img src={BannerImage1} alt="" />
            <Img src={BannerImage2} alt="" />
            <Img src={BannerImage3} alt="" />
          </div>
        </div>
      </section>

      <section className="border-b border-richblack-700">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="h-[100px] "></div>
          <Quote />
        </div>
      </section>

      <section>
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="flex flex-col items-center gap-10 lg:flex-row justify-between">
            <motion.div
              variants={fadeIn('right', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
              className="my-24 flex lg:w-[50%] flex-col gap-10">
              <h1 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%] ">
                Smart Learning. Bright Earning. Your Future, Online
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                1. Smart Learning: Embrace online education for personalized, accessible, and interactive
                learning experiences. Unlock knowledge from anywhere, anytime.
              </p>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                2. Bright Earning: Seize online opportunities for career growth and financial success. Acquire
                skills, build expertise, and open doors to a prosperous future with flexible, online learning
                pathways.
              </p>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                Embrace Smart Learning, Bright Earning: Go Online! Elevate your skills with flexible, accessible
                courses. Unleash your potential, shape a brighter future, and open doors to rewarding
                opportunities in the digital era.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn('left', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
            >
              <Img
                src={FoundingStory}
                alt="FoundingStory"
                className="shadow-[0_0_20px_0] shadow-[#FC6767]"
              />
            </motion.div>
          </div>

          <div>
            <motion.div
              variants={fadeIn('right', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
              className='text-center text-3xl lg:text-4xl font-semibold mt-7'
              style={{color:'white'}}
            >
              What Our Says
              <HighlightText text={"Students "} />
              Says
            </motion.div>
            <motion.div
              variants={fadeIn('left', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
            >
              <TeamCard />

            </motion.div>
            <div style={{ height: '.5px', backgroundColor: 'gray', width: '100%' }} />
          </div>

          {/* Benefits for Employers Section */}
          {/* <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
          >
            <BenefitsForEmployers />
          </motion.div> */}

          <div className="flex flex-col items-center lg:gap-10 lg:flex-row justify-between">
            <div className="my-24 flex lg:w-[40%] flex-col gap-10">
              <h1 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%] ">
                Our Vision
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                At Beeja, we aspire to ignite a lifelong passion for learning by providing transformative, accessible, and personalized educational experiences. Through our innovative platform, we empower learners to unlock their potential, adapt to the evolving digital landscape, and shape a brighter future. We cultivate a community that values curiosity, growth, and continuous improvement. We aim to make meaningful learning a part of everyday life
              </p>
            </div>

            <div className="my-24 flex lg:w-[40%] flex-col gap-10">
              <h1 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text text-4xl font-semibold lg:w-[70%] ">
                Our Mission
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                At Beeja Academy, we are dedicated to fostering a culture of continuous learning.
                Our mission is to empower individuals by providing accessible,
                high-quality education that evolves with the ever-changing demands of the industry.
                Through innovative teaching methods, real-world projects, and a supportive community,
                we aim to transform learners into industry-ready professionals equipped with the skills and
                confidence to excel in their careers.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <FAQSection />

      <section className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white">
        <LearningGrid />

      </section>

      {/* Reviws from Other Learner */}
      <div className=" my-20 px-5 text-white ">
        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>

      {/* footer */}
      <ImprovedFooter />
      </div>
    </>
  )
}

export default About