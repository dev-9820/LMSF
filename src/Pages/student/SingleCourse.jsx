import React, { useEffect, useState,useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBook, FiCheck, FiClock, FiLock, FiChevronRight,FiDownload  } from "react-icons/fi";
import axios from "axios";
import StudentHeader from "../../components/StudentHeader";
import Timer from "../../components/Timer";
import { usePDF } from 'react-to-pdf';

const Certificate = ({ courseName, userName, completionDate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white border-8 border-yellow-400">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-blue-800 mb-2">Certificate of Completion</h1>
          <p className="text-xl text-gray-600">This is to certify that</p>
        </div>
        
        <div className="my-8">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">{userName}</h2>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-500 w-3/4 mx-auto"></div>
        </div>
        
        <p className="text-xl text-gray-700 mb-6">
          has successfully completed the course
        </p>
        
        <h3 className="text-3xl font-bold text-blue-800 mb-6">{courseName}</h3>
        
        <div className="flex justify-between mt-12">
          <div className="text-center">
            <div className="h-1 bg-gray-400 w-32 mx-auto mb-2"></div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">{completionDate}</p>
          </div>
          <div className="text-center">
            <div className="h-1 bg-gray-400 w-32 mx-auto mb-2"></div>
            <p className="text-gray-600">Certificate ID</p>
            <p className="font-medium">
              {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SingleCourse = () => {
  const courseId = JSON.parse(localStorage.getItem("userSelectedCourse"));
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const user = JSON.parse(localStorage.getItem("user"))
  const [courseData, setCourseData] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeExpired, setTimeExpired] = useState(false);
  const navigate = useNavigate();

  const certificateRef = useRef();
  const { toPDF, targetRef } = usePDF({filename: `${courseData?.courseName || 'Course'}_Certificate.pdf`});
  
  const handleDownloadCertificate = () => {
    toPDF();
  };

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("https://lmsb-miy9.onrender.com/course/singleCourse", {
        courseId
      });
      setCourseData(data.course);

      const progressRes = await axios.post("https://lmsb-miy9.onrender.com/user/getProgress", {
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

      await axios.post("https://lmsb-miy9.onrender.com/user/updateProgress", {
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

                         
                          <div className="mt-6">
        <div ref={targetRef} className="mb-6">
          <Certificate 
            courseName={courseData.courseName} 
            userName={user?.name || "Student"} 
            completionDate={new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadCertificate}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center mx-auto"
        >
          <FiDownload className="mr-2" />
          Download Certificate
        </motion.button>
      </div>
                          

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