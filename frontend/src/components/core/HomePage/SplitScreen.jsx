import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeIn, scaleUp } from '../../common/motionFrameVarients';
import './SplitScreen.css';

// Using your existing certification images
import adobe from "../../../assets/Images/certification img/Adobe.png";
import apple from "../../../assets/Images/certification img/Apple.png";
import autodesk from "../../../assets/Images/certification img/Autodesk.png";
import cisco from "../../../assets/Images/certification img/cisco.png";
import scb from "../../../assets/Images/certification img/CSB-Logo.png";
import esb from "../../../assets/Images/certification img/ESB.png";
import ic3 from "../../../assets/Images/certification img/IC3.png";
import intuit from "../../../assets/Images/certification img/Intuit.png";
import its from "../../../assets/Images/certification img/ITS-Logo-Stacked.png";
import meta from "../../../assets/Images/certification img/meta-logo.webp";
import Microsoft from "../../../assets/Images/certification img/microsoft.webp";
import Project from "../../../assets/Images/certification img/Project.png";
import Unity from "../../../assets/Images/certification img/Unity-logo.png";


const logos = [
  { src: adobe, alt: "adobe" },
  { src: apple, alt: "apple" },
  { src: autodesk, alt: "autodesk" },
  { src: cisco, alt: "cisco" },
  { src: scb, alt: "scb" },
  { src: meta, alt: "sony" },
  { src: Microsoft, alt: "Microsoft" },
  { src: Project, alt: "Project" },
  { src: Unity, alt: "Unity" },
  { src: esb, alt: "esb" },
  { src: ic3, alt: "ic3" },
  { src: its, alt: "its" },
  { src: intuit, alt: "intuit" }
];

const MarqueeColumn = ({ direction = 'up', logos }) => (
  <div className="marquee-column">
    <div className={`vertical-marquee ${direction}`}>
      <div className="marquee-content">
        {[...logos, ...logos, ...logos].map((logo, idx) => (
          <div className="logo-item" key={idx}>
            <img src={logo.src} alt={logo.alt} className="logo" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SplitScreen = () => {
  return (
    
    
    <motion.div 
      variants={fadeIn('up', 0.2)}
      initial='hidden'
      whileInView={'show'}
      viewport={{ once: false, amount: 0.2 }}
      className="split-container"
    >
      {/* Left Side */}
      <motion.div 
        variants={fadeIn('right', 0.3)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.2 }}
        className="left-side"
      >
        <div className="text-content">
          <h1>Industry-Leading Certifications</h1>
          <p className="subtitle">Learn from the Best in Tech</p>
          <div className="description">
            <p>
              Our courses are certified by leading tech giants like Google, IBM, Meta, and more. 
              Gain globally recognized credentials that validate your skills and boost your career prospects.
              Join thousands of successful graduates who have transformed their careers through our certified programs.
            </p>
          </div>
          <Link to="/courses">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-button"
            >
              Explore Certifications
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Right Side */}
      <motion.div 
        variants={fadeIn('left', 0.3)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.2 }}
        className="right-side"
      >
        <MarqueeColumn direction="up" logos={[...logos].sort(() => Math.random() - 0.5)} />
        <MarqueeColumn direction="down" logos={[...logos].sort(() => Math.random() - 0.5)} />
        <MarqueeColumn direction="up" logos={[...logos].sort(() => Math.random() - 0.5)} />
      </motion.div>
    </motion.div>
  );
};

export default SplitScreen;
