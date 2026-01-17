const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function synthesize(framework, institution, employer, student) {
  const systemPrompt = buildSystemPrompt(framework);
  const userPrompt = buildUserPrompt(institution, employer, student);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });

  // Parse the structured JSON response
  const content = response.content[0].text;

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  return JSON.parse(jsonStr.trim());
}

function buildSystemPrompt(framework) {
  return `You are an expert instructional designer specializing in experiential learning. Your task is to synthesize a personalized learning experience based on four inputs: a pedagogical framework, institutional requirements, an employer project, and a student profile.

You must respond with a valid JSON object matching the exact structure specified. Do not include any text outside the JSON.

FIELDWORK FRAMEWORK (use these elements in your design):
${JSON.stringify(framework, null, 2)}

OUTPUT REQUIREMENTS:
- Generate 5-7 learning objectives, each mapped to a NACE competency with full traceability
- Create a week-by-week curriculum matching the institution's term length
- Each week must include activities across all four Kolb phases
- Include DEAL reflection prompts for each week
- Design an assessment strategy with specific deliverables and criteria
- For the FIRST deliverable only, include a detailed rubric with:
  - gradingType: "letter-grade" if institution.assessmentApproach is "Letter Grade", otherwise "pass-fail"
  - performanceLevels: For letter-grade use [exemplary/A, proficient/B, developing/C, beginning/D-F]. For pass-fail use [exceeds/Pass (Distinction), meets/Pass, approaching/Conditional, not-yet/Not Pass]
  - 6 criteria covering methodology, data quality, analysis, communication, critical thinking, and professional quality
  - Each criterion has: name, weight (percentages totaling 100%), objectivesMapped (array of obj-N), descriptors (object with descriptor text for each performance level)
- Provide a detailed sample week (Week 4 or appropriate mid-term week)
- Create an alignment crosswalk showing connections to all four inputs
- For sampleWeek: include objectiveIds array mapping to main learningObjectives, naceCompetencyFocus as array, and add 2-3 curated resources to the conceptualization activity (types: article, video, ai-generated with personalized content for the student)

Respond ONLY with valid JSON matching this structure (no markdown, no explanation):
{
  "metadata": { "institutionId": "string", "employerId": "string", "studentId": "string", "generatedAt": "ISO date string", "termLengthWeeks": number },
  "learningObjectives": [ { "id": "obj-N", "text": "string", "naceCompetency": "competency-id", "traceability": { "employerNeed": "string", "studentGoal": "string", "institutionalOutcome": "string" } } ],
  "curriculum": { "weeks": [ { "weekNumber": number, "theme": "string", "objectives": ["string"], "activities": [ { "description": "string", "hours": number, "kolbPhase": "experience|reflection|conceptualization|experimentation" } ], "deliverables": ["string"], "dealReflection": { "describe": "string", "examine": "string", "articulate": "string" }, "naceCompetencyFocus": ["competency-id"] } ] },
  "assessment": { "overview": "string", "weights": { "deliverables": 40, "presentation": 20, "reflections": 25, "employerEvaluation": 15 }, "deliverables": { "description": "string", "items": [ { "name": "string", "dueWeek": number, "weight": "string", "criteria": ["string"], "objectivesMapped": ["obj-N"], "rubric": { "gradingType": "letter-grade|pass-fail", "performanceLevels": [ { "id": "exemplary|proficient|developing|beginning OR exceeds|meets|approaching|not-yet", "label": "string", "grade": "A|B|C|D/F (for letter-grade)", "status": "Pass (Distinction)|Pass|Conditional|Not Pass (for pass-fail)" } ], "criteria": [ { "name": "string", "weight": "N%", "objectivesMapped": ["obj-N"], "descriptors": { "exemplary|exceeds": "string", "proficient|meets": "string", "developing|approaching": "string", "beginning|not-yet": "string" } } ] } } ] }, "presentation": { "name": "string", "description": "string", "dueWeek": number, "weight": "string", "criteria": ["string"], "objectivesMapped": ["obj-N"] }, "reflections": { "description": "string", "schedule": "string", "weight": "string", "criteria": ["string"], "objectivesMapped": ["obj-N"] }, "employerEvaluation": { "description": "string", "timing": ["string"], "weight": "string", "areas": ["string"], "objectivesMapped": ["obj-N"] } },
  "sampleWeek": { "weekNumber": number, "theme": "string", "subtitle": "string", "totalHours": number, "objectiveIds": ["obj-N"], "objectives": ["string"], "activities": [ { "description": "string", "hours": number, "kolbPhase": "string", "resources": [ { "id": "res-N", "type": "article|video|ai-generated", "title": "string", "source": "string", "url": "string (for article/video)", "duration": "string (for video)", "content": "string (for ai-generated)", "relevance": "string", "personalizationNote": "string" } ] } ], "deliverables": ["string"], "dealReflection": { "describe": "string", "examine": "string", "articulate": "string" }, "naceCompetencyFocus": ["competency-id"] },
  "alignment": { "frameworkElements": { "experientialCompetencies": [ { "id": "purposeful-engagement|reflective-practice|integrative-learning|transfer-capacity", "addressedBy": "string describing how this competency is met" } ] }, "employerSuccessCriteria": [ { "criterion": "string", "addressedBy": ["string - use obj-N for objectives, deliverable names, or activity descriptions"] } ], "studentLearningGoals": [ { "goal": "string", "addressedBy": ["string - use obj-N for objectives, deliverable names, or activity descriptions"] } ], "institutionalOutcomes": [ { "outcome": "string", "evidence": ["string - use obj-N for objectives, deliverable names, or activity descriptions"] } ] }
}`;
}

function buildUserPrompt(institution, employer, student) {
  return `Please synthesize a personalized learning experience based on these inputs:

INSTITUTION PROFILE:
${JSON.stringify(institution, null, 2)}

EMPLOYER PROJECT:
${JSON.stringify(employer, null, 2)}

STUDENT PROFILE:
${JSON.stringify(student, null, 2)}

Generate a complete learning experience that:
1. Meets the institution's requirements for ${institution.creditHours} credits over ${institution.termLengthWeeks} weeks (${institution.hoursPerWeek} hours/week)
2. Addresses the employer's success criteria and deliverable needs
3. Personalizes the experience for ${student.name}'s background in ${student.major} and their specific learning goals
4. Integrates all elements of the FieldWork Framework (Kolb cycle, DEAL reflections, competencies)
5. Creates meaningful connections between the student's prior coursework and the project work
6. Includes a detailed rubric for the first project deliverable, using "${institution.assessmentApproach === 'Letter Grade' ? 'letter-grade' : 'pass-fail'}" grading type based on the institution's assessment approach

Respond with the complete JSON synthesis output only.`;
}

async function extractSkillsFromResume(resumeText) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are an expert at analyzing resumes and identifying key professional skills. Extract skills that would be relevant for experiential learning and professional work experience.

Focus on:
- Technical skills (software, tools, methodologies, programming languages)
- Research and analytical skills
- Communication and writing abilities
- Leadership and teamwork experience
- Industry-specific knowledge

Return ONLY a valid JSON array of 4-8 concise skill descriptions (each 2-6 words). No explanation or markdown.

Example output:
["Data analysis with Excel", "Technical writing", "Survey design and analysis", "Team leadership", "Python programming"]`,
    messages: [
      {
        role: 'user',
        content: `Analyze this resume and extract the most relevant professional skills:\n\n${resumeText.substring(0, 8000)}`
      }
    ]
  });

  const content = response.content[0].text.trim();

  // Parse the JSON array
  let jsonStr = content;
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const skills = JSON.parse(jsonStr);
    if (Array.isArray(skills)) {
      return skills.slice(0, 8); // Limit to 8 skills max
    }
  } catch (e) {
    console.error('Failed to parse skills JSON:', e);
    // Fallback: try to extract skills from plain text
    const lines = content.split('\n').filter(l => l.trim()).slice(0, 8);
    return lines.map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(l => l.length > 0);
  }

  return [];
}

module.exports = { synthesize, extractSkillsFromResume };
