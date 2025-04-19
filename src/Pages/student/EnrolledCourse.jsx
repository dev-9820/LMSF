import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBook, FiPlay, FiTrash2, FiBarChart2, FiClock,FiX  } from "react-icons/fi";
import axios from "axios";
import StudentHeader from "../../components/StudentHeader";
import { useNavigate } from "react-router-dom";

const EnrolledCourse = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const getSingleUser = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8000/user/get-user", {
        id: userId,
      });
      setCourses(data?.user?.enrolledCourses || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEnrollment = async (courseId) => {
    if (window.confirm("Are you sure you want to unenroll from this course?")) {
      try {
        await axios.post("http://localhost:8000/user/removeEnroll", {
          userId,
          courseId,
        });
        await getSingleUser();
      } catch (error) {
        console.error("Error removing enrollment:", error);
      }
    }
  };

  const handleViewCourse = (courseId) => {
    localStorage.setItem("userSelectedCourse", JSON.stringify(courseId));
    navigate("/singleCourse");
  };

  const openQuizModal = (course) => {
    setSelectedCourse(course);
  };

  const closeQuizModal = () => {
    setSelectedCourse(null);
  };

  const handleStartQuiz = (quizId) => {
    localStorage.setItem("userQuiz", JSON.stringify(quizId));
    navigate("/singleQuiz");
    closeQuizModal();
  };

  useEffect(() => {
    getSingleUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <p className="text-gray-600">
              {courses.length} enrolled courses
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((enrolled, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={enrolled.course?.image || "/course-placeholder.jpg"}
                    alt={enrolled.course?.courseName || "Course"}
                    className="w-full h-48 object-cover"
                  />
                  {enrolled.completed > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
                      <div 
                        className="bg-green-500 h-2" 
                        style={{ width: `${enrolled.completed}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {enrolled.course?.courseName || "Untitled Course"}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {enrolled.course?.description || "No description available"}
                  </p>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <FiBarChart2 className="mr-1" />
                      {enrolled.completed || 0}% Complete
                    </span>
                    <span className="flex items-center">
                      <FiClock className="mr-1" />
                      {enrolled.course?.modules?.length || 0} Modules
                    </span>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewCourse(enrolled.course?._id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <FiPlay className="mr-2" />
                      {enrolled.completed > 0 ? "Continue" : "Start"}
                    </motion.button>
                    
                    {enrolled.course?.quizes?.length > 0 && (
                      <button
                        onClick={() => openQuizModal(enrolled.course)}
                        className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Quizzes ({enrolled.course.quizes.length})
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemoveEnrollment(enrolled.course?._id)}
                      className="w-full text-center text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-center"
                    >
                      <FiTrash2 className="mr-1" />
                      Unenroll
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate("/courses")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeQuizModal}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedCourse.courseName} Quizzes
                  </h2>
                  <button onClick={closeQuizModal} className="text-gray-500 hover:text-gray-700">
                    <FiX size={24} />
                  </button>
                </div>
                
                {selectedCourse.quizes?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCourse.quizes.map((quiz) => (
                      <motion.div
                        key={quiz._id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleStartQuiz(quiz._id)}
                      >
                        <h3 className="font-medium text-gray-800">{quiz.quizName}</h3>
                        <p className="text-sm text-gray-600">
                          {quiz.questions?.length || 0} questions
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No quizzes available for this course.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnrolledCourse;