import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const Timer = ({ initialMinutes = 15, onExpire, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Color changes when time is running low
  const getTimeColor = () => {
    if (timeLeft < 60) return 'text-red-500';
    if (timeLeft < 180) return 'text-amber-500';
    return 'text-white';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <FiClock className={`${getTimeColor()}`} />
      <span className={`font-medium ${getTimeColor()}`}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;