const express = require('express');
const User = require('../models/user.model');
const QuizResult = require('../models/quizResult.model');
const Attendance = require('../models/attendance.model');

const router = express.Router();

// GET /leaderboard - Get top students by quiz scores
router.get('/', async (req, res) => {
  try {
    // Get top quiz performers
    const quizLeaderboard = await QuizResult.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          attemptCount: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalScore: 1,
          attemptCount: 1,
          avgScore: { $round: ['$avgScore', 2] },
        },
      },
    ]);

    // Get attendance leaderboard (students with most attendance)
    const attendanceLeaderboard = await Attendance.aggregate([
      {
        $group: {
          _id: '$userId',
          attendanceCount: { $sum: 1 },
          lastAttendance: { $max: '$timestamp' },
        },
      },
      { $sort: { attendanceCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          attendanceCount: 1,
          lastAttendance: 1,
        },
      },
    ]);

    res.json({
      success: true,
      quizLeaderboard: quizLeaderboard.map((u, idx) => ({
        rank: idx + 1,
        name: u.name,
        totalScore: u.totalScore,
        avgScore: u.avgScore,
        attempts: u.attemptCount,
      })),
      attendanceLeaderboard: attendanceLeaderboard.map((u, idx) => ({
        rank: idx + 1,
        name: u.name,
        attendanceCount: u.attendanceCount,
      })),
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// GET /leaderboard/rank - Get current user's rank and stats
router.get('/rank', async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming auth middleware sets req.user
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Get user's quiz stats
    const userQuizStats = await QuizResult.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          attemptCount: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
    ]);

    // Get user's attendance count
    const userAttendanceCount = await Attendance.countDocuments({ userId });

    // Get user's rank in quiz leaderboard
    const userRank = await QuizResult.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
        },
      },
      { $sort: { totalScore: -1 } },
      {
        $group: {
          _id: null,
          users: { $push: { userId: '$_id', totalScore: '$totalScore' } },
        },
      },
      {
        $project: {
          users: 1,
        },
      },
    ]);

    let rank = null;
    if (userRank.length > 0) {
      const userIndex = userRank[0].users.findIndex(u => u.userId.toString() === userId.toString());
      rank = userIndex + 1;
    }

    const quizStats = userQuizStats[0] || { totalScore: 0, attemptCount: 0, avgScore: 0 };

    res.json({
      success: true,
      rank,
      totalScore: quizStats.totalScore,
      avgScore: Math.round(quizStats.avgScore * 100) / 100,
      attempts: quizStats.attemptCount,
      attendanceCount: userAttendanceCount,
    });
  } catch (err) {
    console.error('User rank error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user rank' });
  }
});

module.exports = router;