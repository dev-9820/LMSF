import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiEdit, FiArrowRight, FiX } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Quiz = () => {
  const navigate = useNavigate();
  const courseId = JSON.parse(localStorage.getItem("courseID"));
  const [courseName, setCourseName] = useState("");
  const [allQuiz, setAllQuiz] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getSingleCourse = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/course/singleCourse",
        { courseId }
      );
      setCourseName(data?.course?.courseName);
      setAllQuiz(data?.course?.quizes || []);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) setQuizName("");
  };

  const submitQuiz = async () => {
    if (!quizName.trim()) {
      alert("Please enter a quiz name");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/course/createQuiz", {
        courseId,
        quizName,
      });
      await getSingleCourse();
      toggleModal();
    } catch (error) {
      console.error("Error creating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.post(`http://localhost:8000/course/deleteQuiz`, { quizId });
        await getSingleCourse();
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handleQuestion = (id) => {
    localStorage.setItem("quizID", JSON.stringify(id));
    navigate("/question");
  };

  useEffect(() => {
    getSingleCourse();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Course: {courseName}</h1>
            <p className="text-gray-600">Manage quizzes for this course</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleModal}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 mt-4 md:mt-0"
          >
            <FiPlus />
            <span>Create Quiz</span>
          </motion.button>
        </div>

        {isLoading && allQuiz.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : allQuiz.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allQuiz.map((quiz) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{quiz.quizName}</h2>
                  <p className="text-gray-600 mb-4">
                    {quiz.questions?.length || 0} questions
                  </p>
                  
                  <div className="flex justify-between space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuestion(quiz._id)}
                      className="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-1"
                    >
                      <FiEdit size={16} />
                      <span>Manage</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteQuiz(quiz._id)}
                      className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-1"
                    >
                      <FiTrash2 size={16} />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No quizzes available. Create your first quiz!</p>
          </div>
        )}
      </div>

      {/* Add Quiz Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && toggleModal()}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
                  <button onClick={toggleModal} className="text-gray-500 hover:text-gray-700">
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quiz Name *
                    </label>
                    <input
                      type="text"
                      value={quizName}
                      onChange={(e) => setQuizName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="e.g. Midterm Exam"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitQuiz}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      <span>Create Quiz</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;