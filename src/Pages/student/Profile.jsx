import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FiBook, 
  FiAward, 
  FiClock,
  FiUser,
  FiBarChart2,
  FiPlus
} from "react-icons/fi";
import axios from "axios";
import StudentHeader from "../../components/StudentHeader";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [curatedCourses, setCuratedCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrolled");
  const navigate = useNavigate()

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [userData, curatedData, resultsData] = await Promise.all([
        axios.post("http://localhost:8000/user/get-user", { id: userId }),
        axios.get(`http://localhost:8000/gencourse/all/${userId}`),
        axios.get(`http://localhost:8000/results/user/${userId}`)
      ]);

      setEnrolledCourses(userData.data?.user?.enrolledCourses || []);
      setCuratedCourses(curatedData.data?.courses || []);
      setResults(resultsData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Chart data for quiz results
  const resultsChartData = {
    labels: results.map((result) => result.title),
    datasets: [
      {
        label: "Scores",
        data: results.map((result) => result.score),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart data for course progress
  const progressChartData = {
    labels: enrolledCourses.map(course => course.course?.courseName || "Unknown Course"),
    datasets: [
      {
        label: "Completion %",
        data: enrolledCourses.map(course => Math.floor(parseFloat(course?.completed || 0))),
        backgroundColor: enrolledCourses.map((_, i) => 
          `hsl(${(i * 360) / enrolledCourses.length}, 70%, 60%)`
        ),
        borderWidth: 1,
      },
    ],
  };

  const totalTimeSpent = enrolledCourses.reduce(
    (total, course) => total + (course.timeSpent || 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0 h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                <div className="flex flex-wrap items-center space-x-4 mt-2">
                  <div className="flex items-center text-gray-600">
                    <FiBook className="mr-1" />
                    <span>{enrolledCourses.length} enrolled courses</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiAward className="mr-1" />
                    <span>{results.length} quiz attempts</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-1" />
                    <span>{totalTimeSpent} minutes learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("enrolled")}
              className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "enrolled"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiBook />
              <span>Enrolled Courses</span>
            </button>
            <button
              onClick={() => setActiveTab("generated")}
              className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "generated"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiPlus />
              <span>Generated Courses</span>
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "performance"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiBarChart2 />
              <span>Performance</span>
            </button>
          </div>

          {/* Enrolled Courses Tab */}
          {activeTab === "enrolled" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiBook className="mr-2" />
                Your Learning Progress
              </h2>
              
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map((course, index) => {
                    const completionPercentage = Math.floor(parseFloat(course?.completed || 0));
                    return (
                      <div key={index} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {course.course?.courseName || "Untitled Course"}
                          </h3>
                          <span className="text-sm font-medium text-gray-600">
                            {completionPercentage}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Started: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                          <span>{course.timeSpent || 0} minutes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Generated Courses Tab */}
          {activeTab === "generated" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiPlus className="mr-2" />
                AI Generated Courses
              </h2>
              
              {curatedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {curatedCourses.map((course, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg cursor-pointer"
                      onClick={() => navigate("/generated-course", { state: { courseData: course } })}
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {course.courseTitle}
                        </h3>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span className="flex items-center">
                            <FiBook className="mr-1" />
                            {course.units.length} Units
                          </span>
                          <span className="flex items-center">
                            <FiClock className="mr-1" />
                            {course.duration || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500">You haven't generated any courses yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FiAward className="mr-2" />
                  Quiz Results
                </h2>
                
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => (
                      <div key={result._id} className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="font-medium text-gray-800">{result.title}</h3>
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                          <span>Score: {result.score}%</span>
                          <span>{result.timeTaken}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <p className="text-gray-500">No quiz results available.</p>
                  </div>
                )}
              </div>

              {results.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Overview</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Quiz Scores</h4>
                      <Bar 
                        data={resultsChartData} 
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Course Completion</h4>
                      {enrolledCourses.length > 0 ? (
                        <Pie 
                          data={progressChartData} 
                          options={{
                            responsive: true
                          }}
                        />
                      ) : (
                        <p className="text-gray-500 text-center py-8">No enrolled courses</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;