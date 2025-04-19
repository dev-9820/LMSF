import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBook, FiCheck, FiClock, FiLock, FiChevronRight } from "react-icons/fi";
import axios from "axios";
import StudentHeader from "../../components/StudentHeader";
import Timer from "../../components/Timer";

const SingleCourse = () => {
  const courseId = JSON.parse(localStorage.getItem("userSelectedCourse"));
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const [courseData, setCourseData] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeExpired, setTimeExpired] = useState(false);
  const navigate = useNavigate();

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8000/course/singleCourse", {
        courseId
      });
      setCourseData(data.course);

      const progressRes = await axios.post("http://localhost:8000/user/getProgress", {
        userId,
        courseId
      });
      
      setCompletedModules(progressRes.data.completedModules || []);
      setCurrentModule(progressRes.data.currentModule || 0);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeModule = async (moduleIndex) => {
    try {
      const newCompletedModules = [...completedModules, moduleIndex];
      const newCurrentModule = Math.min(moduleIndex + 1, courseData.modules.length - 1);
      
      setCompletedModules(newCompletedModules);
      setCurrentModule(newCurrentModule);

      await axios.post("http://localhost:8000/user/updateProgress", {
        userId,
        courseId,
        completedModules: newCompletedModules,
        currentModule: newCurrentModule
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      setCompletedModules(completedModules.filter(m => m !== moduleIndex));
    }
  };

  const handleTimeExpired = () => {
    setTimeExpired(true);
    navigate("/courses");
  };

  useEffect(() => {
    if (timeExpired) {
      navigate("/courses");
    }
  }, [timeExpired, navigate]);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  const progressPercentage = courseData.modules?.length > 0 
    ? Math.round((completedModules.length / courseData.modules.length) * 100)
    : 0;

  // Check if current module exists
  const currentModuleExists = courseData.modules && courseData.modules[currentModule];

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      {/* Course Header with Timer */}
      <div className="relative w-full h-64 bg-cover bg-center" style={{ backgroundImage: `url(${courseData.image})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold text-white">{courseData.courseName}</h1>
                <p className="text-gray-200 mt-2">{courseData.description}</p>
              </div>
              <Timer 
                initialMinutes={15} 
                onExpire={handleTimeExpired} 
                className="bg-black/50 text-white px-4 py-2 rounded-lg"
              />
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 w-full">
              <div className="flex justify-between text-white mb-2">
                <span>Progress: {progressPercentage}%</span>
                <span>{completedModules.length}/{courseData.modules?.length || 0} modules</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Modules Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiBook className="mr-2" />
                Course Modules
              </h2>
              
              <nav className="space-y-2">
                {courseData.modules?.map((module, index) => (
                  <div key={index} className="relative">
                    <button
                      onClick={() => setCurrentModule(index)}
                      disabled={index > currentModule}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors
                        ${index === currentModule ? 'bg-purple-100 text-purple-700' : ''}
                        ${completedModules.includes(index) ? 'text-green-600' : ''}
                        ${index > currentModule ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
                      `}
                    >
                      <div className="flex items-center">
                        {index > currentModule ? (
                          <FiLock className="mr-3" />
                        ) : completedModules.includes(index) ? (
                          <FiCheck className="mr-3 text-green-500" />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            {index + 1}
                          </span>
                        )}
                        <span className="truncate">{module.name}</span>
                      </div>
                      {index === currentModule && <FiChevronRight />}
                    </button>
                    
                    {index > currentModule && (
                      <div className="absolute inset-0 bg-white/50 rounded-lg"></div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Current Module Content */}
          <div className="lg:col-span-3">
            {courseData.modules?.length > 0 ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  {currentModuleExists ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                          Module {currentModule + 1}: {courseData.modules[currentModule].name}
                        </h2>
                        {completedModules.includes(currentModule) ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Completed
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            In Progress
                          </span>
                        )}
                      </div>

                      <div 
                        className="prose max-w-none" 
                        dangerouslySetInnerHTML={{ 
                          __html: courseData.modules[currentModule].content 
                        }}
                      />

                      {!completedModules.includes(currentModule) && (
                        <div className="mt-8 flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => completeModule(currentModule)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-md"
                          >
                            Mark as Complete
                          </motion.button>
                        </div>
                      )}

                      {/* Only show Next button if there are more modules AND we're not on the last one */}
                      {currentModule < courseData.modules.length - 1 && completedModules.includes(currentModule) && (
                        <div className="mt-8 flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentModule(currentModule + 1)}
                            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center"
                          >
                            Next Module
                            <FiChevronRight className="ml-2" />
                          </motion.button>
                        </div>
                      )}

                      {/* Course Completion - Only show when ALL modules are completed */}
                      {currentModule === courseData.modules.length - 1 && 
                       completedModules.length === courseData.modules.length && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg text-center">
                          <h3 className="text-2xl font-bold text-green-800 mb-3">Course Completed!</h3>
                          <p className="text-gray-700 mb-4">Congratulations on completing this course.</p>
                          {courseData.quizes?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-800 mb-2">Available Quizzes:</h4>
                              <div className="flex flex-wrap justify-center gap-2">
                                {courseData.quizes.map((quiz) => (
                                  <motion.button
                                    key={quiz._id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      localStorage.setItem("userQuiz", JSON.stringify(quiz._id));
                                      navigate("/singleQuiz");
                                    }}
                                    className="bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg shadow-sm"
                                  >
                                    {quiz.quizName}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Module content not found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">No modules available for this course.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCourse;