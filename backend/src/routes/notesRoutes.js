const express = require('express');
const router = express.Router();

// Placeholder notes routes
router.post('/upload', (req, res) => {
  res.json({
    message: 'Document uploaded successfully',
    summary: {
      title: 'AI-Generated Summary',
      content: 'This is a summarized version of the uploaded document. The AI has analyzed the content and extracted key points.',
      keyPoints: [
        'Main concept 1',
        'Main concept 2',
        'Main concept 3'
      ]
    }
  });
});

router.get('/', (req, res) => {
  res.json({
    notes: [
      { id: 1, title: 'Sample Note', summary: 'Summary here' }
    ]
  });
});

module.exports = router;