import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBook, FiAward, FiClock, FiUser, FiMail, FiBarChart2 } from "react-icons/fi";
import axios from "axios";
import Header from "../../components/Header";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const StudentProfile = () => {
  const { userId } = useParams();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  const getUserData = async () => {
    try {
      const { data } = await axios.post("http://localhost:8000/user/get-user", {
        id: userId,
      });
      setUser(data.user);
      setEnrolledCourses(data.user?.enrolledCourses || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/results/user/${userId}`);
      setResults(response.data || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getUserData();
    fetchResults();
  }, [userId]);

  const chartData = {
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

  const courseCompletionData = {
    labels: enrolledCourses.map((course) => course.course?.courseName || "Unknown Course"),
    datasets: [
      {
        data: enrolledCourses.map((course) => 
          Math.floor(parseFloat(course?.completed || 0))
        ),
        backgroundColor: [
          "rgba(99, 102, 241, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : user ? (
        <div className="container mx-auto px-4 py-8">
          {/* Student Profile Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0 h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                <div className="flex flex-wrap items-center space-x-4 mt-2">
                  <div className="flex items-center text-gray-600">
                    <FiMail className="mr-1" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiBook className="mr-1" />
                    <span>{enrolledCourses.length} enrolled courses</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiAward className="mr-1" />
                    <span>{results.length} quiz attempts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "courses"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiBook />
              <span>Enrolled Courses</span>
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

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiBook className="mr-2" />
                Course Progress
              </h2>
              
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => {
                    const completionPercentage = Math.floor(parseFloat(course?.completed || 0));
                    return (
                      <div key={course._id} className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {course.course?.courseName || "Untitled Course"}
                        </h3>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full text-xs text-white flex items-center justify-center"
                            style={{ width: `${completionPercentage}%` }}
                          >
                            {completionPercentage}%
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Started: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                          <span>{completionPercentage}% completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500">This student hasn't enrolled in any courses yet.</p>
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
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <FiBarChart2 className="mr-1" />
                            Score: {result.score}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <FiClock className="mr-1" />
                            {result.timeTaken}s
                          </span>
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
                      <h4 className="text-md font-medium text-gray-700 mb-3">Scores by Quiz</h4>
                      <Bar 
                        data={chartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                          },
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
                      <Pie 
                        data={courseCompletionData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'right',
                            },
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Student not found</p>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;