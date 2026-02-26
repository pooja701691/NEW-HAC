import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';

const LevelProgress = ({ currentScore, level, nextLevel, progress, size = 'normal' }) => {
  const sizeClasses = {
    small: {
      container: 'h-2',
      star: 16,
      text: 'text-xs',
    },
    normal: {
      container: 'h-3',
      star: 20,
      text: 'text-sm',
    },
    large: {
      container: 'h-4',
      star: 24,
      text: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  const levelColors = {
    1: 'from-gray-400 to-gray-600',
    2: 'from-green-400 to-green-600',
    3: 'from-blue-400 to-blue-600',
    4: 'from-red-400 to-red-600',
    5: 'from-purple-400 to-purple-600',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${levelColors[level]} flex items-center justify-center`}>
            <Star size={14} className="text-white" />
          </div>
          <span className={`text-white font-semibold ${classes.text}`}>Level {level}</span>
        </div>
        {nextLevel !== 'Max' && (
          <div className="flex items-center gap-2">
            <span className={`text-white/70 ${classes.text}`}>{nextLevel}</span>
            <ChevronRight size={14} className="text-white/50" />
          </div>
        )}
      </div>

      <div className={`w-full bg-white/20 rounded-full ${classes.container} overflow-hidden`}>
        <motion.div
          className={`bg-gradient-to-r ${levelColors[level]} ${classes.container} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      <div className="flex justify-between mt-1">
        <span className={`text-white/60 ${classes.text}`}>{currentScore} pts</span>
        <span className={`text-white/60 ${classes.text}`}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const LevelBadge = ({ level, name, color, size = 'normal' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    normal: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-lg',
  };

  return (
    <motion.div
      className={`rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20 ${sizeClasses[size]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-center">
        <div className="leading-none">{level}</div>
        {size !== 'small' && (
          <div className="text-xs leading-none mt-0.5">{name}</div>
        )}
      </div>
    </motion.div>
  );
};

export { LevelProgress, LevelBadge };