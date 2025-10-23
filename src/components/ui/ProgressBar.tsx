
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 steampunk-border border-opacity-50 overflow-hidden">
      <div
        className="bg-gradient-to-r from-yellow-500 to-amber-400 h-2.5 rounded-full transition-all duration-500 ease-linear"
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
