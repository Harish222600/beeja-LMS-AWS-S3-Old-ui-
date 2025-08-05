import React from "react";
import FAQSection from "../components/core/AboutPage/Faqs";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Faqs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="flex-grow">
        <div className="pt-12">
          <FAQSection />
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Faqs;
