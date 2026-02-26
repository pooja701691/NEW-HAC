const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userroutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const quizRoutes = require('./routes/quizRoutes');
const notesRoutes = require('./routes/notesRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const classroomRoutes = require('./routes/classroomRoutes');

require('dotenv').config();

const app = express();

// Connect to database


app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/classrooms', classroomRoutes);

module.exports = app;
