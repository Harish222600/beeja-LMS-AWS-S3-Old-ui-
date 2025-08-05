import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { submitQuestion } from '../../services/operations/faqAPI';
import { toast } from 'react-hot-toast';

const FaqButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    question: ''
  });
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Please login to submit a question');
      return;
    }

    if (!formData.question.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setLoading(true);
    try {
      const result = await submitQuestion(formData.question, token);
      if (result) {
        setFormData({ question: '' });
        setShowModal(false);
        
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAQ Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 hover:scale-110 p-3 text-lg text-white rounded-2xl fixed right-3 bottom-20 z-50 duration-500 ease-in-out shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Ask a Question"
      >
        <FaQuestionCircle />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-richblack-800 rounded-lg p-6 w-full max-w-md mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Ask a Question</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-richblack-300 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {user && (
                  <div className="text-sm text-richblack-300">
                    <p>Submitting as: <span className="text-white">{user.firstName} {user.lastName}</span></p>
                    <p>Email: <span className="text-white">{user.email}</span></p>
                  </div>
                )}

                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-richblack-200 mb-2">
                    Your Question *
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Type your question here..."
                    rows={4}
                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-richblack-700 text-richblack-200 rounded-md hover:bg-richblack-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.question.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Question'}
                  </button>
                </div>
              </form>

              {!token && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <p className="text-yellow-400 text-sm">
                    Please <a href="/login" className="underline hover:text-yellow-300">login</a> to submit a question.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FaqButton;
