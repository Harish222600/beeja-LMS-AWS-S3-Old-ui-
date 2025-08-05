import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaUser, 
  FaBook, 
  FaToggleOn, 
  FaToggleOff, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTrash
} from 'react-icons/fa';
import { 
  getAllReviewsForAdmin, 
  toggleReviewSelection, 
  bulkUpdateReviewSelection,
  deleteReview 
} from '../../../services/operations/adminAPI';

const ReviewManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterSelection, setFilterSelection] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [processingIds, setProcessingIds] = useState(new Set());

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviewsForAdmin(token);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  // Handle individual review selection toggle
  const handleToggleSelection = async (reviewId) => {
    if (processingIds.has(reviewId)) return;

    try {
      setProcessingIds(prev => new Set([...prev, reviewId]));
      const updatedReview = await toggleReviewSelection(reviewId, token);
      
      // Update the review in the local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { ...review, isSelected: updatedReview.isSelected }
            : review
        )
      );
    } catch (error) {
      console.error('Error toggling review selection:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  // Handle bulk selection
  const handleBulkSelection = async (isSelected) => {
    if (selectedReviews.length === 0) {
      toast.error('Please select reviews first');
      return;
    }

    try {
      await bulkUpdateReviewSelection(selectedReviews, isSelected, token);
      
      // Update local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          selectedReviews.includes(review._id)
            ? { ...review, isSelected }
            : review
        )
      );
      
      setSelectedReviews([]);
      toast.success(`${selectedReviews.length} reviews ${isSelected ? 'selected' : 'deselected'} successfully`);
    } catch (error) {
      console.error('Error in bulk selection:', error);
    }
  };

  // Filter reviews based on search and filters
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    
    const matchesSelection = 
      filterSelection === 'all' || 
      (filterSelection === 'selected' && review.isSelected) ||
      (filterSelection === 'unselected' && !review.isSelected);

    return matchesSearch && matchesRating && matchesSelection;
  });

  // Handle checkbox selection
  const handleCheckboxChange = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Select all filtered reviews
  const handleSelectAll = () => {
    const allFilteredIds = filteredReviews.map(review => review._id);
    setSelectedReviews(allFilteredIds);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedReviews([]);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (processingIds.has(reviewId)) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this review? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      setProcessingIds(prev => new Set([...prev, reviewId]));
      await deleteReview(reviewId, token);
      
      // Remove the review from local state
      setReviews(prevReviews => 
        prevReviews.filter(review => review._id !== reviewId)
      );
      
      // Remove from selected reviews if it was selected
      setSelectedReviews(prev => prev.filter(id => id !== reviewId));
      
      
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-richblack-5">Review</h2>
          <p className="text-richblack-300 mt-1">
            Select which reviews to display on the home page and about us page
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-richblack-300">
          <span className="flex items-center gap-1">
            <FaCheckCircle className="text-green-400" />
            {reviews.filter(r => r.isSelected).length} Selected
          </span>
          <span className="flex items-center gap-1">
            <FaTimesCircle className="text-red-400" />
            {reviews.filter(r => !r.isSelected).length} Not Selected
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-richblack-700 p-4 rounded-lg space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
              <input
                type="text"
                placeholder="Search by user name, course, or review content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-richblack-800 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-richblack-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 bg-richblack-800 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:border-yellow-50"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Selection Filter */}
          <div>
            <select
              value={filterSelection}
              onChange={(e) => setFilterSelection(e.target.value)}
              className="px-3 py-2 bg-richblack-800 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:border-yellow-50"
            >
              <option value="all">All Reviews</option>
              <option value="selected">Selected Only</option>
              <option value="unselected">Not Selected</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-richblack-600">
            <span className="text-richblack-300 text-sm">
              {selectedReviews.length} review(s) selected
            </span>
            <button
              onClick={() => handleBulkSelection(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Select for Display
            </button>
            <button
              onClick={() => handleBulkSelection(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Remove from Display
            </button>
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 bg-richblack-600 hover:bg-richblack-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Select All */}
        <div className="flex items-center gap-3 pt-3 border-t border-richblack-600">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Select All Filtered ({filteredReviews.length})
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <FaEye className="mx-auto text-4xl text-richblack-400 mb-4" />
            <h3 className="text-xl font-semibold text-richblack-300 mb-2">No Reviews Found</h3>
            <p className="text-richblack-400">
              {searchTerm || filterRating !== 'all' || filterSelection !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No reviews available yet'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-richblack-700 border rounded-lg p-4 transition-all duration-200 ${
                review.isSelected 
                  ? 'border-green-500 bg-green-500/5' 
                  : 'border-richblack-600 hover:border-richblack-500'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review._id)}
                  onChange={() => handleCheckboxChange(review._id)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-richblack-800 border-richblack-600 rounded focus:ring-blue-500"
                />

                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={review.user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${review.user?.firstName} ${review.user?.lastName}`}
                    alt={`${review.user?.firstName} ${review.user?.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-richblack-600"
                  />
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-richblack-5">
                          {review.user?.firstName} {review.user?.lastName}
                        </h4>
                        <span className="text-richblack-400 text-sm">•</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'text-yellow-400' : 'text-richblack-600'
                              }`}
                            />
                          ))}
                          <span className="text-yellow-400 text-sm font-medium ml-1">
                            {review.rating}
                          </span>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <FaBook className="text-richblack-400 w-3 h-3" />
                        <span className="text-richblack-300 text-sm">
                          {review.course?.courseName}
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="text-richblack-200 text-sm leading-relaxed mb-3">
                        {review.review}
                      </p>

                      {/* Date */}
                      <p className="text-richblack-400 text-xs">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => handleToggleSelection(review._id)}
                        disabled={processingIds.has(review._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          review.isSelected
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-richblack-600 hover:bg-richblack-500 text-richblack-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingIds.has(review._id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : review.isSelected ? (
                          <FaToggleOn className="text-lg" />
                        ) : (
                          <FaToggleOff className="text-lg" />
                        )}
                        {review.isSelected ? 'Selected' : 'Select'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={processingIds.has(review._id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Review"
                      >
                        {processingIds.has(review._id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="bg-richblack-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-richblack-5 mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{reviews.length}</div>
              <div className="text-richblack-300">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {reviews.filter(r => r.isSelected).length}
              </div>
              <div className="text-richblack-300">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-richblack-300">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredReviews.length}
              </div>
              <div className="text-richblack-300">Filtered</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
