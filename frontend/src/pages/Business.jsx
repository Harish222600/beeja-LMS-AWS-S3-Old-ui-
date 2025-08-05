import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Business = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Beeja for Business</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              Empower your workforce with cutting-edge skills through our comprehensive business solutions. 
              Transform your organization's learning culture and drive innovation with Beeja Academy's 
              enterprise-grade training programs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Enterprise Solutions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">🏢 Corporate Training</h3>
                <ul className="list-disc pl-6 space-y-2 text-richblack-100">
                  <li>Customized learning paths for your industry</li>
                  <li>Skills assessment and gap analysis</li>
                  <li>Progress tracking and reporting</li>
                  <li>Dedicated account management</li>
                </ul>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">📊 Learning Analytics</h3>
                <ul className="list-disc pl-6 space-y-2 text-richblack-100">
                  <li>Real-time learning insights</li>
                  <li>Performance metrics and KPIs</li>
                  <li>ROI measurement tools</li>
                  <li>Custom reporting dashboards</li>
                </ul>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">🎯 Skill Development</h3>
                <ul className="list-disc pl-6 space-y-2 text-richblack-100">
                  <li>Technical and soft skills training</li>
                  <li>Leadership development programs</li>
                  <li>Digital transformation courses</li>
                  <li>Industry-specific certifications</li>
                </ul>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">🔧 Integration Support</h3>
                <ul className="list-disc pl-6 space-y-2 text-richblack-100">
                  <li>LMS integration capabilities</li>
                  <li>Single sign-on (SSO) support</li>
                  <li>API access for custom solutions</li>
                  <li>White-label options available</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Why Choose Beeja for Business?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-richblack-800 p-6 rounded-lg text-center">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Accelerated Growth</h3>
                <p className="text-richblack-100">Fast-track your team's skill development with our proven methodologies.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg text-center">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Cost Effective</h3>
                <p className="text-richblack-100">Reduce training costs while maximizing learning outcomes and ROI.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Targeted Learning</h3>
                <p className="text-richblack-100">Customized content that addresses your specific business challenges.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Success Stories</h2>
            <div className="bg-richblack-800 p-6 rounded-lg">
              <blockquote className="text-richblack-100 italic mb-4">
                "Beeja Academy helped us upskill our entire development team in just 6 months. 
                The customized learning paths and hands-on projects were exactly what we needed 
                to stay competitive in the market."
              </blockquote>
              <p className="text-richblack-300">— Sarah Johnson, CTO at TechInnovate Solutions</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Get Started Today</h2>
            <p className="text-richblack-100">
              Ready to transform your organization's learning culture? Contact our enterprise team at{" "}
              <span className="text-yellow-50 font-medium">business@beejaacademy.com</span>{" "}
              or schedule a demo to see how Beeja Academy can help your business achieve its goals.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Business;
