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
- Provide a detailed sample week (Week 4 or appropriate mid-term week)
- Create an alignment crosswalk showing connections to all four inputs

Respond ONLY with valid JSON matching this structure (no markdown, no explanation):
{
  "metadata": { "institutionId": "string", "employerId": "string", "studentId": "string", "generatedAt": "ISO date string", "termLengthWeeks": number },
  "learningObjectives": [ { "id": "obj-N", "text": "string", "naceCompetency": "competency-id", "traceability": { "employerNeed": "string", "studentGoal": "string", "institutionalOutcome": "string" } } ],
  "curriculum": { "weeks": [ { "weekNumber": number, "theme": "string", "objectives": ["string"], "activities": [ { "description": "string", "hours": number, "kolbPhase": "experience|reflection|conceptualization|experimentation" } ], "deliverables": ["string"], "dealReflection": { "describe": "string", "examine": "string", "articulate": "string" }, "naceCompetencyFocus": ["competency-id"] } ] },
  "assessment": { "overview": "string", "deliverables": [ { "name": "string", "dueWeek": number, "weight": "string", "criteria": ["string"], "objectivesMapped": ["obj-N"] } ], "reflections": { "schedule": "string", "weight": "string", "criteria": ["string"] }, "employerEvaluation": { "timing": ["string"], "weight": "string", "areas": ["string"] } },
  "sampleWeek": { "weekNumber": number, "theme": "string", "subtitle": "string", "totalHours": number, "objectives": ["string"], "activities": [ { "description": "string", "hours": number, "kolbPhase": "string" } ], "deliverables": ["string"], "dealReflection": { "describe": "string", "examine": "string", "articulate": "string" }, "naceCompetencyFocus": { "primary": "competency-id", "secondary": "competency-id" } },
  "alignment": { "frameworkElements": { "kolbPhases": { "experience": "string", "reflection": "string", "conceptualization": "string", "experimentation": "string" }, "dealReflections": "string", "competencies": "string" }, "employerSuccessCriteria": [ { "criterion": "string", "addressedBy": ["string"] } ], "studentLearningGoals": [ { "goal": "string", "addressedBy": ["string"] } ], "institutionalOutcomes": [ { "outcome": "string", "evidence": ["string"] } ] }
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

Respond with the complete JSON synthesis output only.`;
}

module.exports = { synthesize };
