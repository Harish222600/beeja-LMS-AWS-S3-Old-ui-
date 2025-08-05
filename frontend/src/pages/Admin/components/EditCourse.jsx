import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { showAllCategories } from "../../../services/operations/categoryAPI";
import { getAllInstructors } from "../../../services/operations/adminAPI";
import { editCourseDetails } from "../../../services/operations/courseDetailsAPI";
import Upload from "../../../components/core/Dashboard/AddCourse/Upload";
import ChipInput from "../../../components/core/Dashboard/AddCourse/CourseInformation/ChipInput";
import RequirementsField from "../../../components/core/Dashboard/AddCourse/CourseInformation/RequirementField";
import AdminCourseBuilder from "./AdminCourseBuilder";

export default function EditCourse({ course, onCancel, onSave }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [activeTab, setActiveTab] = useState('information');
  const [currentCourse, setCurrentCourse] = useState(course);
  
  // Refs for form fields to scroll to on validation error
  const fieldRefs = useRef({});
  
  // State to track validation errors for visual indicators
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const getCategories = async () => {
      const categories = await showAllCategories();
      setCategories(categories);
    };

    const getInstructors = async () => {
      const instructorsData = await getAllInstructors(token);
      if (instructorsData) {
        setInstructors(instructorsData);
      }
    };

    // Pre-populate form with course data
    if (course) {
      setCurrentCourse(course);
      setValue("courseTitle", course.courseName);
      setValue("courseShortDesc", course.courseDescription);
      setValue("coursePrice", course.price);
      setValue("courseCategory", course.category?._id);
      setValue("courseTags", course.tag || []);
      setValue("courseBenefits", course.whatYouWillLearn);
      setValue("courseRequirements", course.instructions || []);
      setValue("courseImage", course.thumbnail);
      if (course.instructor) {
        setValue("instructorId", course.instructor._id);
      }
    }

    getCategories();
    getInstructors();
  }, [course, setValue, token]);

  const onSubmit = async (data, e) => {
    // Clear previous validation errors
    setValidationErrors({});

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      // Set validation errors for visual indicators
      const newValidationErrors = {};
      Object.keys(errors).forEach(field => {
        newValidationErrors[field] = errors[field].message;
      });
      setValidationErrors(newValidationErrors);

      // Find the first field with an error
      const firstErrorField = Object.keys(errors)[0];
      // Scroll to the field
      if (fieldRefs.current[firstErrorField]) {
        fieldRefs.current[firstErrorField].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("courseId", course._id);
      
      // Only append changed fields
      if (data.courseTitle !== course.courseName) {
        formData.append("courseName", data.courseTitle);
      }
      if (data.courseShortDesc !== course.courseDescription) {
        formData.append("courseDescription", data.courseShortDesc);
      }
      if (data.coursePrice !== course.price) {
        formData.append("price", data.coursePrice);
      }
      if (data.courseCategory !== course.category?._id) {
        formData.append("category", data.courseCategory);
      }
      if (JSON.stringify(data.courseTags) !== JSON.stringify(course.tag)) {
        formData.append("tag", JSON.stringify(data.courseTags));
      }
      if (data.courseBenefits !== course.whatYouWillLearn) {
        formData.append("whatYouWillLearn", data.courseBenefits);
      }
      if (JSON.stringify(data.courseRequirements) !== JSON.stringify(course.instructions)) {
        formData.append("instructions", JSON.stringify(data.courseRequirements));
      }
      if (data.courseImage !== course.thumbnail) {
        formData.append("thumbnailImage", data.courseImage);
      }
      if (data.instructorId !== course.instructor?._id) {
        formData.append("instructorId", data.instructorId);
      }

      const result = await editCourseDetails(formData, token);
      
      if (result) {
        toast.success("Course updated successfully!");
        setCurrentCourse(result);
        onSave(result); // Callback to refresh course list
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle course update from Course Builder
  const handleCourseUpdate = (updatedCourse) => {
    setCurrentCourse(updatedCourse);
    onSave(updatedCourse);
  };

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-richblack-5">Edit Course</h2>
        <button
          onClick={onCancel}
          className="text-richblack-300 hover:text-richblack-5 px-4 py-2 rounded-lg border border-richblack-600 hover:border-richblack-500 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-richblack-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('information')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'information'
              ? 'bg-yellow-50 text-richblack-900'
              : 'text-richblack-5 hover:text-yellow-50'
          }`}
        >
          Course Information
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-yellow-50 text-richblack-900'
              : 'text-richblack-5 hover:text-yellow-50'
          }`}
        >
          Course Builder
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'information' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Course Title */}
        <div 
          className={`flex flex-col space-y-2 ${
            validationErrors.courseTitle ? 'p-3 border border-red-500 rounded-lg bg-red-900/10' : ''
          }`}
          ref={el => fieldRefs.current['courseTitle'] = el}
        >
          <label className="text-sm text-richblack-5" htmlFor="courseTitle">
            Course Title <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="courseTitle"
            placeholder="Enter Course Title"
            {...register("courseTitle", { required: "Course title is required" })}
            className={`form-style w-full ${
              validationErrors.courseTitle ? 'border-red-500 focus:border-red-400' : ''
            }`}
          />
          {errors.courseTitle && (
            <span className="ml-2 text-xs tracking-wide text-red-400">
              {errors.courseTitle.message}
            </span>
          )}
        </div>

        {/* Course Short Description */}
        <div 
          className="flex flex-col space-y-2"
          ref={el => fieldRefs.current['courseShortDesc'] = el}
        >
          <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">
            Course Short Description <sup className="text-pink-200">*</sup>
          </label>
          <textarea
            id="courseShortDesc"
            placeholder="Enter Description"
            {...register("courseShortDesc", { required: "Course description is required" })}
            className="form-style resize-x-none min-h-[130px] w-full"
          />
          {errors.courseShortDesc && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              {errors.courseShortDesc.message}
            </span>
          )}
        </div>

        {/* Course Price */}
        <div 
          className="flex flex-col space-y-2"
          ref={el => fieldRefs.current['coursePrice'] = el}
        >
          <label className="text-sm text-richblack-5" htmlFor="coursePrice">
            Course Price <sup className="text-pink-200">*</sup>
          </label>
          <div className="relative">
            <input
              id="coursePrice"
              placeholder="Enter Course Price"
              {...register("coursePrice", {
                required: "Course price is required",
                valueAsNumber: true,
                pattern: {
                  value: /^(0|[1-9]\d*)(\.\d+)?$/,
                  message: "Please enter a valid price"
                },
              })}
              className="form-style w-full !pl-12"
            />
            <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 inline-block -translate-y-1/2 text-2xl text-richblack-400" />
          </div>
          {errors.coursePrice && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              {errors.coursePrice.message}
            </span>
          )}
        </div>

        {/* Course Category */}
        <div 
          className="flex flex-col space-y-2"
          ref={el => fieldRefs.current['courseCategory'] = el}
        >
          <label className="text-sm text-richblack-5" htmlFor="courseCategory">
            Course Category <sup className="text-pink-200">*</sup>
          </label>
          <select
            {...register("courseCategory", { required: "Course category is required" })}
            id="courseCategory"
            className="form-style w-full cursor-pointer"
          >
            <option value="" disabled>
              Choose a Category
            </option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.courseCategory && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              {errors.courseCategory.message}
            </span>
          )}
        </div>

        {/* Course Tags */}
        <ChipInput
          label="Tags"
          name="courseTags"
          placeholder="Enter Tags and press Enter or Comma"
          register={register}
          errors={errors}
          setValue={setValue}
          initialData={course?.tag || []}
        />

        {/* Course Thumbnail Image */}
        <Upload
          name="courseImage"
          label="Course Thumbnail"
          register={register}
          setValue={setValue}
          errors={errors}
          editData={course?.thumbnail}
        />

        {/* Benefits of the course */}
        <div 
          className="flex flex-col space-y-2"
          ref={el => fieldRefs.current['courseBenefits'] = el}
        >
          <label className="text-sm text-richblack-5" htmlFor="courseBenefits">
            Benefits of the course <sup className="text-pink-200">*</sup>
          </label>
          <textarea
            id="courseBenefits"
            placeholder="Enter benefits of the course"
            {...register("courseBenefits", { required: "Course benefits are required" })}
            className="form-style resize-x-none min-h-[130px] w-full"
          />
          {errors.courseBenefits && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              {errors.courseBenefits.message}
            </span>
          )}
        </div>

        {/* Requirements/Instructions */}
        <div ref={el => fieldRefs.current['courseRequirements'] = el}>
          <RequirementsField
            name="courseRequirements"
            label="Requirements/Instructions"
            register={register}
            setValue={setValue}
            errors={errors}
            initialData={course?.instructions || []}
          />
        </div>

        {/* Select Instructor */}
        <div 
          className="flex flex-col space-y-2"
          ref={el => fieldRefs.current['instructorId'] = el}
        >
          <label className="text-sm text-richblack-5" htmlFor="instructorId">
            Select Instructor <sup className="text-pink-200">*</sup>
          </label>
          <select
            id="instructorId"
            {...register("instructorId", { required: "Instructor selection is required" })}
            className="form-style w-full cursor-pointer"
          >
            <option value="" disabled>
              Choose an Instructor
            </option>
            {instructors?.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.firstName} {instructor.lastName}
              </option>
            ))}
          </select>
          {errors.instructorId && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              {errors.instructorId.message}
            </span>
          )}
        </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center rounded-md bg-richblack-600 px-6 py-3 text-richblack-5 font-semibold hover:bg-richblack-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center rounded-md bg-yellow-50 px-6 py-3 text-richblack-900 font-semibold flex-1 ${
                loading ? "cursor-not-allowed opacity-50" : "hover:scale-95"
              } transition-all duration-200`}
            >
              {loading ? "Updating Course..." : "Update Course"}
            </button>
          </div>
        </form>
      ) : (
        <AdminCourseBuilder
          course={currentCourse}
          onCourseUpdate={handleCourseUpdate}
        />
      )}
    </div>
  );
}
