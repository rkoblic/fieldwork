const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Helper to parse JSON from Claude response
function parseJsonResponse(content) {
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  return JSON.parse(jsonStr.trim());
}

// Helper to normalize array-or-string fields to string (for prompts)
// Custom mode stores textarea values as strings; demo mode has arrays
function toStringList(value) {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value.join('; ');
  }
  return String(value);
}

// Helper to normalize to array (split by newlines if string)
function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  // Split by newlines and filter empty lines
  return String(value).split('\n').map(s => s.trim()).filter(s => s.length > 0);
}

// Phase 1: Learning Objectives
async function generateObjectives(framework, institution, employer, student) {
  const systemPrompt = `You are an expert instructional designer specializing in experiential learning. Generate learning objectives for a field placement experience.

FIELDWORK FRAMEWORK:
${JSON.stringify(framework, null, 2)}

REQUIREMENTS:
- Generate 5-7 learning objectives
- Each objective must have a unique ID (obj-1, obj-2, etc.)
- Tag each objective with 2 NACE competencies (naceCompetency as array)
- Include traceability showing how each objective connects to employer needs, student goals, and institutional outcomes

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "learningObjectives": [
    {
      "id": "obj-N",
      "text": "Objective statement using action verbs",
      "naceCompetency": ["competency-1", "competency-2"],
      "traceability": {
        "employerNeed": "Which employer success criterion this addresses",
        "studentGoal": "Which student learning goal this addresses",
        "institutionalOutcome": "Which institutional outcome this addresses"
      }
    }
  ]
}`;

  const userPrompt = `Create learning objectives for this field placement:

INSTITUTION: ${institution.name}
- Term: ${institution.termLengthWeeks} weeks, ${institution.hoursPerWeek} hours/week
- Learning Outcomes: ${toStringList(institution.learningOutcomes)}

EMPLOYER PROJECT: ${employer.projectTitle} at ${employer.companyName}
- Industry: ${employer.industry}
- Success Criteria: ${toStringList(employer.successCriteria)}
- Expected Deliverables: ${toStringList(employer.deliverables)}

STUDENT: ${student.name}
- Major: ${student.major}${student.minor ? `, Minor: ${student.minor}` : ''}
- Year: ${student.year}
- Skills: ${toStringList(student.extractedSkills)}
- Learning Goals: ${student.learningGoalsNarrative || 'Not specified'}
- Career Interests: ${student.careerInterestsNarrative || 'Not specified'}

Generate 5-7 learning objectives that bridge these inputs.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return parseJsonResponse(response.content[0].text);
}

// Phase 2: Assessment Structure (backwards design - define how we'll measure success before curriculum)
// Note: Rubric is generated in a separate phase for better quality
async function generateAssessment(framework, institution, employer, student, objectives) {
  const systemPrompt = `You are an expert in experiential learning assessment. Design an assessment strategy following backwards design principles.

FIELDWORK FRAMEWORK:
${JSON.stringify(framework, null, 2)}

ASSESSMENT ARCHITECTURE (research-based weights):
- Project Deliverables: 40% (tangible artifacts demonstrating competency)
- Project Presentation: 20% (communication as core NACE skill)
- Reflections: 25% (key mechanism for learning transfer)
- Employer Evaluation: 15% (validates professional behavior)

REQUIREMENTS:
- Design 2-3 project deliverables spread across the term
- Do NOT include rubrics - those will be generated separately
- Map each assessment component to relevant learning objectives
- Include clear evaluation criteria for each component

Respond ONLY with valid JSON:
{
  "assessment": {
    "overview": "Brief description of assessment philosophy",
    "weights": { "deliverables": 40, "presentation": 20, "reflections": 25, "employerEvaluation": 15 },
    "deliverables": {
      "description": "Description of deliverables component",
      "items": [
        {
          "name": "Deliverable name",
          "dueWeek": number,
          "weight": "N%",
          "criteria": ["criterion 1", "criterion 2"],
          "objectivesMapped": ["obj-N"]
        }
      ]
    },
    "presentation": {
      "name": "Presentation name",
      "description": "Description",
      "dueWeek": number,
      "weight": "20%",
      "criteria": ["criterion"],
      "objectivesMapped": ["obj-N"]
    },
    "reflections": {
      "description": "Description",
      "schedule": "Weekly DEAL reflections",
      "weight": "25%",
      "criteria": ["criterion"],
      "objectivesMapped": ["obj-N"]
    },
    "employerEvaluation": {
      "description": "Description",
      "timing": ["Mid-term", "Final"],
      "weight": "15%",
      "areas": ["Professionalism", "Quality of work"],
      "objectivesMapped": ["obj-N"]
    }
  }
}`;

  const objectivesText = objectives.learningObjectives.map(o => `${o.id}: ${o.text}`).join('\n');

  const userPrompt = `Design assessment for this ${institution.termLengthWeeks}-week field placement:

LEARNING OBJECTIVES:
${objectivesText}

INSTITUTION: ${institution.name}
- Assessment Approach: ${institution.assessmentApproach}
- Credit Hours: ${institution.creditHours}

EMPLOYER PROJECT: ${employer.projectTitle}
- Expected Deliverables: ${toStringList(employer.deliverables)}
- Success Criteria: ${toStringList(employer.successCriteria)}

STUDENT: ${student.name} (${student.major})

Create an assessment strategy that measures achievement of all objectives.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return parseJsonResponse(response.content[0].text);
}

// Phase 3: Rubric (detailed rubric for first deliverable)
async function generateRubric(framework, institution, employer, student, objectives, deliverable) {
  const gradingType = institution.assessmentApproach === 'Letter Grade' ? 'letter-grade' : 'pass-fail';

  const performanceLevelsSpec = gradingType === 'letter-grade'
    ? `Use these levels with exact IDs:
  - { "id": "exemplary", "label": "Exemplary", "grade": "A", "points": 4 }
  - { "id": "proficient", "label": "Proficient", "grade": "B", "points": 3 }
  - { "id": "developing", "label": "Developing", "grade": "C", "points": 2 }
  - { "id": "beginning", "label": "Beginning", "grade": "D/F", "points": 1 }`
    : `Use these levels with exact IDs:
  - { "id": "exceeds", "label": "Exceeds Standard", "status": "Pass (Distinction)", "points": 4 }
  - { "id": "meets", "label": "Meets Standard", "status": "Pass", "points": 3 }
  - { "id": "approaching", "label": "Approaching Standard", "status": "Conditional", "points": 2 }
  - { "id": "not-yet", "label": "Not Yet Meeting", "status": "Not Pass", "points": 1 }`;

  const descriptorKeys = gradingType === 'letter-grade'
    ? '"exemplary", "proficient", "developing", "beginning"'
    : '"exceeds", "meets", "approaching", "not-yet"';

  const systemPrompt = `You are an expert in experiential learning assessment rubric design. Create a detailed analytical rubric for a project deliverable.

CONTEXT:
- Institution: ${institution.name}
- Grading Approach: ${institution.assessmentApproach}
- Student: ${student.name}, ${student.major} major${student.minor ? `, ${student.minor} minor` : ''}
- Project: ${employer.projectTitle} at ${employer.companyName}
- Industry: ${employer.industry}

DELIVERABLE TO ASSESS:
- Name: ${deliverable.name}
- Due: Week ${deliverable.dueWeek}
- Weight: ${deliverable.weight}
- Criteria Overview: ${(deliverable.criteria || []).join(', ')}
- Learning Objectives Mapped: ${(deliverable.objectivesMapped || []).join(', ')}

RUBRIC REQUIREMENTS:
1. Grading Type: "${gradingType}"
2. Performance Levels (use these EXACT IDs):
${performanceLevelsSpec}

3. Create EXACTLY 6 criteria with these weights totaling 100%:
   - Research Methodology (15%) - Analytical approach and justification
   - Data Quality & Evidence (20%) - Evidence selection and organization
   - Analysis & Interpretation (20%) - Pattern recognition and insight development
   - Communication Clarity (20%) - Writing quality and accessibility
   - Critical Thinking & Next Steps (15%) - Evaluation depth and forward planning
   - Professional Quality (10%) - Formatting and presentation standards

4. Each criterion must have:
   - name: The criterion name
   - weight: The weight as a string (e.g., "15%")
   - objectivesMapped: Array of objective IDs this criterion assesses
   - descriptors: Object with keys ${descriptorKeys}, each containing a detailed 2-3 sentence description

5. CRITICAL: Each descriptor must be:
   - Specific to the student's background (${student.major}, ${(student.extractedSkills || []).slice(0, 3).join(', ')})
   - Relevant to the project context (${employer.industry}, ${employer.projectTitle})
   - Clearly differentiated between performance levels
   - Action-oriented and observable

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "rubric": {
    "gradingType": "${gradingType}",
    "performanceLevels": [
      { "id": "...", "label": "...", ${gradingType === 'letter-grade' ? '"grade": "..."' : '"status": "..."'}, "points": ... }
    ],
    "criteria": [
      {
        "name": "Research Methodology",
        "weight": "15%",
        "objectivesMapped": ["obj-1"],
        "descriptors": {
          ${descriptorKeys.split(', ').map(k => `${k}: "Detailed descriptor text..."`).join(',\n          ')}
        }
      }
    ]
  }
}`;

  const objectivesText = objectives.learningObjectives.map(o => `${o.id}: ${o.text}`).join('\n');

  const userPrompt = `Create a detailed rubric for "${deliverable.name}" that will be due in Week ${deliverable.dueWeek}.

LEARNING OBJECTIVES TO ASSESS:
${objectivesText}

STUDENT BACKGROUND:
- Name: ${student.name}
- Major: ${student.major}${student.minor ? `, Minor: ${student.minor}` : ''}
- Year: ${student.year}
- Skills: ${toStringList(student.extractedSkills)}
- Relevant Coursework: ${toStringList(student.relevantCoursework)}

PROJECT CONTEXT:
- Organization: ${employer.companyName}
- Industry: ${employer.industry}
- Project: ${employer.projectTitle}
- Brief: ${employer.projectBrief}
- Success Criteria: ${toStringList(employer.successCriteria)}

Generate a rubric with descriptors personalized to ${student.name}'s ${student.major} background working on ${employer.projectTitle}. Each descriptor should reference relevant skills, terminology, or expectations appropriate for this specific context.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return parseJsonResponse(response.content[0].text);
}

// Phase 4: Curriculum (designed to achieve assessment outcomes)
async function generateCurriculum(framework, institution, employer, student, objectives, assessmentSummary) {
  const systemPrompt = `You are an expert instructional designer. Create a week-by-week curriculum that prepares students to succeed in their assessments.

FIELDWORK FRAMEWORK:
${JSON.stringify(framework, null, 2)}

CURRICULUM REQUIREMENTS:
- Create ${institution.termLengthWeeks} weeks of learning activities
- Each week must include activities across all four Kolb phases (experience, reflection, conceptualization, experimentation)
- Total hours per week should approximate ${institution.hoursPerWeek} hours
- Include DEAL reflection prompts personalized for the student
- Scaffold activities to build toward assessment deliverables
- Include checkpoints/milestones leading to major deliverables

Respond ONLY with valid JSON:
{
  "curriculum": {
    "weeks": [
      {
        "weekNumber": 1,
        "theme": "Week theme",
        "objectives": ["Week-specific objective"],
        "activities": [
          { "description": "Activity description", "hours": number, "kolbPhase": "experience|reflection|conceptualization|experimentation" }
        ],
        "deliverables": ["Checkpoint or milestone"],
        "dealReflection": {
          "describe": "Personalized describe prompt for ${student.name}",
          "examine": "Personalized examine prompt",
          "articulate": "Personalized articulate prompt"
        },
        "naceCompetencyFocus": ["competency-id", "competency-id"]
      }
    ]
  }
}`;

  const objectivesText = objectives.learningObjectives.map(o => `${o.id}: ${o.text}`).join('\n');
  const deliverablesText = assessmentSummary.deliverables.map(d => `Week ${d.dueWeek}: ${d.name} (${d.weight})`).join('\n');

  const userPrompt = `Create a ${institution.termLengthWeeks}-week curriculum for:

STUDENT: ${student.name}
- Major: ${student.major}${student.minor ? `, Minor: ${student.minor}` : ''}
- Background: ${student.year} year student
- Skills: ${toStringList(student.extractedSkills)}
- Relevant Coursework: ${toStringList(student.relevantCoursework)}

EMPLOYER PROJECT: ${employer.projectTitle} at ${employer.companyName}
- Brief: ${employer.projectBrief}
- Hours/Week: ${employer.hoursPerWeek}
- Mentor Support: ${employer.mentorSupport}

LEARNING OBJECTIVES:
${objectivesText}

ASSESSMENT DELIVERABLES (curriculum must prepare students for these):
${deliverablesText}
Final Presentation: Week ${institution.termLengthWeeks}

Design curriculum that builds skills progressively toward each deliverable.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return parseJsonResponse(response.content[0].text);
}

// Phase 5: Sample Week (enhanced week with resources)
async function generateSampleWeek(framework, institution, employer, student, objectives, baseWeek) {
  const systemPrompt = `You are an expert instructional designer. Create an enhanced sample week with detailed resources for the conceptualization activity.

REQUIREMENTS:
- Enhance the provided base week with more detail
- Add 2-3 learning resources to the conceptualization activity:
  - 1 article (with real URL from reputable source)
  - 1 video (with real YouTube URL)
  - 1 ai-generated personalized insight
- Each resource needs: id (res-N), type, title, source, url (for article/video), duration (for video), content (for ai-generated), relevance, personalizationNote

Respond ONLY with valid JSON:
{
  "sampleWeek": {
    "weekNumber": number,
    "theme": "Theme",
    "subtitle": "Descriptive subtitle",
    "totalHours": number,
    "objectiveIds": ["obj-N"],
    "objectives": ["Week objectives"],
    "activities": [
      {
        "description": "Activity",
        "hours": number,
        "kolbPhase": "phase",
        "resources": [ // Only for conceptualization activity
          {
            "id": "res-1",
            "type": "article",
            "title": "Article title",
            "source": "Source name",
            "url": "https://...",
            "relevance": "Why this is relevant",
            "personalizationNote": "Note for ${student.name}"
          },
          {
            "id": "res-2",
            "type": "video",
            "title": "Video title",
            "source": "Channel/Creator",
            "url": "https://youtube.com/...",
            "duration": "XX min",
            "relevance": "Relevance",
            "personalizationNote": "Note for student"
          },
          {
            "id": "res-3",
            "type": "ai-generated",
            "title": "Personalized insight title",
            "relevance": "Relevance",
            "personalizationNote": "Note about personalization",
            "content": "2-3 paragraph personalized content connecting student's background to week's learning"
          }
        ]
      }
    ],
    "deliverables": ["Checkpoint"],
    "dealReflection": { "describe": "...", "examine": "...", "articulate": "..." },
    "naceCompetencyFocus": ["competency"]
  }
}`;

  const objectivesText = objectives.learningObjectives.map(o => `${o.id}: ${o.text}`).join('\n');

  const userPrompt = `Enhance this sample week (Week ${baseWeek.weekNumber}) for ${student.name}:

BASE WEEK DATA:
${JSON.stringify(baseWeek, null, 2)}

STUDENT CONTEXT:
- Major: ${student.major}${student.minor ? `, Minor: ${student.minor}` : ''}
- Relevant Coursework: ${toStringList(student.relevantCoursework)}
- Learning Goals: ${student.learningGoalsNarrative}

PROJECT: ${employer.projectTitle} - ${employer.projectBrief}

LEARNING OBJECTIVES:
${objectivesText}

Create an enhanced version with detailed resources for the conceptualization/reading activity. Include real, reputable sources for article and video. The ai-generated content should connect ${student.name}'s ${student.major} background to this week's work.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return parseJsonResponse(response.content[0].text);
}

// Phase 6: Alignment (cross-reference all elements)
async function generateAlignment(framework, institution, employer, student, objectives, assessmentSummary, curriculumSummary) {
  const systemPrompt = `You are an expert in experiential learning program design. Create an alignment crosswalk showing how the learning experience connects to all stakeholder requirements.

FIELDWORK FRAMEWORK COMPETENCIES:
- purposeful-engagement: Authentic engagement with real-world challenges
- reflective-practice: Systematic reflection on experiences
- integrative-learning: Connecting academic knowledge to practice
- transfer-capacity: Applying learning to new contexts

Respond ONLY with valid JSON:
{
  "alignment": {
    "frameworkElements": {
      "experientialCompetencies": [
        {
          "id": "purposeful-engagement|reflective-practice|integrative-learning|transfer-capacity",
          "addressedBy": "Description of how this competency is developed"
        }
      ]
    },
    "employerSuccessCriteria": [
      {
        "criterion": "Employer criterion text",
        "addressedBy": ["obj-N", "Deliverable name", "Activity description"]
      }
    ],
    "studentLearningGoals": [
      {
        "goal": "Student goal",
        "addressedBy": ["obj-N", "Activity or deliverable"]
      }
    ],
    "institutionalOutcomes": [
      {
        "outcome": "Institutional outcome",
        "evidence": ["Evidence source"]
      }
    ]
  }
}`;

  const objectivesText = objectives.learningObjectives.map(o => `${o.id}: ${o.text}`).join('\n');

  // Convert to arrays for numbered lists
  const successCriteriaArr = toArray(employer.successCriteria);
  const learningOutcomesArr = toArray(institution.learningOutcomes);

  const userPrompt = `Create alignment crosswalk for this learning experience:

LEARNING OBJECTIVES:
${objectivesText}

EMPLOYER SUCCESS CRITERIA:
${successCriteriaArr.map((c, i) => `${i + 1}. ${c}`).join('\n') || 'Not specified'}

STUDENT LEARNING GOALS:
${student.learningGoalsNarrative || 'Develop professional skills and apply academic knowledge'}

INSTITUTIONAL OUTCOMES:
${learningOutcomesArr.map((o, i) => `${i + 1}. ${o}`).join('\n') || 'Not specified'}

ASSESSMENT DELIVERABLES:
${assessmentSummary.deliverables.map(d => `- ${d.name} (Week ${d.dueWeek})`).join('\n')}

CURRICULUM OVERVIEW:
${curriculumSummary.weekThemes.map((t, i) => `Week ${i + 1}: ${t}`).join('\n')}

Show how every stakeholder requirement is addressed by the learning experience.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return parseJsonResponse(response.content[0].text);
}

// Generate metadata for the complete synthesis
function generateMetadata(institution, employer, student) {
  return {
    institutionId: institution.id || 'custom-inst',
    employerId: employer.id || 'custom-emp',
    studentId: student.id || 'custom-stu',
    generatedAt: new Date().toISOString(),
    termLengthWeeks: institution.termLengthWeeks
  };
}

module.exports = {
  generateObjectives,
  generateAssessment,
  generateRubric,
  generateCurriculum,
  generateSampleWeek,
  generateAlignment,
  generateMetadata
};
