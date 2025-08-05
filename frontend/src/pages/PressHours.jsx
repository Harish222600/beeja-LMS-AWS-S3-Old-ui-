import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const PressHours = () => {
  const pressReleases = [
    {
      date: "March 15, 2024",
      title: "Beeja Academy Launches New AI and Machine Learning Track",
      content: "Expanding our curriculum to meet industry demands with cutting-edge AI courses.",
    },
    {
      date: "February 28, 2024",
      title: "Partnership Announcement with Leading Tech Companies",
      content: "Strategic collaborations to enhance job placement opportunities for our graduates.",
    },
    {
      date: "January 10, 2024",
      title: "Beeja Academy Reaches 100,000 Student Milestone",
      content: "Celebrating our growing community of learners and their success stories.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Press Section */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Press Room</h1>
            
            <section className="space-y-4">
              <p className="text-richblack-100">
                Welcome to Beeja Academy's Press Room. Find the latest news, press releases, 
                and media resources about our mission to transform education.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-richblack-50">Latest Press Releases</h2>
              <div className="space-y-6">
                {pressReleases.map((press, index) => (
                  <div key={index} className="bg-richblack-800 p-6 rounded-lg">
                    <p className="text-yellow-50 text-sm mb-2">{press.date}</p>
                    <h3 className="text-xl font-semibold text-richblack-50 mb-3">{press.title}</h3>
                    <p className="text-richblack-100">{press.content}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-richblack-50">Media Contact</h2>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <p className="text-richblack-100">
                  For media inquiries, please contact:<br />
                  <span className="text-yellow-50">press@beejaacademy.com</span>
                </p>
              </div>
            </section>
          </div>

          {/* Hours Section */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Hours & Availability</h1>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-richblack-50">Support Hours</h2>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-richblack-100">Monday - Friday:</span>
                    <span className="text-richblack-50">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-richblack-100">Saturday:</span>
                    <span className="text-richblack-50">10:00 AM - 2:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-richblack-100">Sunday:</span>
                    <span className="text-richblack-50">Closed</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-richblack-50">Live Support</h2>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <p className="text-richblack-100 mb-4">
                  Our live chat support is available during business hours. For urgent inquiries 
                  outside of these hours, please email support@beejaacademy.com
                </p>
                <div className="space-y-2">
                  <p className="text-richblack-100">
                    <strong>Technical Support:</strong>{" "}
                    <span className="text-yellow-50">support@beejaacademy.com</span>
                  </p>
                  <p className="text-richblack-100">
                    <strong>Course Inquiries:</strong>{" "}
                    <span className="text-yellow-50">courses@beejaacademy.com</span>
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-richblack-50">Holiday Schedule</h2>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <p className="text-richblack-100 mb-4">
                  We observe major national holidays. During these times, support response 
                  may be delayed. Check our social media channels for specific holiday closure announcements.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default PressHours;
