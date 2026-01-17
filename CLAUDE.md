# CLAUDE.md

## Project Overview
FieldWork is an AI-powered experiential learning design prototype. It synthesizes four inputs (FieldWork Framework, Institution Profile, Employer Project, Student Profile) into personalized learning experiences for university field placements.

## Tech Stack
- **Backend**: Express.js with EJS templating
- **Frontend**: Alpine.js for reactivity, Tailwind CSS for styling
- **AI**: Claude API (Anthropic) for custom synthesis
- **Deployment**: Vercel

## Project Structure
```
fieldwork/
├── server/
│   ├── index.js              # Express entry point
│   ├── routes/
│   │   ├── pages.js          # Serves SPA shell
│   │   └── api.js            # Data + synthesis endpoints
│   └── services/
│       ├── claude.js         # Claude API integration
│       └── synthesis.js      # Mock vs real routing
├── views/
│   ├── index.ejs             # Main shell
│   └── partials/
│       ├── landing.ejs       # Home page content
│       ├── wizard/           # Input wizard steps
│       │   ├── framework.ejs
│       │   ├── institution.ejs
│       │   ├── employer.ejs
│       │   ├── student.ejs
│       │   ├── synthesizing.ejs
│       │   ├── navigation.ejs
│       │   └── progress.ejs
│       └── results/          # Output tabs
│           ├── header.ejs
│           ├── objectives.ejs
│           ├── curriculum.ejs
│           ├── assessment.ejs
│           ├── sample-week.ejs
│           └── alignment.ejs
├── public/
│   ├── css/styles.css        # Tailwind output
│   └── js/app.js             # Alpine.js store
├── data/
│   ├── framework.json        # FieldWork Framework
│   ├── institutions.json     # 2 demo institutions
│   ├── employers.json        # 2 demo employer projects
│   ├── students.json         # 2 demo student profiles
│   └── outputs/              # 8 pre-generated syntheses
```

## Commands
- `npm install` - Install dependencies
- `npm run dev` - Start dev server with hot reload (runs Tailwind watch + nodemon)
- `npm start` - Start production server
- `npm run tailwind:build` - Build Tailwind CSS once
- `npm run tailwind:watch` - Watch and rebuild Tailwind CSS

## API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/data/framework` | FieldWork Framework content |
| GET | `/api/data/institutions` | Demo institutions |
| GET | `/api/data/employers` | Demo employer projects |
| GET | `/api/data/students` | Demo student profiles |
| GET | `/api/synthesis/demo/:key` | Pre-generated output (e.g., `inst-1-emp-1-stu-1`) |
| POST | `/api/synthesis/custom` | Claude API synthesis |

## Application Modes
- **Demo Mode**: All fields locked, users switch between pre-configured profiles. Uses pre-generated synthesis outputs.
- **Custom Mode**: Editable forms. Uses Claude API when data differs from demo templates.

## Key Files
- `public/js/app.js` - Alpine.js store managing wizard state, navigation, and data
- `server/services/claude.js` - Claude API prompt engineering and response parsing
- `data/outputs/` - 8 pre-generated synthesis files for all demo combinations

## Environment Variables
- `ANTHROPIC_API_KEY` - Required for custom mode synthesis
- `PORT` - Server port (default: 3000)

## Demo Data
The demo includes 8 pre-generated synthesis outputs covering all combinations:
- **2 Institutions**: Westbrook University (12 weeks, letter grade), Pacific Coast College (15 weeks, pass/fail)
- **2 Employers**: Bridgewater Community Foundation (nonprofit research), Horizon Strategic Consulting (process improvement)
- **2 Students**: Anna Liu (Psychology/Business), Ben Williams (Communications/Digital Media)

Output file naming: `inst-{1|2}-emp-{1|2}-stu-{1|2}.json`

## Output Data Structure
Each synthesis output (`data/outputs/*.json`) contains:

```json
{
  "metadata": { "institutionId", "employerId", "studentId", "termLengthWeeks" },
  "learningObjectives": [
    { "id", "text", "naceCompetency": ["competency-1", "competency-2"], "traceability": { "employerNeed", "studentGoal", "institutionalOutcome" } }
  ],
  "curriculum": {
    "weeks": [
      { "weekNumber", "theme", "objectives", "activities", "deliverables", "dealReflection", "naceCompetencyFocus" }
    ]
  },
  "assessment": {
    "overview": "string",
    "weights": { "deliverables": 40, "presentation": 20, "reflections": 25, "employerEvaluation": 15 },
    "deliverables": { "description", "items": [...] },
    "presentation": { "name", "description", "dueWeek", "weight", "criteria", "objectivesMapped" },
    "reflections": { "description", "schedule", "weight", "criteria", "objectivesMapped" },
    "employerEvaluation": { "description", "timing", "weight", "areas", "objectivesMapped" }
  },
  "sampleWeek": {
    "weekNumber", "theme", "subtitle", "totalHours", "objectiveIds", "objectives",
    "activities": [{ "description", "hours", "kolbPhase", "resources"?: [...] }],
    "deliverables", "dealReflection", "naceCompetencyFocus"
  },
  "alignment": { "frameworkElements", "employerSuccessCriteria", "studentLearningGoals", "institutionalOutcomes" }
}
```

## Assessment Architecture
The 4-type assessment model with research-based weighting:

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Project Deliverables | 40% | Tangible artifacts demonstrating competency |
| Project Presentation | 20% | Communication is a core NACE skill |
| Reflections | 25% | Key mechanism for learning transfer |
| Employer Evaluation | 15% | Validates professional behavior |

## Key Terminology
- **Kolb Phases**: experience, reflection, conceptualization, experimentation (short names used in UI)
- **DEAL Model**: Describe, Examine, Articulate Learning (reflection framework)
- **NACE Competencies**: critical-thinking, communication, teamwork, professionalism, technology, leadership, equity-inclusion, career-self-development
- **FieldWork Competencies**: Purposeful Engagement, Reflective Practice, Integrative Learning, Transfer Capacity
- **Milestones**: Weekly curriculum deliverables (formerly called "deliverables" in curriculum context)
- **Checkpoints**: Ungraded weekly milestones displayed in sample week view
- **Learning Resources**: Curated materials for conceptualization activities (articles, videos, AI-generated personalized insights)

## NACE Competency Tagging
Each learning objective is tagged with **2 primary NACE competencies** to reflect the multi-dimensional nature of professional skill development:

| LO Pattern | Primary Competency | Secondary Competency | Rationale |
|------------|-------------------|---------------------|-----------|
| Research/Analysis | critical-thinking | technology | Uses analytical tools and software |
| Stakeholder Interviews | communication | teamwork | Collaborative inquiry with others |
| Presentations | communication | professionalism | Executive-level professional context |
| Recommendations | critical-thinking | communication | Must articulate insights clearly |
| Professional Behavior | professionalism | teamwork | Workplace collaboration |
| Career Reflection | career-self-development | communication | Articulating growth |

**Helper Functions in app.js:**
- `getNaceCompetencies(obj)` - Normalizes `naceCompetency` to array (handles both string and array formats for backward compatibility)
- `getNaceCompetenciesWithObjectives()` - Returns unique competencies with their linked LO numbers for alignment display

## Sample Week Features
The sample week view includes:
- **Header**: Week number, theme, total hours, checkpoint count, graded reflection indicator
- **Course LO Mapping**: Badges showing which course learning objectives the week addresses (sorted numerically)
- **Activities**: Categorized by Kolb phase with time allocations
- **Learning Resources Modal**: For "Thinking" activities, displays personalized insights first, followed by articles and videos
- **Milestones**: Ungraded checkpoints (DEAL reflections filtered out as they're shown separately)
- **DEAL Reflection Prompts**: Graded weekly reflection with Describe/Examine/Articulate Learning structure

## Objectives Tab Features
- **LO Cards**: Each learning objective displayed with numbered badge (1-6)
- **NACE Competency Badges**: Multiple blue badges showing all tagged competencies per LO
- **Traceability Panel**: Shows alignment to employer need, student goal, and institutional outcome

## Assessment Tab Features
- **Weight Cards**: Visual display of the 4-component assessment weights
- **Alignment Matrix**: Shows which learning objectives map to which assessment components (moved prominently under weight cards)
- **LO Badges**: Display as "LO 1", "LO 2", etc. with hover tooltips showing full objective text
- **Component Details**: Evaluation criteria and objective mappings for each assessment type

## Alignment Tab Features
- **FieldWork Framework**: Experiential competencies with descriptions of how they're addressed
- **NACE Competencies**: Dynamic list showing each competency with linked LO badges (e.g., "Communication → LO 1, LO 2, LO 3")
- **Employer Success Criteria**: Project requirements mapped to objectives, deliverables, and activities
- **Student Learning Goals**: Personal goals mapped to how they're addressed
- **Institutional Outcomes**: Academic outcomes with evidence of achievement
