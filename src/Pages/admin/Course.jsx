import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiTrash2, FiEdit, FiEye, 
  FiX, FiUpload, FiDownload, FiChevronDown,
  FiChevronUp, FiSave
} from "react-icons/fi";
import Header from "../../components/Header";

const Course = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([
    { 
      name: "Introduction", 
      content: "Welcome to the course! This module will cover the basics." 
    }
  ]);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      // Reset form when opening modal
      setCourseName("");
      setDescription("");
      setImage(null);
      setModules([{ name: "Introduction", content: "" }]);
    }
  };

  const toggleCourseModal = (course) => {
    setSelectedCourse(course);
    setIsCourseModalOpen(!isCourseModalOpen);
  };

  const toggleModuleExpand = (index) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vqohpgdn");
    formData.append("cloud_name", "dcigsqglj");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dcigsqglj/image/upload",
        formData
      );
      setImage(response.data.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addNewModule = () => {
    setModules([...modules, { name: "", content: "" }]);
    setActiveModuleIndex(modules.length);
    setExpandedModules(prev => ({ ...prev, [modules.length]: true }));
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index][field] = value;
    setModules(updatedModules);
  };

  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = modules.filter((_, i) => i !== index);
      setModules(updatedModules);
      setActiveModuleIndex(Math.min(activeModuleIndex, updatedModules.length - 1));
    } else {
      alert("A course must have at least one module.");
    }
  };

  const submitCourse = async () => {
    if (!courseName || !description || !image) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    const courseData = {
      courseName,
      description,
      image,
      modules
    };

    try {
      await axios.post("http://localhost:8000/course/createCourse", courseData);
      alert("Course added successfully!");
      toggleModal();
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("http://localhost:8000/course/allCourses");
      setCourses(data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.post(`http://localhost:8000/course/delete`, { courseId });
        alert("Course deleted successfully!");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleQuiz = (id) => {
    localStorage.setItem("courseID", JSON.stringify(id));
    navigate("/quiz");
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleModal}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center space-x-2"
          >
            <FiPlus />
            <span>Add New Course</span>
          </motion.button>
        </div>

        {isLoading && courses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.courseName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white">{course.courseName}</h3>
                    <p className="text-purple-200 text-sm line-clamp-1">{course.description}</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {course.modules?.length || 0} Modules
                    </span>
                    <span className="text-sm text-gray-600">
                      {course.quizes?.length || 0} Quizzes
                    </span>
                  </div>
                  
                  <div className="flex justify-between space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCourseModal(course)}
                      className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-1"
                    >
                      <FiEye size={16} />
                      <span>View</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuiz(course._id)}
                      className="flex-1 bg-purple-100 text-purple-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-1"
                    >
                      <FiPlus size={16} />
                      <span>Quiz</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteCourse(course._id)}
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
            <p className="text-gray-500">No courses available. Create your first course!</p>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create New Course</h2>
                  <button onClick={toggleModal} className="text-gray-500 hover:text-gray-700">
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Course Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Thumbnail
                    </label>
                    <div className="flex items-center space-x-4">
                      {image ? (
                        <div className="relative">
                          <img src={image} alt="Course thumbnail" className="w-32 h-32 object-cover rounded-lg" />
                          <button
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg w-32 h-32 flex items-center justify-center">
                          <FiUpload className="text-gray-400" size={24} />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="course-thumbnail"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0])}
                          className="hidden"
                        />
                        <label
                          htmlFor="course-thumbnail"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          {image ? "Change" : "Upload"} Image
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 800x450px</p>
                      </div>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="e.g. Advanced Web Development"
                    />
                  </div>

                  {/* Course Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Brief description of what students will learn"
                    />
                  </div>

                  {/* Course Modules */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Course Modules *
                      </label>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addNewModule}
                        className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-lg flex items-center space-x-1"
                      >
                        <FiPlus size={14} />
                        <span>Add Module</span>
                      </motion.button>
                    </div>

                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                            onClick={() => toggleModuleExpand(index)}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">
                                Module {index + 1}: {module.name || "Untitled Module"}
                              </span>
                            </div>
                            {expandedModules[index] ? <FiChevronUp /> : <FiChevronDown />}
                          </div>
                          
                          <AnimatePresence>
                            {expandedModules[index] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-3 pb-3"
                              >
                                <div className="mt-3">
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Module Name
                                  </label>
                                  <input
                                    type="text"
                                    value={module.name}
                                    onChange={(e) => updateModule(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                                    placeholder="e.g. Introduction to React"
                                  />
                                </div>
                                
                                <div className="mt-3">
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Module Content
                                  </label>
                                  <textarea
                                    value={module.content}
                                    onChange={(e) => updateModule(index, 'content', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                                    placeholder="Detailed content for this module..."
                                  />
                                </div>
                                
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => removeModule(index)}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1"
                                  >
                                    <FiTrash2 size={12} />
                                    <span>Remove Module</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
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
                  onClick={submitCourse}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      <span>Save Course</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Details Modal */}
      <AnimatePresence>
        {isCourseModalOpen && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && toggleCourseModal(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedCourse.courseName}</h2>
                  <button onClick={() => toggleCourseModal(null)} className="text-gray-500 hover:text-gray-700">
                    <FiX size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <img 
                    src={selectedCourse.image} 
                    alt={selectedCourse.courseName} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-700">{selectedCourse.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Modules ({selectedCourse.modules?.length || 0})</h3>
                    <div className="mt-2 space-y-2">
                      {selectedCourse.modules?.map((module, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-800">
                            Module {index + 1}: {module.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{module.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCourse.quizes?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Quizzes ({selectedCourse.quizes.length})</h3>
                      <div className="mt-2 space-y-2">
                        {selectedCourse.quizes.map((quiz) => (
                          <div key={quiz._id} className="p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800">{quiz.quizName}</h4>
                            <p className="mt-1 text-sm text-gray-600">{quiz.questions?.length || 0} questions</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
                <button
                  onClick={() => handleQuiz(selectedCourse._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <FiPlus size={16} />
                  <span>Add Quiz</span>
                </button>
                <button
                  onClick={() => toggleCourseModal(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Course;