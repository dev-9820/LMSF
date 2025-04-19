import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiClock, FiArrowRight, FiX } from "react-icons/fi";
import axios from "axios";
import StudentHeader from "../../components/StudentHeader";
import { useNavigate } from "react-router-dom";

const SingleQuiz = () => {
  const navigate = useNavigate();
  const quizId = JSON.parse(localStorage.getItem("userQuiz"));
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleAutoSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);

  const getSingleQuiz = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/course/singleQuiz",
        { quizId }
      );
      setQuiz(data?.quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSingleQuiz();
  }, []);

  const handleOptionSelect = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: prev[questionId] === option ? null : option // Toggle selection
    }));
  };

  const handleAutoSubmit = async () => {
    setTimerActive(false);
    await calculateScore();
  };

  const calculateScore = async () => {
    if (!quiz) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question._id] === question.correctAns) {
        correctAnswers += 1;
      }
    });

    const percentageScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(percentageScore);

    try {
      await axios.post("http://localhost:8000/results/save", {
        title: quiz.quizName,
        score: percentageScore,
        timeTaken: 600 - timeLeft, // Time taken in seconds
        userId,
      });
    } catch (error) {
      console.error("Error saving results:", error);
    }

    setShowResults(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTimerActive(false);
    await calculateScore();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Quiz Header with Timer */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {quiz.quizName}
          </h1>
          <div className={`flex items-center px-4 py-2 rounded-lg ${
            timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <FiClock className="mr-2" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  {index + 1}. {question.question}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.option.map((opt, optIndex) => (
                    <div key={optIndex} className="relative">
                      <input
                        type="radio"
                        id={`${question._id}-${optIndex}`}
                        name={question._id}
                        checked={selectedAnswers[question._id] === opt}
                        onChange={() => handleOptionSelect(question._id, opt)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`${question._id}-${optIndex}`}
                        className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAnswers[question._id] === opt
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            selectedAnswers[question._id] === opt
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-gray-400'
                          }`}>
                            {selectedAnswers[question._id] === opt && <FiCheck size={14} />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg shadow-md flex items-center"
            >
              Submit Quiz
              <FiArrowRight className="ml-2" />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="p-6 text-center">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowResults(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Quiz Completed!
                  </h2>
                  <p className="text-gray-600">
                    You answered {Object.keys(selectedAnswers).filter(
                      qId => selectedAnswers[qId] === quiz.questions.find(q => q._id === qId)?.correctAns
                    ).length} out of {quiz.questions.length} questions correctly
                  </p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                  <div 
                    className={`h-4 rounded-full ${
                      score >= 70 ? 'bg-green-500' : 
                      score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>

                <p className="text-3xl font-bold mb-6">
                  <span className={
                    score >= 70 ? 'text-green-600' : 
                    score >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    {score}%
                  </span>
                </p>

                <div className="flex justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/enrolled")}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg"
                  >
                    Back to Courses
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAnswers({});
                      setScore(null);
                      setShowResults(false);
                      setTimeLeft(600);
                      setTimerActive(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg"
                  >
                    Retake Quiz
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SingleQuiz;