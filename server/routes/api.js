const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
// Note: pdf-parse is loaded lazily in the route handler to avoid
// initialization issues in Vercel serverless environment

const dataDir = path.join(__dirname, '../../data');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, DOC, or DOCX.'));
    }
  }
});

// Helper to load JSON data
async function loadData(filename) {
  const filePath = path.join(dataDir, filename);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Static data endpoints
router.get('/data/framework', async (req, res) => {
  try {
    const data = await loadData('framework.json');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load framework data' });
  }
});

router.get('/data/institutions', async (req, res) => {
  try {
    const data = await loadData('institutions.json');
    res.json(data.institutions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load institutions data' });
  }
});

router.get('/data/employers', async (req, res) => {
  try {
    const data = await loadData('employers.json');
    res.json(data.employers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load employers data' });
  }
});

router.get('/data/students', async (req, res) => {
  try {
    const data = await loadData('students.json');
    res.json(data.students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load students data' });
  }
});

// Demo synthesis - load pre-generated output
router.get('/synthesis/demo/:key', async (req, res) => {
  try {
    const filePath = path.join(dataDir, `outputs/${req.params.key}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Synthesis output not found' });
  }
});

// Custom synthesis - call Claude API
router.post('/synthesis/custom', async (req, res) => {
  try {
    const synthesisService = require('../services/synthesis');
    const { framework, institution, employer, student } = req.body;
    const result = await synthesisService.synthesize(framework, institution, employer, student);
    res.json(result);
  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({
      error: 'Synthesis failed',
      message: error.message
    });
  }
});

// Progressive synthesis phase endpoints
const synthesisPhases = require('../services/synthesis-phases');

// Phase 1: Generate Learning Objectives
router.post('/synthesis/phase/objectives', async (req, res) => {
  try {
    const { framework, institution, employer, student } = req.body;
    const result = await synthesisPhases.generateObjectives(framework, institution, employer, student);
    res.json(result);
  } catch (error) {
    console.error('Phase 1 (objectives) error:', error);
    res.status(500).json({
      error: 'Failed to generate objectives',
      message: error.message,
      phase: 'objectives'
    });
  }
});

// Phase 2: Generate Assessment
router.post('/synthesis/phase/assessment', async (req, res) => {
  try {
    const { framework, institution, employer, student, objectives } = req.body;
    const result = await synthesisPhases.generateAssessment(framework, institution, employer, student, objectives);
    res.json(result);
  } catch (error) {
    console.error('Phase 2 (assessment) error:', error);
    res.status(500).json({
      error: 'Failed to generate assessment',
      message: error.message,
      phase: 'assessment'
    });
  }
});

// Phase 3: Generate Curriculum
router.post('/synthesis/phase/curriculum', async (req, res) => {
  try {
    const { framework, institution, employer, student, objectives, assessmentSummary } = req.body;
    const result = await synthesisPhases.generateCurriculum(framework, institution, employer, student, objectives, assessmentSummary);
    res.json(result);
  } catch (error) {
    console.error('Phase 3 (curriculum) error:', error);
    res.status(500).json({
      error: 'Failed to generate curriculum',
      message: error.message,
      phase: 'curriculum'
    });
  }
});

// Phase 4: Generate Sample Week
router.post('/synthesis/phase/sample-week', async (req, res) => {
  try {
    const { framework, institution, employer, student, objectives, baseWeek } = req.body;
    const result = await synthesisPhases.generateSampleWeek(framework, institution, employer, student, objectives, baseWeek);
    res.json(result);
  } catch (error) {
    console.error('Phase 4 (sample-week) error:', error);
    res.status(500).json({
      error: 'Failed to generate sample week',
      message: error.message,
      phase: 'sample-week'
    });
  }
});

// Phase 5: Generate Alignment
router.post('/synthesis/phase/alignment', async (req, res) => {
  try {
    const { framework, institution, employer, student, objectives, assessmentSummary, curriculumSummary } = req.body;
    const result = await synthesisPhases.generateAlignment(framework, institution, employer, student, objectives, assessmentSummary, curriculumSummary);
    res.json(result);
  } catch (error) {
    console.error('Phase 5 (alignment) error:', error);
    res.status(500).json({
      error: 'Failed to generate alignment',
      message: error.message,
      phase: 'alignment'
    });
  }
});

// Resume upload and skill extraction
router.post('/resume/extract-skills', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded', message: 'Please upload a resume file' });
    }

    let textContent = '';

    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(req.file.buffer);
      textContent = pdfData.text;
    } else {
      // For DOC/DOCX, extract basic text (simplified - in production use mammoth or similar)
      textContent = req.file.buffer.toString('utf8').replace(/[^\x20-\x7E\n]/g, ' ');
    }

    if (!textContent || textContent.trim().length < 50) {
      return res.status(400).json({
        error: 'Could not extract text',
        message: 'Unable to extract enough text from the resume. Please try a different file.'
      });
    }

    // Call Claude to extract full profile from resume
    const claudeService = require('../services/claude');
    const profile = await claudeService.extractProfileFromResume(textContent);

    res.json({
      ...profile,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Resume extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract skills',
      message: error.message || 'An error occurred while processing the resume'
    });
  }
});

module.exports = router;
