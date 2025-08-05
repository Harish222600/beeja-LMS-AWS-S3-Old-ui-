import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickLinks() {
  const links = [
    { text: 'Home', path: '/' },
    { text: 'Courses', path: '/courses' },
    { text: 'Verify Certificate', path: '/verify-certificate' },
    { text: 'About Us', path: '/about' },
    { text: 'Contact', path: '/contact' },
    { text: 'FAQs', path: '/faqs' }
  ];

  return (
    <div className="bg-richblack-800 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="text-richblack-100 hover:text-yellow-50 transition-colors duration-200"
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
