const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

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

module.exports = router;
