import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

// Import logos from certification images
import adobe from "../assets/Images/certification img/Adobe.png";
import apple from "../assets/Images/certification img/Apple.png";
import autodesk from "../assets/Images/certification img/Autodesk.png";
import cisco from "../assets/Images/certification img/cisco.png";
import scb from "../assets/Images/certification img/CSB-Logo.png";
import esb from "../assets/Images/certification img/ESB.png";
import ic3 from "../assets/Images/certification img/IC3.png";
import intuit from "../assets/Images/certification img/Intuit.png";
import its from "../assets/Images/certification img/ITS-Logo-Stacked.png";
import meta from "../assets/Images/certification img/meta-logo.webp";
import Microsoft from "../assets/Images/certification img/microsoft.webp";
import Project from "../assets/Images/certification img/Project.png";
import Unity from "../assets/Images/certification img/Unity-logo.png";

const partnerLogos = [
  { src: adobe, alt: "Adobe", name: "Adobe" },
  { src: apple, alt: "Apple", name: "Apple" },
  { src: autodesk, alt: "Autodesk", name: "Autodesk" },
  { src: cisco, alt: "Cisco", name: "Cisco" },
  { src: scb, alt: "CSB", name: "CSB" },
  { src: meta, alt: "Meta", name: "Meta" },
  { src: Microsoft, alt: "Microsoft", name: "Microsoft" },
  { src: Project, alt: "Project Management", name: "Project Management" },
  { src: Unity, alt: "Unity", name: "Unity" },
  { src: esb, alt: "ESB", name: "ESB" },
  { src: ic3, alt: "IC3", name: "IC3" },
  { src: its, alt: "ITS", name: "ITS" },
  { src: intuit, alt: "Intuit", name: "Intuit" }
];

const Partnership = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Partnership Opportunities</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              Partner with Beeja Academy to expand your reach and create meaningful impact in the education sector. 
              We collaborate with organizations that share our vision of making quality education accessible to all.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Our Trusted Partners</h2>
            <p className="text-richblack-100 mb-6">
              We're proud to partner with industry leaders who help us deliver world-class education and certifications.
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
              {partnerLogos.map((logo, index) => (
                <div key={index} className="bg-richblack-800 p-4 rounded-lg flex items-center justify-center hover:bg-richblack-700 transition-colors duration-300">
                  <img 
                    src={logo.src} 
                    alt={logo.alt} 
                    className="max-h-12 max-w-full object-contain filter brightness-90 hover:brightness-100 transition-all duration-300"
                    title={logo.name}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Partnership Programs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Corporate Training</h3>
                <ul className="list-disc pl-6 space-y-2 text-richblack-100">
                  <li>Customized learning paths for your employees</li>
                  <li>Bulk enrollment discounts</li>
                  <li>Progress tracking and analytics</li>
                  <li>Dedicated support team</li>
                </ul>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Content Partnership</h3>
                <ul className="list-disc pl-6 space-y-2 text-richblack-100">
                  <li>Co-create courses and learning materials</li>
                  <li>Revenue sharing opportunities</li>
                  <li>Access to our learning platform</li>
                  <li>Marketing collaboration</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Benefits of Partnership</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">🌐 Extended Reach</h3>
                <p className="text-richblack-100">Access our global network of learners and expand your market presence.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">💡 Innovation</h3>
                <p className="text-richblack-100">Stay ahead with cutting-edge educational technology and methodologies.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">📈 Growth</h3>
                <p className="text-richblack-100">Create new revenue streams and business opportunities.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Who We Partner With</h2>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Educational institutions and universities</li>
              <li>Technology companies and startups</li>
              <li>Corporate organizations</li>
              <li>Industry experts and content creators</li>
              <li>Training providers and learning centers</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Get Started</h2>
            <p className="text-richblack-100">
              Interested in partnering with us? Contact our partnership team at{" "}
              <span className="text-yellow-50 font-medium">partnerships@beejaacademy.com</span>{" "}
              to discuss collaboration opportunities. We'll work together to create a partnership 
              program that meets your specific needs and objectives.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Partnership;
