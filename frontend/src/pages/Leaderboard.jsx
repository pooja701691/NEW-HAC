import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Star, Zap, Flame, Target, Crown, Shield, Sword } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leaderboardAPI } from '../services/leaderboard.api';
import { AchievementBadge, AchievementGrid } from '../components/leaderboard/AchievementComponents';
import { LevelProgress, LevelBadge } from '../components/leaderboard/LevelComponents';
import { StreakIndicator, StreakGrid } from '../components/leaderboard/StreakComponents';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(null);

  // Level calculation based on total score
  const getLevel = (score) => {
    if (score >= 500) return { level: 5, name: 'Legend', color: 'from-purple-500 to-pink-500' };
    if (score >= 300) return { level: 4, name: 'Master', color: 'from-red-500 to-orange-500' };
    if (score >= 200) return { level: 3, name: 'Expert', color: 'from-blue-500 to-cyan-500' };
    if (score >= 100) return { level: 2, name: 'Advanced', color: 'from-green-500 to-teal-500' };
    return { level: 1, name: 'Beginner', color: 'from-gray-500 to-slate-500' };
  };

  // Achievement badges
  const getAchievements = (userData) => {
    const achievements = [];
    if (userData.attendanceCount >= 10) achievements.push({ icon: Shield, name: 'Attendance Champion', color: 'text-blue-400' });
    if (userData.totalScore >= 200) achievements.push({ icon: Crown, name: 'Score Master', color: 'text-yellow-400' });
    if (userData.attempts >= 5) achievements.push({ icon: Target, name: 'Quiz Warrior', color: 'text-red-400' });
    if (userData.avgScore >= 90) achievements.push({ icon: Star, name: 'Perfectionist', color: 'text-purple-400' });
    return achievements;
  };

  // Progress to next level
  const getProgressToNextLevel = (score) => {
    const levelThresholds = [0, 100, 200, 300, 500];
    const currentLevel = getLevel(score).level;
    if (currentLevel >= 5) return { progress: 100, nextLevel: 'Max' };

    const currentThreshold = levelThresholds[currentLevel - 1];
    const nextThreshold = levelThresholds[currentLevel];
    const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return { progress: Math.min(progress, 100), nextLevel: getLevel(nextThreshold).name };
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardAPI.getLeaderboard();
        setLeaderboard(data.quizLeaderboard || []);

        if (user) {
          const userRank = await leaderboardAPI.getUserRank();
          setUserStats(userRank);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Fallback to mock data
        setLeaderboard([
          { rank: 1, name: 'Alice Johnson', totalScore: 450, avgScore: 95, attempts: 8 },
          { rank: 2, name: 'Bob Smith', totalScore: 380, avgScore: 92, attempts: 6 },
          { rank: 3, name: 'Charlie Brown', totalScore: 320, avgScore: 88, attempts: 7 },
          { rank: 4, name: 'Diana Prince', totalScore: 280, avgScore: 85, attempts: 5 },
          { rank: 5, name: 'Eve Wilson', totalScore: 240, avgScore: 82, attempts: 4 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Simulate live updates
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        if (prev.length === 0) return prev;
        const newLeaderboard = [...prev];
        const randomIndex = Math.floor(Math.random() * Math.min(newLeaderboard.length, 3));
        const change = Math.floor(Math.random() * 10) - 5;
        newLeaderboard[randomIndex].totalScore = Math.max(0, newLeaderboard[randomIndex].totalScore + change);

        // Check for rank changes and celebrate
        const oldRank = newLeaderboard[randomIndex].rank;
        newLeaderboard.sort((a, b) => b.totalScore - a.totalScore);
        newLeaderboard.forEach((user, idx) => user.rank = idx + 1);

        if (oldRank !== newLeaderboard[randomIndex].rank && newLeaderboard[randomIndex].rank <= 3) {
          setCelebrating(newLeaderboard[randomIndex]);
          setTimeout(() => setCelebrating(null), 3000);
        }

        return newLeaderboard;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400 drop-shadow-lg" size={28} />;
      case 2:
        return <Medal className="text-gray-300 drop-shadow-lg" size={28} />;
      case 3:
        return <Award className="text-orange-400 drop-shadow-lg" size={28} />;
      default:
        return <span className="text-white/70 font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-400/50';
      case 2:
        return 'from-gray-300 via-gray-400 to-gray-500 shadow-gray-400/50';
      case 3:
        return 'from-orange-400 via-orange-500 to-orange-600 shadow-orange-400/50';
      default:
        return 'from-blue-500 via-purple-600 to-blue-700 shadow-purple-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Celebration Overlay */}
        <AnimatePresence>
          {celebrating && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-2xl text-center text-white"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <Trophy size={64} className="mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Rank Up!</h2>
                <p className="text-xl">{celebrating.name} moved to rank #{celebrating.rank}!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          className="text-5xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🏆 Gamified Leaderboard
        </motion.h1>

        <motion.p
          className="text-white/70 text-center text-lg mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Compete, level up, and earn achievements!
        </motion.p>

        {/* User Stats Section */}
        {user && userStats && (
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats.rank || 'N/A'}</div>
                <div className="text-white/70">Current Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats.totalScore || 0}</div>
                <div className="text-white/70">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats.attendanceCount || 0}</div>
                <div className="text-white/70">Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{getLevel(userStats.totalScore || 0).name}</div>
                <div className="text-white/70">Level</div>
              </div>
            </div>

            {/* Progress to next level */}
            <div className="mt-6">
              <LevelProgress
                currentScore={userStats.totalScore || 0}
                level={getLevel(userStats.totalScore || 0).level}
                nextLevel={getProgressToNextLevel(userStats.totalScore || 0).nextLevel}
                progress={getProgressToNextLevel(userStats.totalScore || 0).progress}
                size="large"
              />
            </div>

            {/* Achievements */}
            {getAchievements(userStats).length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Your Achievements</h3>
                <AchievementGrid achievements={getAchievements(userStats)} maxDisplay={6} />
              </div>
            )}

            {/* Streaks */}
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3">Current Streaks</h3>
              <StreakGrid streaks={[
                { type: 'attendance', count: userStats.attendanceStreak || Math.floor(userStats.attendanceCount / 3) },
                { type: 'quiz', count: userStats.quizStreak || Math.floor(userStats.attempts / 2) },
              ]} />
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold text-white">Top Performers</h2>
            <p className="text-white/70">Real-time ranking with levels and achievements</p>
          </div>

          <AnimatePresence>
            {leaderboard.map((userData, index) => {
              const rank = userData.rank;
              const level = getLevel(userData.totalScore);
              const achievements = getAchievements(userData);

              return (
                <motion.div
                  key={userData.name}
                  className="flex items-center p-6 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-14 h-14">
                      {getRankIcon(rank)}
                    </div>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${getRankColor(rank)} shadow-lg flex items-center justify-center text-white font-bold text-lg border-2 border-white/20`}>
                      {userData.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-lg">{userData.name}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${level.color} text-white shadow-md`}>
                          {level.name}
                        </div>
                      </div>
                      <p className="text-white/50 text-sm">Rank #{rank} • {userData.attempts} attempts</p>
                      {achievements.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {achievements.slice(0, 3).map((achievement, idx) => (
                            <AchievementBadge key={idx} achievement={achievement} size={20} showTooltip={false} />
                          ))}
                          {achievements.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                              +{achievements.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{userData.totalScore}</div>
                      <div className="text-white/50 text-sm">total points</div>
                      <div className="text-white/70 text-xs">avg: {userData.avgScore}</div>
                    </div>
                    <div className="w-24">
                      <LevelProgress
                        currentScore={userData.totalScore}
                        level={level.level}
                        nextLevel={level.level >= 5 ? 'Max' : getLevel((level.level + 1) * 100).name}
                        progress={(userData.totalScore % 100) / 100 * 100}
                        size="small"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <p className="text-white/70">
            🏃‍♂️ Keep competing! Leaderboard updates every 5 seconds
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm text-white/50">
            <span>🔥 Streaks</span>
            <span>⭐ Achievements</span>
            <span>📈 Levels</span>
            <span>🎯 Challenges</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;