import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiBook, FiPlay, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import StudentHeader from "../../components/StudentHeader";
import { useNavigate } from "react-router-dom";

const AllCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  const getCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch all available courses
      const { data } = await axios.get("http://localhost:8000/course/allCourses");
      setCourses(data.courses || []);
      
      // Fetch user's enrolled courses
      const userData = await axios.post("http://localhost:8000/user/get-user", {
        id: userId
      });
      setEnrolledCourses(userData.data.user?.enrolledCourses || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post("http://localhost:8000/user/enrollCourse", {
        courseId,
        userId
      });
      await getCourses(); // Refresh data after enrollment
    } catch (error) {
      console.error("Error enrolling:", error);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.course?._id === courseId);
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Explore Courses</h1>
            <p className="text-gray-600">
              {courses.length} courses available
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/enrolled")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center"
          >
            <FiBook className="mr-2" />
            My Courses
          </motion.button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.courseName}
                    className="w-full h-48 object-cover"
                  />
                  {isEnrolled(course._id) && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Enrolled
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{course.courseName}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{course.modules?.length || 0} Modules</span>
                    <span>{course.quizes?.length || 0} Quizzes</span>
                  </div>

                  {isEnrolled(course._id) ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        localStorage.setItem("userSelectedCourse", JSON.stringify(course._id));
                        navigate("/singleCourse");
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <FiPlay className="mr-2" />
                      Continue Learning
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEnroll(course._id)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <FiArrowRight className="mr-2" />
                      Enroll Now
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;