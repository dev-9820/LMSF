import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHome, 
  FiBook, 
  FiAward,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

const StudentHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/home", icon: <FiHome />, text: "Home" },
    { to: "/courses", icon: <FiBook />, text: "All Courses" },
    { to: "/enrolled", icon: <FiBook />, text: "My Courses" },
    { to: "/profile", icon: <FiUser />, text: "Profile" },
    { to: "/aiCourse", icon: <FiCheckCircle />, text: "Generate A Course" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <Link to="/courses" className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                Edu<span className="text-amber-300">Spark</span>
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.to}
                  className="flex items-center px-4 py-2 text-white hover:text-amber-300 transition-colors rounded-lg"
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.text}
                </Link>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center ml-2 bg-amber-400 hover:bg-amber-500 text-indigo-900 font-medium px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              <FiLogOut className="mr-2" />
              Logout
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-4 space-y-1">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.to}
                    whileHover={{ scale: 1.02 }}
                    className="block px-3 py-2 rounded-md text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Link
                      to={link.to}
                      className="flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.text}
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-indigo-900 bg-amber-400 hover:bg-amber-500 font-medium transition-colors"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default StudentHeader;