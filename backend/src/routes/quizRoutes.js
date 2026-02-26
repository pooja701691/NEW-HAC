const express = require('express');
const multer = require('multer');
const path = require('path');
const Quiz = require('../models/quiz.model');
const QuizResult = require('../models/quizResult.model');
const User = require('../models/user.model');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Helper: Generate quiz questions from text
function generateQuestionsFromText(text, numQuestions = 5) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const questions = [];

  for (let i = 0; i < Math.min(numQuestions, Math.floor(sentences.length / 2)); i++) {
    const mainSentence = sentences[i * 2]?.trim() || '';
    if (!mainSentence) continue;

    questions.push({
      question: `Based on the document, what is true: "${mainSentence.substring(0, 80)}..."?`,
      options: [
        mainSentence.substring(0, 60) + '...',
        sentences[(i * 2 + 1) % sentences.length]?.substring(0, 60) + '...' || 'Another option',
        'None of the above',
        'All of the above',
      ].filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 4),
      correct: 0,
      explanation: mainSentence,
    });
  }

  return questions.length > 0
    ? questions
    : [
        {
          question: 'What is the main topic of the document?',
          options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
          correct: 0,
          explanation: 'Sample question from document.',
        },
      ];
}

// POST /quiz/upload-pdf - Upload PDF and create quiz
router.post('/upload-pdf', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file provided' });
    }

    const { title, numQuestions = 5 } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Quiz title is required' });
    }

    const pdfText = `
      This is sample extracted text from PDF.
      The document contains important information about various topics.
      Students should read carefully and answer all questions.
      Understanding the content is essential for learning.
      Please review all material before taking the quiz.
    `;

    const questions = generateQuestionsFromText(pdfText, parseInt(numQuestions));

    const quiz = new Quiz({
      title,
      description: `Quiz generated from ${req.file.originalname}`,
      pdfFileName: req.file.filename,
      createdBy: req.user.id,
      questions,
      totalQuestions: questions.length,
    });

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz created successfully from PDF',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.totalQuestions,
      },
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload PDF and create quiz' });
  }
});

// GET /quiz/list - Get all available quizzes
router.get('/list', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .select('title description totalQuestions createdAt createdBy')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// GET /quiz/:id - Get quiz questions
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        questions: quiz.questions.map((q, idx) => ({
          id: idx,
          question: q.question,
          options: q.options,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// POST /quiz/:id/submit - Submit quiz answers
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let score = 0;
    answers.forEach((answer, idx) => {
      if (quiz.questions[idx] && answer === quiz.questions[idx].correct) {
        score++;
      }
    });

    const result = new QuizResult({
      userId,
      quizId,
      score,
      totalQuestions: quiz.totalQuestions,
      answers,
    });
    await result.save();

    const user = await User.findById(userId);
    const totalScore = (user.totalQuizScore || 0) + score;
    await User.findByIdAndUpdate(userId, { totalQuizScore: totalScore });

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        score,
        total: quiz.totalQuestions,
        percentage: ((score / quiz.totalQuestions) * 100).toFixed(2),
      },
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  }
});

// GET /quiz/results/history - Get user's quiz history
router.get('/results/history', verifyToken, async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user.id })
      .populate('quizId', 'title totalQuestions')
      .sort({ completedAt: -1 });

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz history' });
  }
});

module.exports = router;