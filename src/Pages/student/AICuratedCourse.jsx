import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSend, 
  FiTrash2, 
  FiBook, 
  FiCheck, 
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiAward
} from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentHeader from '../../components/StudentHeader';

const AICuratedCourse = () => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    subject: "",
    focus_area: "",
    difficulty: "easy",
    units: 1
  });
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});

  const questions = [
    "What subject would you like to learn about?",
    "Any specific focus area within this subject?",
    "What difficulty level would you prefer? (easy, medium, hard)",
    "How many learning units would you like? (1-5)"
  ];

  useEffect(() => {
    // Initialize chat with first question
    setChatMessages([{ 
      type: "bot", 
      message: questions[0],
      step: 0 
    }]);
  }, []);

  // Toggle unit expansion
  const toggleUnit = (index) => {
    setExpandedUnits(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle user responses
  const handleUserResponse = (response) => {
    const updatedFormData = { ...formData };
    
    // Update form data based on current step
    switch(currentStep) {
      case 0: updatedFormData.subject = response; break;
      case 1: updatedFormData.focus_area = response; break;
      case 2: 
        updatedFormData.difficulty = response.toLowerCase();
        // Validate difficulty
        if (!["easy", "medium", "hard"].includes(updatedFormData.difficulty)) {
          setChatMessages(prev => [...prev, {
            type: "bot",
            message: "Please choose easy, medium, or hard",
            step: currentStep
          }]);
          return;
        }
        break;
      case 3: 
        const units = parseInt(response);
        if (isNaN(units) || units < 1 || units > 5) {
          setChatMessages(prev => [...prev, {
            type: "bot",
            message: "Please enter a number between 1 and 5",
            step: currentStep
          }]);
          return;
        }
        updatedFormData.units = units;
        break;
      default: break;
    }

    setFormData(updatedFormData);

    // Add user response to chat
    setChatMessages(prev => [
      ...prev,
      { type: "user", message: response, step: currentStep }
    ]);

    // Move to next step or submit
    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { type: "bot", message: questions[nextStep], step: nextStep }
        ]);
      }, 500);
    } else {
      submitCourseData(updatedFormData);
    }
  };

  // Generate course via API
  const submitCourseData = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-course",
        data
      );
      setCourseData(response.data);
      setChatMessages(prev => [
        ...prev,
        { 
          type: "bot", 
          message: "Here's your personalized course!",
          isCourse: true 
        }
      ]);
    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        { 
          type: "bot", 
          message: "Sorry, I couldn't generate your course. Please try again.",
          error: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Reset the entire conversation
  const resetConversation = () => {
    setChatMessages([{ 
      type: "bot", 
      message: questions[0],
      step: 0 
    }]);
    setCurrentStep(0);
    setFormData({
      subject: "",
      focus_area: "",
      difficulty: "easy",
      units: 1
    });
    setCourseData(null);
  };

  // View the generated course
  const handleViewCourse = () => {
    navigate('/generated-course', { state: { courseData } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI Course Generator
            </h1>
            <p className="text-gray-600">
              Get a personalized learning path created just for you
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Course Creation Assistant
              </h2>
            </div>
            
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                      msg.type === "bot" 
                        ? msg.error 
                          ? "bg-red-100 text-red-800"
                          : msg.isCourse
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.message}
                    
                    {/* Display generated course preview */}
                    {msg.isCourse && courseData && (
                      <div className="mt-3">
                        <h3 className="font-bold">{courseData.courseTitle}</h3>
                        <p className="text-sm mt-1">
                          {courseData.units.length} Units | {courseData.duration || 'Self-paced'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-blue-100 text-blue-800 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {!courseData ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.userMessage;
                  handleUserResponse(input.value.trim());
                  input.value = "";
                }}
                className="p-4 border-t border-gray-200 flex"
              >
                <input
                  type="text"
                  name="userMessage"
                  placeholder="Type your response..."
                  className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  <FiSend />
                </button>
                <button
                  type="button"
                  onClick={resetConversation}
                  className="ml-2 bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiTrash2 />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewCourse}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg shadow-md"
                >
                  View Full Course
                </motion.button>
              </div>
            )}
          </div>

          {/* Course Preview (when generated) */}
          {courseData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {courseData.courseTitle}
                </h2>
                <p className="text-gray-600 mb-4">
                  {courseData.courseDescription || "Your personalized learning path"}
                </p>
                
                <div className="space-y-4">
                  {courseData.units.map((unit, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleUnit(index)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                            {index + 1}
                          </span>
                          <h3 className="font-medium text-gray-800">{unit.unitTitle}</h3>
                        </div>
                        {expandedUnits[index] ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedUnits[index] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 pb-4"
                          >
                            <div className="mt-3">
                              <h4 className="font-medium text-gray-700 mb-2">Topics:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {unit.topics?.map((topic, i) => (
                                  <li key={i} className="text-gray-600">{topic}</li>
                                ))}
                              </ul>
                            </div>
                            
                            {unit.resources?.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-700 mb-2">Resources:</h4>
                                <ul className="space-y-2">
                                  {unit.resources.map((resource, i) => (
                                    <li key={i} className="text-blue-600 hover:underline">
                                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        {resource.title || `Resource ${i + 1}`}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {unit.assignment && (
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-700 mb-2">Assignment:</h4>
                                <p className="text-gray-600">{unit.assignment}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AICuratedCourse;