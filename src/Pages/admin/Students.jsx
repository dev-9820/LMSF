import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiUser, FiMail, FiBook, FiSearch } from "react-icons/fi";
import axios from "axios";
import Header from "../../components/Header";
import { Link } from "react-router-dom";

const Students = () => {
  const [users, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:8000/user/getAllstudents"
      );
      setAllUsers(data.user || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToCSV = (data) => {
    const header = ["Name", "Email", "Enrolled Courses"];
    const rows = data.map((user) => [
      `"${user.name}"`,
      `"${user.email}"`,
      user.enrolledCourses?.length > 0 
        ? `"${user.enrolledCourses.map(c => c.course?.courseName).join(", ")}"`
        : '"No courses enrolled"',
    ]);
    return [header.join(","), ...rows.map(row => row.join(","))].join("\n");
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(filteredUsers);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students_list.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
            <p className="text-gray-600">
              {users.length} {users.length === 1 ? "student" : "students"} enrolled
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCSV}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FiDownload />
              <span>Export</span>
            </motion.button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FiUser />
                        <span>Student</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FiMail />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FiBook />
                        <span>Courses</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/students/${user._id}`} 
                          className="flex items-center space-x-3 group"
                        >
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user._id.substring(18, 24)}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.enrolledCourses?.length > 0 ? (
                          <div className="space-y-1">
                            {user.enrolledCourses.slice(0, 2).map((course) => (
                              <p key={course._id} className="truncate max-w-xs">
                                {course.course?.courseName || "Untitled Course"}
                              </p>
                            ))}
                            {user.enrolledCourses.length > 2 && (
                              <p className="text-xs text-purple-600">
                                +{user.enrolledCourses.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not enrolled</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            {searchTerm ? (
              <p className="text-gray-500">No students match your search criteria</p>
            ) : (
              <p className="text-gray-500">No students found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;