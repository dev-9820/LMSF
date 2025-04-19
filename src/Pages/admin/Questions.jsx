import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiX, FiCheck, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import Header from "../../components/Header";

const Questions = () => {
  const quizId = JSON.parse(localStorage.getItem("quizID"));
  const [quizName, setQuizName] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAns: "",
  });
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const getQuiz = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/course/singleQuiz",
        { quizId }
      );
      setQuizName(data?.quiz?.quizName);
      setAllQuestions(data?.quiz?.questions || []);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const submitQuestion = async () => {
    // Validate all fields
    if (!questionData.question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (questionData.options.some(opt => !opt.trim())) {
      alert("Please fill in all options");
      return;
    }
    if (!questionData.correctAns.trim()) {
      alert("Please specify the correct answer");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/course/addQuestion", {
        quizId,
        question: questionData.question,
        option: questionData.options,
        correctAns: questionData.correctAns,
      });
      await getQuiz();
      setIsModalOpen(false);
      setQuestionData({
        question: "",
        options: ["", "", "", ""],
        correctAns: "",
      });
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.post(`http://localhost:8000/course/deleteQuestion`, { questionId });
        await getQuiz();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;
    setQuestionData(prev => ({ ...prev, options: updatedOptions }));
  };

  useEffect(() => {
    getQuiz();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Quiz: {quizName}</h1>
            <p className="text-gray-600">Manage questions for this quiz</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 mt-4 md:mt-0"
          >
            <FiPlus />
            <span>Add Question</span>
          </motion.button>
        </div>

        {isLoading && allQuestions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : allQuestions.length > 0 ? (
          <div className="space-y-4">
            {allQuestions.map((question, index) => (
              <div key={question._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div 
                  className="flex justify-between items-center p-6 cursor-pointer"
                  onClick={() => toggleQuestionExpand(index)}
                >
                  <h3 className="font-medium text-gray-800">
                    Q{index + 1}: {question.question}
                  </h3>
                  {expandedQuestions[index] ? <FiChevronDown className="transform rotate-180" /> : <FiChevronDown />}
                </div>
                
                <AnimatePresence>
                  {expandedQuestions[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6"
                    >
                      <div className="space-y-3">
                        {question.option.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center">
                            <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center 
                              ${question.correctAns === opt ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                              {question.correctAns === opt && <FiCheck size={12} />}
                            </div>
                            <span className={question.correctAns === opt ? 'font-medium text-green-600' : ''}>
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteQuestion(question._id)}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <FiTrash2 size={16} />
                          <span>Delete</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No questions available. Add your first question!</p>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Add New Question</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <textarea
                      value={questionData.question}
                      onChange={(e) => setQuestionData(prev => ({ ...prev, question: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Options *
                    </label>
                    <div className="space-y-3">
                      {questionData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"></div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    <select
                      value={questionData.correctAns}
                      onChange={(e) => setQuestionData(prev => ({ ...prev, correctAns: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Select correct answer</option>
                      {questionData.options.map((option, index) => (
                        <option 
                          key={index} 
                          value={option}
                          disabled={!option.trim()}
                        >
                          Option {index + 1}: {option || "(empty)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitQuestion}
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
                      <FiPlus size={16} />
                      <span>Add Question</span>
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

export default Questions;