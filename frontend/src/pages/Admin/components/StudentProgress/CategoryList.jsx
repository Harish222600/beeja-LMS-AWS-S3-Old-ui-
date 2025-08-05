import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaSearch, FaGraduationCap } from 'react-icons/fa';
import { showAllCategories } from '../../../../services/operations/categoryAPI';

const CategoryList = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await showAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-yellow-50 text-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-richblack-700 rounded-lg text-richblack-5 
                   placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50"
        />
        <FaSearch className="absolute right-3 top-3 text-richblack-400" />
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category._id}
            onClick={() => onCategorySelect(category)}
            className="bg-richblack-700 p-6 rounded-lg cursor-pointer 
                     hover:bg-richblack-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                  <FaGraduationCap className="text-richblack-700 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-richblack-5">
                  {category.name}
                </h3>
              </div>
            </div>

            <p className="text-sm text-richblack-300 mb-4 line-clamp-2">
              {category.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-richblack-300">
              <span>{category.courses?.length || 0} Courses</span>
              <button 
                className="text-yellow-50 hover:text-yellow-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategorySelect(category);
                }}
              >
                View Courses
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredCategories.length === 0 && (
        <div className="text-center text-richblack-400 py-8">
          {searchTerm ? "No categories found matching your search" : "No categories available"}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
