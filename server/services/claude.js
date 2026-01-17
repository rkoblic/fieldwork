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

async function extractProfileFromResume(resumeText) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `You are an expert at analyzing resumes and extracting student profile information for experiential learning placements.

Extract the following from the resume:
1. **name**: The student's full name (if found)
2. **major**: Their primary field of study. Must be one of: Psychology, Business Administration, Communications, Marketing, Computer Science, Data Science, Economics, English, Political Science, Sociology, Engineering, Biology, Environmental Science, Public Health, Graphic Design, Digital Media, or Other
3. **minor**: Secondary field of study (if any), same options as major, or empty string
4. **year**: Academic year (Freshman, Sophomore, Junior, Senior, or Graduate) - infer from graduation date or context
5. **skills**: Array of 4-8 professional skills relevant for workplace learning (2-6 words each)
6. **relevantCoursework**: Array of course categories they've likely taken based on their major/experience. Choose from: Research Methods, Statistics / Data Analysis, Business Fundamentals, Marketing Principles, Communication / Writing, Project Management, Public Speaking, Psychology / Behavioral Science, Computer Science / Programming, Design / Visual Media, Economics / Finance, Ethics / Social Responsibility
7. **careerInterests**: Brief description of likely career interests based on their experience/education (1-2 sentences)

Return ONLY valid JSON with these fields. Use empty string "" for fields not found, empty array [] for list fields not determinable.

Example output:
{
  "name": "Sarah Chen",
  "major": "Psychology",
  "minor": "Business Administration",
  "year": "Junior",
  "skills": ["Data analysis with SPSS", "Survey design", "Academic writing", "Team collaboration", "Research methodology"],
  "relevantCoursework": ["Research Methods", "Statistics / Data Analysis", "Psychology / Behavioral Science", "Communication / Writing"],
  "careerInterests": "Interested in market research, consumer behavior analysis, and organizational consulting roles."
}`,
    messages: [
      {
        role: 'user',
        content: `Extract student profile information from this resume:\n\n${resumeText.substring(0, 8000)}`
      }
    ]
  });

  const content = response.content[0].text.trim();

  // Parse the JSON object
  let jsonStr = content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const profile = JSON.parse(jsonStr);
    // Ensure skills is limited to 8
    if (profile.skills && Array.isArray(profile.skills)) {
      profile.skills = profile.skills.slice(0, 8);
    }
    return profile;
  } catch (e) {
    console.error('Failed to parse profile JSON:', e);
    // Return minimal fallback
    return {
      name: '',
      major: '',
      minor: '',
      year: '',
      skills: [],
      relevantCoursework: [],
      careerInterests: ''
    };
  }
}

// Legacy function name for backward compatibility
async function extractSkillsFromResume(resumeText) {
  const profile = await extractProfileFromResume(resumeText);
  return profile.skills || [];
}

module.exports = { synthesize, extractSkillsFromResume, extractProfileFromResume };
