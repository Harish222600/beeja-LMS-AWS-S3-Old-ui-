import React from "react"
import { motion } from "framer-motion"

import ImprovedFooter from "../components/common/ImprovedFooter"
import ContactDetails from "../components/core/ContactPage/ContactDetails"
import ContactForm from "../components/core/ContactPage/ContactForm"
import ReviewSlider from './../components/common/ReviewSlider';
import BackgroundEffect from "./BackgroundEffect"



const Contact = () => {
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
      <div className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white lg:flex-row">
        {/* Contact Details */}
        <div className="lg:w-[40%]">
          <ContactDetails />
        </div>

        {/* Contact Form */}
        <div className="lg:w-[60%]">
          <ContactForm />
        </div>
      </div>

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

export default Contact