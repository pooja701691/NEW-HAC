import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';

const StreakIndicator = ({ streakCount, type = 'attendance', size = 'normal' }) => {
  const sizeClasses = {
    small: {
      container: 'w-8 h-8',
      icon: 16,
      text: 'text-xs',
    },
    normal: {
      container: 'w-12 h-12',
      icon: 20,
      text: 'text-sm',
    },
    large: {
      container: 'w-16 h-16',
      icon: 24,
      text: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  const getStreakColor = (count) => {
    if (count >= 30) return 'from-purple-500 to-pink-500';
    if (count >= 14) return 'from-red-500 to-orange-500';
    if (count >= 7) return 'from-orange-500 to-yellow-500';
    if (count >= 3) return 'from-yellow-500 to-green-500';
    return 'from-gray-500 to-gray-600';
  };

  const getStreakIcon = (type) => {
    switch (type) {
      case 'attendance':
        return Calendar;
      case 'quiz':
        return TrendingUp;
      default:
        return Flame;
    }
  };

  const IconComponent = getStreakIcon(type);
  const colorClass = getStreakColor(streakCount);

  if (streakCount === 0) return null;

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className={`relative ${classes.container} rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center shadow-lg border-2 border-white/20`}>
        <IconComponent size={classes.icon} className="text-white" />
        {streakCount >= 7 && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Flame size={8} className="text-white" />
          </motion.div>
        )}
      </div>
      <div className="text-white">
        <div className={`font-bold ${classes.text}`}>{streakCount}</div>
        <div className={`text-white/70 ${classes.text} capitalize`}>{type} streak</div>
      </div>
    </motion.div>
  );
};

const StreakGrid = ({ streaks }) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {streaks.map((streak, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <StreakIndicator
            streakCount={streak.count}
            type={streak.type}
            size="normal"
          />
        </motion.div>
      ))}
    </div>
  );
};

export { StreakIndicator, StreakGrid };