import { useState } from 'react';
import { motion } from 'framer-motion';
import CategoryList from './CategoryList';
import CourseList from './CourseList';
import StudentList from './StudentList';
import ProgressDetails from './ProgressDetails';

const StudentProgress = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Reset states when moving back in the hierarchy
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedCourse(null);
    setSelectedStudent(null);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedStudent(null);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleBack = () => {
    if (selectedStudent) {
      setSelectedStudent(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Student Progress</h1>
          <p className="text-richblack-200">Track and monitor student progress across courses</p>
        </div>
        {(selectedCategory || selectedCourse || selectedStudent) && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-yellow-50 hover:text-yellow-100"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-richblack-300">
        <span className="text-yellow-50">Categories</span>
        {selectedCategory && (
          <>
            <span>/</span>
            <span className="text-yellow-50">{selectedCategory.name}</span>
          </>
        )}
        {selectedCourse && (
          <>
            <span>/</span>
            <span className="text-yellow-50">{selectedCourse.courseName}</span>
          </>
        )}
        {selectedStudent && (
          <>
            <span>/</span>
            <span className="text-yellow-50">
              {selectedStudent.firstName} {selectedStudent.lastName}
            </span>
          </>
        )}
      </div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!selectedCategory ? (
          <CategoryList onCategorySelect={handleCategorySelect} />
        ) : !selectedCourse ? (
          <CourseList 
            categoryId={selectedCategory._id} 
            onCourseSelect={handleCourseSelect} 
          />
        ) : !selectedStudent ? (
          <StudentList 
            courseId={selectedCourse._id} 
            onStudentSelect={handleStudentSelect} 
          />
        ) : (
          <ProgressDetails 
            courseId={selectedCourse._id} 
            studentId={selectedStudent._id} 
          />
        )}
      </motion.div>
    </div>
  );
};

export default StudentProgress;
