import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="relative border border-richblack-600 text-richblack-300 rounded-xl p-7 lg:p-14 flex gap-3 flex-col overflow-hidden">
      {/* Contact Form Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-richblack-800/90 via-richblack-700/80 to-richblack-900/90 backdrop-blur-sm rounded-xl"></div>
      
      {/* Animated gradient orbs for form */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-r from-green-500/15 to-blue-500/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-4xl leading-10 font-semibold text-richblack-5">
          Got a Idea? We&apos;ve got the skills. Let&apos;s team up
        </h1>
        <p className="">
          Tell us more about yourself and what you&apos;re got in mind.
        </p>

        <div className="mt-7">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
