# FieldWork PRD

## Project Overview

FieldWork is an AI-powered prototype demonstrating how experiential learning can be systematically designed by synthesizing four inputs: the FieldWork Framework (evidence-based learning architecture), institutional standards, employer project requirements, and student goals. The result is a personalized, credit-worthy learning experience grounded in learning science.

**Primary Use Case:** Business development demonstrations with university partners to show how AI can transform ad-hoc employer projects into structured, academically rigorous learning experiences.

**Core Value Proposition:** What currently takes faculty hours of manual design work—connecting employer project requirements to student learning goals and institutional standards—can be synthesized intelligently, creating consistent quality at scale.

---

## The Problem

Experiential learning (internships, employer-connected projects, co-ops) is valuable but doesn't scale because:

1. Every project is designed from scratch—no consistent framework
2. Stakeholder needs aren't systematically captured or aligned
3. Evidence of learning is inconsistent—often just supervisor sign-off
4. Each project requires significant faculty labor to make it credit-worthy

---

## The Solution: Four-Way Synthesis

The prototype demonstrates a synthesis engine that takes four inputs and produces a coherent learning experience:

```
┌─────────────────┐   ┌─────────────────┐
│    FieldWork    │   │   Institution   │
│    Framework    │   │   Standards     │
└────────┬────────┘   └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │
┌─────────────────┐ │ ┌─────────────────┐
│    Employer     │ │ │     Student     │
│    Project      ├─┼─┤     Goals       │
└─────────────────┘ │ └─────────────────┘
                    ▼
         ┌────────────────────┐
         │  Synthesis Engine  │
         └────────┬───────────┘
                  ▼
         ┌────────────────────┐
         │  Personalized      │
         │  Learning Experience│
         └────────────────────┘
```

---

## The Four Inputs

### 1. FieldWork Framework
**Nature:** The pedagogical architecture that ensures every experience is grounded in learning science (visible but not editable in demo)

**What it includes:**

#### Core Competencies

**FieldWork Experiential Learning Competencies**
These four competencies distinguish experiential *learning* from experiential *activity*:

- **Purposeful Engagement:** Active, intentional participation in authentic professional work. Students demonstrate initiative, persistence through ambiguity, and adaptive response to feedback.
- **Reflective Practice:** Systematic processing of experience to extract meaning. Students develop the capacity to accurately describe their actions, critically examine their assumptions, and honestly assess their own performance.
- **Integrative Learning:** Connecting experiential learning to prior knowledge, theory, and coursework. Students make explicit connections between what they're doing and what they've learned academically.
- **Transfer Capacity:** Articulating how learning applies to future contexts. The goal is developing capabilities that transfer to future academic, professional, and personal situations.

**NACE Career Readiness Competencies**
Industry-validated framework for professional skill development:
- Critical Thinking
- Communication
- Teamwork
- Professionalism
- Technology
- Leadership
- Equity & Inclusion
- Career & Self Development

#### Assessment Architecture

The 4-type assessment model with research-based weighting:

| Component | Weight | Description |
|-----------|--------|-------------|
| **Project Deliverables** | 40% | Tangible artifacts that demonstrate skill application and create value for the employer |
| **Project Presentation** | 20% | Culminating opportunity to communicate findings and recommendations to stakeholders |
| **Reflections** | 25% | Structured processing of experience using the DEAL model—the key mechanism for learning transfer |
| **Employer Evaluations** | 15% | External validation of professional performance and contribution |

#### Evidence-Based Learning Strategies

**Kolb's Experiential Learning Cycle**
Every week includes activities across four phases:
- **Concrete Experience:** Doing the actual work
- **Reflective Observation:** Processing what happened
- **Abstract Conceptualization:** Connecting to theory/concepts
- **Active Experimentation:** Applying insights to next iteration

**DEAL Reflection Model**
Structured reflection approach used throughout:
- **Describe:** What happened? What did you do?
- **Examine:** What does it mean? How does it connect to prior learning?
- **Articulate Learning:** What did you learn? How will you apply it?

*Additional evidence-based strategies may be incorporated in future versions.*

**Why it matters:** This is the learning science foundation. It's what distinguishes a structured learning experience from just "doing an internship." The framework ensures rigor and comparability across diverse projects.

### 2. Institution Profile
**Nature:** Pre-configured settings (set once per institution, not per project)

**What it includes:**
- Term length (in weeks)
- Credit hours
- Learning outcomes required for credit
- Assessment approach (pass/fail, letter grades, etc.)
- Competency selections (which NACE competencies this institution requires)
- Learner context (undergraduate/graduate level, experience level)

**Why it matters:** This ensures every synthesized experience meets the institution's academic standards for awarding credit. Different institutions have different requirements; the synthesis adapts accordingly.

### 3. Employer Project
**Nature:** Narrative description of what they need done

**What it includes:**
- Company context and industry
- Project description and goals
- Success criteria (what "done well" looks like)
- Expected deliverables
- Timeline and time commitment expected
- What they'll provide (data, access, feedback)

**Example:** "We're a regional nonprofit struggling to understand why donor retention has dropped. We have three years of donor data but no one to analyze it. Looking for: analysis of donor patterns, identification of at-risk segments, recommendations for retention strategies, and a presentation our board can act on. Deliverables: interim findings report, final analysis with recommendations, board presentation deck."

**Why it matters:** This is the authentic work context. The synthesis must produce something that actually helps the employer while creating genuine learning opportunities.

### 4. Student Profile
**Nature:** Individual learner information

**What it includes:**
- Academic background (major, minor, year)
- Relevant skills and experience (from resume)
- Learning goals (what they want to develop)
- Career interests (professional direction)

**Example:** "Junior in Psychology with a minor in Business. Experience with research methods, data analysis in SPSS, and written communication from coursework. Wants to develop professional presentation skills and understand how organizations make decisions. Interested in HR or organizational consulting career path."

**Why it matters:** This enables personalization. Two students from different majors on the same project will get different scaffolding, different connections to their coursework, and different framings for their career interests.

---

## The Outputs

The synthesis produces a complete learning experience package:

### 1. Custom Learning Objectives
Specific objectives for this student + project + institution combination:
- Each objective traceable to employer need, student goal, AND institutional outcome
- Each mapped to a NACE competency
- Typically 5-7 objectives depending on institutional requirements

**Example objectives:**
1. Apply data analysis techniques to identify user behavior patterns (Critical Thinking)
2. Translate technical findings into actionable product recommendations (Communication)
3. Create data visualizations that communicate insights to non-technical stakeholders (Technology)
4. Reflect on professional identity development in the tech industry (Career & Self Development)

### 2. Week-by-Week Curriculum
A structured curriculum matching the institution's term length:
- Each week has a theme aligned to project phases
- Activities span all four Kolb phases
- Time estimates match credit-hour requirements
- Milestones align with employer timeline

**Example Week Structure:**
- Week theme and focus area
- Learning objectives for that week
- Activities with time estimates and Kolb phase tags
- Deliverables due
- Reflection prompts (DEAL model)
- NACE competency focus

### 3. Assessment Strategy
How learning will be evaluated:
- Deliverable rubrics with specific criteria
- Reflection schedule with prompts
- Evidence mapping to institutional requirements
- Employer evaluation touchpoints
- Self-assessment framework

Each deliverable maps to specific learning objectives, creating a traceable assessment matrix.

### 4. Alignment Crosswalk
Shows how the synthesized experience connects all four inputs:
- FieldWork Framework → how Kolb phases, DEAL reflections, and competencies are woven throughout
- Employer success criteria → which objectives and deliverables address each
- Student learning goals → how each is supported
- Institutional outcomes → evidence that will demonstrate each

---

## User Flow

### Screen 1: Landing
- Brief explanation of what FieldWork does
- Visual showing the four-way synthesis concept (Framework + Institution + Employer + Student)
- Two entry points: "Start Demo" (pre-filled data) or "Build Custom Experience"

### Screen 2: Wizard - FieldWork Framework (Input 1)
Presents the pedagogical architecture as the first input:

- **Core Competencies**
  - FieldWork Experiential Learning Competencies (Purposeful Engagement, Reflective Practice, Integrative Learning, Transfer Capacity)
  - NACE Career Readiness Competencies (the professional skills being developed)
- **Assessment Architecture** (Project Deliverables, Presentation, Reflections, Employer Evaluations)
- **Evidence-Based Learning Strategies** (Kolb Cycle, DEAL Reflection Model)

This is displayed as an input to the synthesis (read-only in demo), not just background explanation. It builds credibility by showing the framework is grounded in learning science—this is what FieldWork brings to the synthesis.

### Screen 3: Wizard - Institution Configuration (Input 2)
Shows what the institution has set up:
- Term length and credits
- Learning outcomes
- Required NACE competencies (core + optional selections)
- Learner settings (level, experience, team size)

For demo purposes, user can switch between pre-configured institutions. For custom experiences, these can be edited.

### Screen 4: Wizard - Employer Project (Input 3)
Input form for employer information:
- Company name and industry
- Project title and type
- Project brief (narrative text area)
- Success criteria
- Expected deliverables
- Timeline and time commitment

For demo mode, this is pre-filled with a general professional skills project suitable for students from any major.

### Screen 5: Wizard - Student Profile (Input 4)
Input for student information:
- Select from three demo profiles OR enter custom information
- Resume upload/text (for custom)
- Learning goals
- Career interests

Demo profiles represent different majors to show how personalization works.

### Screen 6: Synthesizing
Processing animation showing:
- Progress through synthesis steps
- Builds anticipation for the output
- Should feel like substantive work is happening

Synthesis steps:
1. Applying FieldWork Framework
2. Mapping institutional requirements
3. Analyzing employer project
4. Personalizing for student profile
5. Generating learning experience

### Screen 7: Results
Tabbed display of synthesized experience:

**Tab: Learning Objectives**
- List of 5-7 custom objectives
- Each shows traceability (employer goal + student need + institutional outcome)
- Each shows NACE competency mapping

**Tab: Curriculum**
- Week-by-week view of the experience
- Click a week to expand and see full details:
  - Week objectives
  - Activities with time estimates and Kolb phase indicators
  - Deliverables due
  - DEAL reflection prompts
  - NACE competency focus for that week

**Tab: Assessment**
- Assessment strategy overview with 4-type architecture
- Weight distribution cards: Deliverables (40%), Presentation (20%), Reflections (25%), Employer (15%)
- Detailed sections for each assessment type with criteria and mapped objectives
- Objective-to-Assessment matrix showing which assessments address which objectives

**Tab: Sample Week**
- Detailed view of one week (e.g., Week 4) showing the full learning experience
- Week theme and objectives
- Activities with time estimates and Kolb phase indicators
- Readings or resources
- DEAL reflection prompts for that week
- Deliverables due
- NACE competency focus

This gives users a concrete sense of what the day-to-day experience looks like, not just the high-level structure.

**Tab: Alignment**
- Crosswalk showing how the experience addresses all four inputs:
  - FieldWork Framework elements (Kolb phases, DEAL reflections, competencies)
  - Employer success criteria
  - Student learning goals
  - Institutional outcomes

---

## Demo Data Requirements

### Institutions (2 pre-configured)
Fictional but plausible institution names with distinct characteristics:

| Institution | Term | Credits | Hours/Week | Assessment |
|-------------|------|---------|------------|------------|
| Westbrook University | 12 weeks | 3 | 9 | Letter Grade (A-F) |
| Pacific Coast College | 15 weeks | 4 | 12 | Pass/Fail with Portfolio |

Each has different learning outcomes and NACE competency requirements to show how synthesis adapts.

### Employer Projects (2)
Fictional but plausible companies with general professional skills projects:

| Employer | Industry | Project Type |
|----------|----------|--------------|
| Bridgewater Community Foundation | Nonprofit | Research & Analysis (donor engagement) |
| Horizon Strategic Consulting | Professional Services | Process Improvement (client onboarding) |

Projects avoid discipline-specific technical work. Focus on critical thinking, communication, research, and professional skills.

### Student Profiles (2)
Fictional students with different backgrounds, each usable for any project:

| Student | Major | Minor | Focus |
|---------|-------|-------|-------|
| Anna Liu | Psychology | Business Administration | Research methods, data analysis, organizational behavior |
| Ben Williams | Communications | Digital Media | Writing, storytelling, visual communication, client work |

In custom build flow, users can select a demo student or enter their own student information.

### Mock Outputs (8 combinations)
Pre-computed synthesis results for all 2×2×2 combinations (inst-{1,2}-emp-{1,2}-stu-{1,2}):
- Full curriculum matching institution's term length
- 5-7 learning objectives with full traceability
- Complete 4-type assessment strategy with weighted components
- Alignment crosswalk connecting all four inputs

---

## Technical Approach

### Stack
- HTML + CSS framework (Tailwind recommended)
- JavaScript framework for reactivity (Alpine.js or similar lightweight option)
- EJS or similar for server-side templating
- Express.js backend
- Claude API for real synthesis (with mock data fallback)
- Deployment: Vercel or similar

### AI Integration
- Real Claude API calls for custom projects
- Mock data for demo combinations (faster, consistent)
- Toggle between real AI and demo data for flexibility
- Server-side API proxy to protect API keys

### Key Screens as Single Page App
- Wizard steps as state changes, not page navigations
- Results tabs also state-based
- Smooth transitions between states

---

## What to Leave Unspecified

Let Claude Code make decisions on:
- Color palette and visual design
- Specific Tailwind utility classes
- Animation styles and transitions
- Icon choices
- Exact spacing and typography scale
- UI component styling details

Focus the PRD on:
- Information architecture
- User flow
- Data structures
- Feature requirements
- Content requirements

---

## Success Criteria

The prototype succeeds if someone watching the demo:
1. Understands what the three inputs are and why each matters
2. Sees that the output is genuinely personalized (different student = different experience)
3. Believes the framework is academically rigorous (not just AI-generated fluff)
4. Can imagine this working at their institution
5. Asks "when can we try this?"

---

## Out of Scope for Prototype

- User authentication
- Database persistence (beyond session)
- Mobile-first design
- Accessibility compliance beyond basics
- Production error handling
- Email notifications
- Multi-user collaboration
- Integration with LMS systems

---

## Sample Content Details

### NACE Competencies Reference

| Competency | Description |
|------------|-------------|
| **Critical Thinking** | Identify and respond to needs based on situational context and logical analysis |
| **Communication** | Clearly and effectively exchange information, ideas, and perspectives |
| **Teamwork** | Build and maintain collaborative relationships toward common goals |
| **Professionalism** | Understand and demonstrate effective work habits across contexts |
| **Technology** | Understand and leverage technologies ethically to enhance outcomes |
| **Leadership** | Recognize and capitalize on personal and team strengths toward goals |
| **Equity & Inclusion** | Demonstrate awareness and skills to equitably engage diverse perspectives |
| **Career & Self Development** | Proactively develop oneself through continual learning |

### DEAL Reflection Example Prompts

**Week 3 - Mid-project reflection:**
- **Describe:** What specific tasks did you complete this week? What tools or methods did you use?
- **Examine:** How did your prior coursework or experience prepare you (or not) for this work? What assumptions did you make that proved incorrect?
- **Articulate Learning:** What's one skill you've developed through this project that you didn't have before? How might you apply it in future contexts?

### Kolb Cycle Activity Examples

| Activity Type | Kolb Phase | Example |
|---------------|------------|---------|
| Data analysis work | Concrete Experience | Analyze user behavior data using SQL and visualization tools |
| Weekly mentor check-in | Reflective Observation | Discuss findings and challenges with employer mentor |
| Reading assignment | Abstract Conceptualization | Review article on best practices for product analytics |
| Draft deliverable | Active Experimentation | Apply insights to create initial recommendations document |

---

## Appendix: Sample Week Detail

**Week 4: Analysis Deep Dive**
*Theme: Pattern Recognition and Insight Development*

**Estimated time: 6 hours**

**Objectives for this week:**
- Apply analytical methods to identify significant patterns in the data
- Distinguish meaningful signals from noise
- Begin formulating evidence-based recommendations

**Activities:**

| Activity | Time | Kolb Phase |
|----------|------|------------|
| Complete second analysis iteration with refined approach | 3 hrs | Experience |
| Weekly mentor check-in: present initial patterns, get feedback | 30 min | Reflection |
| Read: "From Data to Decisions: Building Compelling Arguments" | 45 min | Conceptualization |
| Draft outline of key findings for final deliverable | 1.5 hrs | Experimentation |

**Deliverables due:**
- Analysis checkpoint: Key patterns identified with supporting evidence
- Week 4 DEAL reflection

**Reflection prompts (DEAL):**
- **Describe:** What patterns emerged from your analysis? What surprised you?
- **Examine:** How do you distinguish correlation from causation in this context? What additional information would make you more confident in your findings?
- **Articulate Learning:** What have you learned about how organizations use data to make decisions? How does this differ from academic research methods?

**Competency focus:**
- Primary: Critical Thinking
- Secondary: Communication (documenting findings clearly)
