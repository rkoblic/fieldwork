const fs = require('fs').promises;
const path = require('path');
const claudeService = require('./claude');

async function synthesize(framework, institution, employer, student) {
  // Check if this matches a demo combination
  const demoKey = `${institution.id}-${employer.id}-${student.id}`;
  const demoPath = path.join(__dirname, `../../data/outputs/${demoKey}.json`);

  try {
    // Try to load pre-generated output if IDs match demo data
    await fs.access(demoPath);
    const data = await fs.readFile(demoPath, 'utf8');
    return JSON.parse(data);
  } catch {
    // No demo match, call Claude API
    return await claudeService.synthesize(framework, institution, employer, student);
  }
}

module.exports = { synthesize };
