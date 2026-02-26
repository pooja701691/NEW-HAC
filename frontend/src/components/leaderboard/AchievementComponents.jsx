import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Zap, Flame, Target, Crown, Shield, Sword, Heart, Gem } from 'lucide-react';

const AchievementBadge = ({ achievement, size = 40, showTooltip = true }) => {
  const getAchievementIcon = (achievement) => {
    const iconMap = {
      'Attendance Champion': Shield,
      'Score Master': Crown,
      'Quiz Warrior': Sword,
      'Perfectionist': Star,
      'Speed Demon': Zap,
      'Streak Master': Flame,
      'Consistent Learner': Target,
      'Top Performer': Trophy,
      'Rising Star': Gem,
      'Dedicated Student': Heart,
    };

    return iconMap[achievement.name] || Star;
  };

  const getAchievementColor = (achievement) => {
    const colorMap = {
      'Attendance Champion': 'from-blue-400 to-blue-600',
      'Score Master': 'from-yellow-400 to-yellow-600',
      'Quiz Warrior': 'from-red-400 to-red-600',
      'Perfectionist': 'from-purple-400 to-purple-600',
      'Speed Demon': 'from-orange-400 to-orange-600',
      'Streak Master': 'from-pink-400 to-pink-600',
      'Consistent Learner': 'from-green-400 to-green-600',
      'Top Performer': 'from-indigo-400 to-indigo-600',
      'Rising Star': 'from-cyan-400 to-cyan-600',
      'Dedicated Student': 'from-rose-400 to-rose-600',
    };

    return colorMap[achievement.name] || 'from-gray-400 to-gray-600';
  };

  const IconComponent = getAchievementIcon(achievement);
  const colorClass = getAchievementColor(achievement);

  return (
    <div className="relative group">
      <motion.div
        className={`w-${size/10} h-${size/10} rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center shadow-lg border-2 border-white/20`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconComponent size={size * 0.6} className="text-white drop-shadow-sm" />
      </motion.div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {achievement.name}
        </div>
      )}
    </div>
  );
};

const AchievementGrid = ({ achievements, maxDisplay = 6 }) => {
  const displayAchievements = achievements.slice(0, maxDisplay);
  const remainingCount = achievements.length - maxDisplay;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayAchievements.map((achievement, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
        >
          <AchievementBadge achievement={achievement} size={32} />
        </motion.div>
      ))}
      {remainingCount > 0 && (
        <motion.div
          className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: displayAchievements.length * 0.1 }}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  );
};

export { AchievementBadge, AchievementGrid };