// FieldWork - Alpine.js Application Store
document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    // Mode: 'demo' or 'custom'
    mode: 'demo',

    // Current wizard step
    currentStep: 'landing',

    // Step order for navigation
    steps: ['landing', 'framework', 'institution', 'employer', 'student', 'synthesizing', 'results'],

    // Selected IDs (for demo mode switching)
    selectedInstitution: 'inst-1',
    selectedEmployer: 'emp-1',
    selectedStudent: 'stu-1',

    // Loaded data
    framework: null,
    institutions: [],
    employers: [],
    students: [],

    // Current synthesis output
    synthesisOutput: null,

    // Custom mode form data
    customInstitution: null,
    customEmployer: null,
    customStudent: null,

    // Blank templates for custom mode
    blankInstitution: {
      id: 'custom-inst',
      name: '',
      termLengthWeeks: null,
      creditHours: null,
      hoursPerWeek: null,
      learnerLevel: '',
      experienceLevel: '',
      teamSize: '',
      assessmentApproach: '',
      learningOutcomes: [],
      additionalNaceCompetencies: []
    },

    blankEmployer: {
      id: 'custom-emp',
      companyName: '',
      industry: '',
      projectTitle: '',
      projectType: '',
      projectBrief: '',
      successCriteria: [],
      deliverables: [],
      timelineWeeks: null,
      hoursPerWeek: '',
      mentorSupport: '',
      resourcesProvided: []
    },

    blankStudent: {
      id: 'custom-stu',
      name: '',
      major: '',
      minor: '',
      year: '',
      gpa: '',
      resumeFileName: '',
      extractedSkills: [],
      relevantCoursework: [],
      learningGoalsNarrative: '',
      careerInterestsNarrative: ''
    },

    // Raw text for learning outcomes textarea (parsed on blur)
    learningOutcomesText: '',

    // Coursework options for multi-select
    courseworkOptions: [
      'Research Methods',
      'Statistics / Data Analysis',
      'Business Fundamentals',
      'Marketing Principles',
      'Communication / Writing',
      'Project Management',
      'Public Speaking',
      'Psychology / Behavioral Science',
      'Computer Science / Programming',
      'Design / Visual Media',
      'Economics / Finance',
      'Ethics / Social Responsibility'
    ],

    // UI state
    isInitializing: true,
    isLoading: false,
    error: null,
    resultsActiveTab: 'objectives',
    resumeUploading: false,
    resumeError: null,

    // Progressive synthesis state (backwards design order)
    synthesisPhases: [
      { id: 'objectives', label: 'Learning Objectives', status: 'pending', data: null, summary: null },
      { id: 'assessment', label: 'Assessment', status: 'pending', data: null, summary: null },
      { id: 'curriculum', label: 'Curriculum', status: 'pending', data: null, summary: null },
      { id: 'sample-week', label: 'Sample Week', status: 'pending', data: null, summary: null },
      { id: 'alignment', label: 'Alignment', status: 'pending', data: null, summary: null }
    ],
    synthesisError: null,
    failedPhaseIndex: null,

    // Computed helpers
    get currentStepIndex() {
      return this.steps.indexOf(this.currentStep);
    },

    get activeInstitution() {
      if (this.mode === 'demo') {
        return this.institutions.find(i => i.id === this.selectedInstitution);
      }
      return this.customInstitution;
    },

    get activeEmployer() {
      if (this.mode === 'demo') {
        return this.employers.find(e => e.id === this.selectedEmployer);
      }
      return this.customEmployer;
    },

    get activeStudent() {
      if (this.mode === 'demo') {
        return this.students.find(s => s.id === this.selectedStudent);
      }
      return this.customStudent;
    },

    // Initialize app
    async init() {
      this.isInitializing = true;
      try {
        const [framework, institutions, employers, students] = await Promise.all([
          fetch('/api/data/framework').then(r => r.json()),
          fetch('/api/data/institutions').then(r => r.json()),
          fetch('/api/data/employers').then(r => r.json()),
          fetch('/api/data/students').then(r => r.json())
        ]);

        this.framework = framework;
        this.institutions = institutions;
        this.employers = employers;
        this.students = students;

        // Initialize custom forms with blank templates
        this.customInstitution = JSON.parse(JSON.stringify(this.blankInstitution));
        this.customEmployer = JSON.parse(JSON.stringify(this.blankEmployer));
        this.customStudent = JSON.parse(JSON.stringify(this.blankStudent));

      } catch (e) {
        console.error('Failed to load initial data:', e);
        this.error = 'Failed to load data';
      }
      this.isInitializing = false;
    },

    // Set mode and start wizard
    setMode(mode) {
      this.mode = mode;
      this.currentStep = 'framework';
      this.synthesisOutput = null;
      this.resultsActiveTab = 'objectives';
    },

    // Navigate to specific step
    goToStep(step) {
      if (this.steps.includes(step) && this.currentStep !== 'synthesizing') {
        // Don't allow jumping ahead past current progress in wizard
        const targetIndex = this.steps.indexOf(step);
        const currentIndex = this.currentStepIndex;

        // Allow going back or to already visited steps
        if (targetIndex <= currentIndex || this.synthesisOutput) {
          this.currentStep = step;
        }
      }
    },

    // Go to next step
    nextStep() {
      const nextIndex = this.currentStepIndex + 1;
      if (nextIndex < this.steps.length) {
        this.currentStep = this.steps[nextIndex];
      }
    },

    // Go to previous step
    prevStep() {
      const prevIndex = this.currentStepIndex - 1;
      if (prevIndex >= 0 && this.currentStep !== 'synthesizing') {
        this.currentStep = this.steps[prevIndex];
      }
    },

    // Load synthesis (called from synthesizing component)
    async loadSynthesis() {
      this.isLoading = true;
      this.synthesisError = null;
      this.failedPhaseIndex = null;

      // Ensure learning outcomes are parsed before synthesis
      if (this.mode === 'custom') {
        this.parseLearningOutcomes();
      }

      try {
        if (this.mode === 'demo') {
          // Load pre-generated output - no progressive synthesis needed
          const outputKey = `${this.selectedInstitution}-${this.selectedEmployer}-${this.selectedStudent}`;
          const response = await fetch(`/api/synthesis/demo/${outputKey}`);
          if (!response.ok) throw new Error('Synthesis not found');
          this.synthesisOutput = await response.json();
          // Mark all phases complete for demo mode
          this.synthesisPhases.forEach(p => p.status = 'complete');
          this.currentStep = 'results';
        } else {
          // Progressive synthesis for custom mode
          await this.runProgressiveSynthesis();
        }
      } catch (e) {
        console.error('Synthesis error:', e);
        this.error = e.message || 'Failed to generate learning experience';
      }
      this.isLoading = false;
    },

    // Reset synthesis phases to pending state
    resetSynthesisPhases() {
      this.synthesisPhases = [
        { id: 'objectives', label: 'Learning Objectives', status: 'pending', data: null, summary: null },
        { id: 'assessment', label: 'Assessment', status: 'pending', data: null, summary: null },
        { id: 'curriculum', label: 'Curriculum', status: 'pending', data: null, summary: null },
        { id: 'sample-week', label: 'Sample Week', status: 'pending', data: null, summary: null },
        { id: 'alignment', label: 'Alignment', status: 'pending', data: null, summary: null }
      ];
      this.synthesisError = null;
      this.failedPhaseIndex = null;
    },

    // Execute a phase with retry logic
    async executePhaseWithRetry(phaseFn, phaseIndex, maxRetries = 2) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await phaseFn();
        } catch (error) {
          if (attempt < maxRetries) {
            this.synthesisPhases[phaseIndex].status = 'retrying';
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw error;
        }
      }
    },

    // Progressive synthesis orchestration
    async runProgressiveSynthesis(startFromPhase = 0) {
      const inputs = {
        framework: this.framework,
        institution: this.customInstitution,
        employer: this.customEmployer,
        student: this.customStudent
      };

      // Initialize synthesis output if starting fresh
      if (startFromPhase === 0) {
        this.synthesisOutput = {
          metadata: {
            institutionId: inputs.institution.id || 'custom-inst',
            employerId: inputs.employer.id || 'custom-emp',
            studentId: inputs.student.id || 'custom-stu',
            generatedAt: new Date().toISOString(),
            termLengthWeeks: inputs.institution.termLengthWeeks
          }
        };
      }

      try {
        // Phase 1: Learning Objectives
        if (startFromPhase <= 0) {
          this.synthesisPhases[0].status = 'in-progress';
          const objectivesResult = await this.executePhaseWithRetry(async () => {
            const response = await fetch('/api/synthesis/phase/objectives', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(inputs)
            });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Failed to generate objectives');
            }
            return response.json();
          }, 0);

          this.synthesisOutput.learningObjectives = objectivesResult.learningObjectives;
          this.synthesisPhases[0].data = objectivesResult;
          this.synthesisPhases[0].summary = `${objectivesResult.learningObjectives.length} objectives`;
          this.synthesisPhases[0].status = 'complete';
        }

        // Phase 2: Assessment
        if (startFromPhase <= 1) {
          this.synthesisPhases[1].status = 'in-progress';
          const assessmentResult = await this.executePhaseWithRetry(async () => {
            const response = await fetch('/api/synthesis/phase/assessment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...inputs,
                objectives: { learningObjectives: this.synthesisOutput.learningObjectives }
              })
            });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Failed to generate assessment');
            }
            return response.json();
          }, 1);

          this.synthesisOutput.assessment = assessmentResult.assessment;
          this.synthesisPhases[1].data = assessmentResult;
          this.synthesisPhases[1].summary = `${assessmentResult.assessment.deliverables.items.length} deliverables`;
          this.synthesisPhases[1].status = 'complete';
        }

        // Phase 3: Curriculum
        if (startFromPhase <= 2) {
          this.synthesisPhases[2].status = 'in-progress';
          const assessmentSummary = {
            deliverables: this.synthesisOutput.assessment.deliverables.items.map(d => ({
              name: d.name,
              dueWeek: d.dueWeek,
              weight: d.weight
            })),
            weights: this.synthesisOutput.assessment.weights
          };

          const curriculumResult = await this.executePhaseWithRetry(async () => {
            const response = await fetch('/api/synthesis/phase/curriculum', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...inputs,
                objectives: { learningObjectives: this.synthesisOutput.learningObjectives },
                assessmentSummary
              })
            });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Failed to generate curriculum');
            }
            return response.json();
          }, 2);

          this.synthesisOutput.curriculum = curriculumResult.curriculum;
          this.synthesisPhases[2].data = curriculumResult;
          this.synthesisPhases[2].summary = `${curriculumResult.curriculum.weeks.length} weeks`;
          this.synthesisPhases[2].status = 'complete';
        }

        // Phase 4: Sample Week
        if (startFromPhase <= 3) {
          this.synthesisPhases[3].status = 'in-progress';
          // Use week 4 (or mid-term week) as base
          const midWeekIndex = Math.min(3, this.synthesisOutput.curriculum.weeks.length - 1);
          const baseWeek = this.synthesisOutput.curriculum.weeks[midWeekIndex];

          const sampleWeekResult = await this.executePhaseWithRetry(async () => {
            const response = await fetch('/api/synthesis/phase/sample-week', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...inputs,
                objectives: { learningObjectives: this.synthesisOutput.learningObjectives },
                baseWeek
              })
            });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Failed to generate sample week');
            }
            return response.json();
          }, 3);

          this.synthesisOutput.sampleWeek = sampleWeekResult.sampleWeek;
          this.synthesisPhases[3].data = sampleWeekResult;
          this.synthesisPhases[3].summary = `Week ${sampleWeekResult.sampleWeek.weekNumber}`;
          this.synthesisPhases[3].status = 'complete';
        }

        // Phase 5: Alignment
        if (startFromPhase <= 4) {
          this.synthesisPhases[4].status = 'in-progress';
          const curriculumSummary = {
            weekThemes: this.synthesisOutput.curriculum.weeks.map(w => w.theme)
          };
          const assessmentSummary = {
            deliverables: this.synthesisOutput.assessment.deliverables.items.map(d => ({
              name: d.name,
              dueWeek: d.dueWeek,
              weight: d.weight
            }))
          };

          const alignmentResult = await this.executePhaseWithRetry(async () => {
            const response = await fetch('/api/synthesis/phase/alignment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...inputs,
                objectives: { learningObjectives: this.synthesisOutput.learningObjectives },
                assessmentSummary,
                curriculumSummary
              })
            });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Failed to generate alignment');
            }
            return response.json();
          }, 4);

          this.synthesisOutput.alignment = alignmentResult.alignment;
          this.synthesisPhases[4].data = alignmentResult;
          this.synthesisPhases[4].summary = 'Complete';
          this.synthesisPhases[4].status = 'complete';
        }

        // All phases complete - go to results
        this.currentStep = 'results';

      } catch (error) {
        console.error('Progressive synthesis error:', error);
        // Find which phase failed
        const failedIndex = this.synthesisPhases.findIndex(p => p.status === 'in-progress' || p.status === 'retrying');
        if (failedIndex >= 0) {
          this.synthesisPhases[failedIndex].status = 'failed';
          this.failedPhaseIndex = failedIndex;
        }
        this.synthesisError = error.message || 'Synthesis failed';
        throw error;
      }
    },

    // Retry synthesis from failed phase
    async retrySynthesis() {
      if (this.failedPhaseIndex === null) return;

      this.isLoading = true;
      this.synthesisError = null;
      const retryFrom = this.failedPhaseIndex;
      this.failedPhaseIndex = null;

      try {
        await this.runProgressiveSynthesis(retryFrom);
      } catch (e) {
        console.error('Retry failed:', e);
      }

      this.isLoading = false;
    },

    // View partial results (go to results with incomplete data)
    viewPartialResults() {
      if (this.synthesisOutput && this.synthesisOutput.learningObjectives) {
        this.currentStep = 'results';
      }
    },

    // Check if a tab has data available
    isTabAvailable(tabId) {
      if (this.mode === 'demo') return true;
      if (!this.synthesisOutput) return false;

      switch (tabId) {
        case 'objectives':
          return !!this.synthesisOutput.learningObjectives;
        case 'assessment':
          return !!this.synthesisOutput.assessment;
        case 'curriculum':
          return !!this.synthesisOutput.curriculum;
        case 'sample-week':
          return !!this.synthesisOutput.sampleWeek;
        case 'alignment':
          return !!this.synthesisOutput.alignment;
        default:
          return false;
      }
    },

    // Get completed phase count
    get completedPhasesCount() {
      return this.synthesisPhases.filter(p => p.status === 'complete').length;
    },

    // Get current phase label
    get currentPhaseLabel() {
      const inProgress = this.synthesisPhases.find(p => p.status === 'in-progress' || p.status === 'retrying');
      if (inProgress) return inProgress.label;
      const failed = this.synthesisPhases.find(p => p.status === 'failed');
      if (failed) return `${failed.label} (Failed)`;
      return 'Complete';
    },

    // Start over
    startOver() {
      this.currentStep = 'landing';
      this.synthesisOutput = null;
      this.resultsActiveTab = 'objectives';
      this.error = null;
      this.resetSynthesisPhases();
    },

    // Copy demo data to custom forms
    useAsTemplate(type, id) {
      if (type === 'institution') {
        const inst = this.institutions.find(i => i.id === id);
        if (inst) {
          this.customInstitution = JSON.parse(JSON.stringify(inst));
          this.customInstitution.id = 'custom-inst';
          this.learningOutcomesText = (inst.learningOutcomes || []).join('\n');
        }
      } else if (type === 'employer') {
        const emp = this.employers.find(e => e.id === id);
        if (emp) {
          this.customEmployer = JSON.parse(JSON.stringify(emp));
          this.customEmployer.id = 'custom-emp';
        }
      } else if (type === 'student') {
        const stu = this.students.find(s => s.id === id);
        if (stu) {
          this.customStudent = JSON.parse(JSON.stringify(stu));
          this.customStudent.id = 'custom-stu';
        }
      }
    },

    // Reset custom form to blank
    resetCustomForm(type) {
      if (type === 'institution') {
        this.customInstitution = JSON.parse(JSON.stringify(this.blankInstitution));
        this.learningOutcomesText = '';
      } else if (type === 'employer') {
        this.customEmployer = JSON.parse(JSON.stringify(this.blankEmployer));
      } else if (type === 'student') {
        this.customStudent = JSON.parse(JSON.stringify(this.blankStudent));
        this.resumeError = null;
      }
    },

    // Upload resume and extract skills via API
    async uploadResume(file) {
      if (!file) return;

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.resumeError = 'Please upload a PDF, DOC, or DOCX file';
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.resumeError = 'File size must be less than 5MB';
        return;
      }

      this.resumeUploading = true;
      this.resumeError = null;

      try {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch('/api/resume/extract-skills', {
          method: 'POST',
          body: formData,
          cache: 'no-store'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to extract skills');
        }

        const result = await response.json();
        this.customStudent.resumeFileName = result.fileName;
        this.customStudent.extractedSkills = result.skills;
      } catch (e) {
        console.error('Resume upload error:', e);
        this.resumeError = e.message || 'Failed to process resume';
      }

      this.resumeUploading = false;
    },

    // Clear uploaded resume
    clearResume() {
      this.customStudent.resumeFileName = '';
      this.customStudent.extractedSkills = [];
      this.resumeError = null;
    },

    // Add a skill to extracted skills
    addSkill(skill) {
      if (!skill || !skill.trim()) return;
      const trimmed = skill.trim();
      if (!this.customStudent.extractedSkills) {
        this.customStudent.extractedSkills = [];
      }
      if (!this.customStudent.extractedSkills.includes(trimmed)) {
        this.customStudent.extractedSkills.push(trimmed);
      }
    },

    // Remove a skill by index
    removeSkill(index) {
      if (this.customStudent.extractedSkills && index >= 0) {
        this.customStudent.extractedSkills.splice(index, 1);
      }
    },

    // Toggle coursework in relevant coursework array
    toggleCoursework(course) {
      if (!this.customStudent.relevantCoursework) {
        this.customStudent.relevantCoursework = [];
      }
      const index = this.customStudent.relevantCoursework.indexOf(course);
      if (index === -1) {
        this.customStudent.relevantCoursework.push(course);
      } else {
        this.customStudent.relevantCoursework.splice(index, 1);
      }
    },

    // Toggle NACE competency in array
    toggleNaceCompetency(compId) {
      if (!this.customInstitution.additionalNaceCompetencies) {
        this.customInstitution.additionalNaceCompetencies = [];
      }
      const index = this.customInstitution.additionalNaceCompetencies.indexOf(compId);
      if (index === -1) {
        this.customInstitution.additionalNaceCompetencies.push(compId);
      } else {
        this.customInstitution.additionalNaceCompetencies.splice(index, 1);
      }
    },

    // Parse learning outcomes from textarea text to array (called on blur)
    parseLearningOutcomes() {
      const outcomes = this.learningOutcomesText.split('\n')
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(line => line.length > 0);
      this.customInstitution.learningOutcomes = outcomes;
    },

    // Helper to get NACE competency name by ID
    getNaceCompetencyName(id) {
      if (!id || !this.framework?.naceCompetencies) return id;
      const allComps = [
        ...(this.framework.naceCompetencies.required || []),
        ...(this.framework.naceCompetencies.optional || [])
      ];
      const comp = allComps.find(c => c.id === id);
      return comp ? comp.name : id;
    },

    // Helper to normalize naceCompetency to array (handles both string and array)
    getNaceCompetencies(obj) {
      if (!obj?.naceCompetency) return [];
      return Array.isArray(obj.naceCompetency) ? obj.naceCompetency : [obj.naceCompetency];
    },

    // Helper to get Kolb phase name by ID
    getKolbPhaseName(id) {
      if (!id || !this.framework?.learningStrategies?.kolbCycle?.phases) return id;
      const phase = this.framework.learningStrategies.kolbCycle.phases.find(p => p.id === id);
      return phase ? phase.name : id;
    },

    // Helper to get learning objective by ID
    getLearningObjective(id) {
      if (!id || !this.synthesisOutput?.learningObjectives) return null;
      return this.synthesisOutput.learningObjectives.find(obj => obj.id === id);
    },

    // Helper to get 1-based objective number by ID
    getObjectiveNumber(id) {
      if (!id || !this.synthesisOutput?.learningObjectives) return null;
      const index = this.synthesisOutput.learningObjectives.findIndex(obj => obj.id === id);
      return index >= 0 ? index + 1 : null;
    },

    // Get unique NACE competencies with their linked objectives
    getNaceCompetenciesWithObjectives() {
      const objectives = this.synthesisOutput?.learningObjectives || [];
      const map = {};
      objectives.forEach((obj, index) => {
        const competencies = this.getNaceCompetencies(obj);
        competencies.forEach(nace => {
          if (!map[nace]) map[nace] = [];
          map[nace].push(index + 1); // LO numbers are 1-indexed
        });
      });
      return Object.entries(map).map(([id, loNumbers]) => ({
        id,
        name: this.getNaceCompetencyName(id),
        objectives: loNumbers
      }));
    },

    // Get full name for experiential competency ID
    getExperientialCompetencyName(id) {
      const names = {
        'purposeful-engagement': 'Purposeful Engagement',
        'reflective-practice': 'Reflective Practice',
        'integrative-learning': 'Integrative Learning',
        'transfer-capacity': 'Transfer Capacity'
      };
      return names[id] || id;
    },

    // Categorize addressedBy items by type
    getAddressedByType(item) {
      if (item.startsWith('obj-')) return 'objective';
      if (/Report|Analysis|Presentation/i.test(item)) return 'deliverable';
      return 'activity';
    },

    // Get badge classes based on item type
    getAddressedByBadgeClasses(item) {
      const type = this.getAddressedByType(item);
      if (type === 'objective') return 'bg-primary-100 text-primary-700';
      if (type === 'deliverable') return 'bg-amber-100 text-amber-700';
      return 'bg-slate-100 text-slate-600';
    },

    // Format addressedBy item for display
    formatAddressedByItem(item) {
      // Convert obj-N to LO N format
      if (item.startsWith('obj-')) {
        const num = item.replace('obj-', '');
        return `LO ${num}`;
      }
      return item;
    },

    // Get performance level badge color for rubric legend
    getPerformanceLevelColor(levelId, gradingType) {
      if (gradingType === 'letter-grade') {
        const colors = {
          'exemplary': 'bg-emerald-100 text-emerald-700',
          'proficient': 'bg-blue-100 text-blue-700',
          'developing': 'bg-amber-100 text-amber-700',
          'beginning': 'bg-red-100 text-red-700'
        };
        return colors[levelId] || 'bg-slate-100 text-slate-700';
      } else {
        // pass-fail
        const colors = {
          'exceeds': 'bg-emerald-100 text-emerald-700',
          'meets': 'bg-blue-100 text-blue-700',
          'approaching': 'bg-amber-100 text-amber-700',
          'not-yet': 'bg-red-100 text-red-700'
        };
        return colors[levelId] || 'bg-slate-100 text-slate-700';
      }
    },

    // Get performance level header background color for rubric table
    getPerformanceLevelHeaderColor(levelId, gradingType) {
      if (gradingType === 'letter-grade') {
        const colors = {
          'exemplary': 'bg-emerald-50',
          'proficient': 'bg-blue-50',
          'developing': 'bg-amber-50',
          'beginning': 'bg-red-50'
        };
        return colors[levelId] || 'bg-slate-50';
      } else {
        const colors = {
          'exceeds': 'bg-emerald-50',
          'meets': 'bg-blue-50',
          'approaching': 'bg-amber-50',
          'not-yet': 'bg-red-50'
        };
        return colors[levelId] || 'bg-slate-50';
      }
    },

    // Get performance level cell background color for rubric table
    getPerformanceLevelCellColor(levelId, gradingType) {
      if (gradingType === 'letter-grade') {
        const colors = {
          'exemplary': 'bg-emerald-50/50',
          'proficient': 'bg-blue-50/50',
          'developing': 'bg-amber-50/50',
          'beginning': 'bg-red-50/50'
        };
        return colors[levelId] || '';
      } else {
        const colors = {
          'exceeds': 'bg-emerald-50/50',
          'meets': 'bg-blue-50/50',
          'approaching': 'bg-amber-50/50',
          'not-yet': 'bg-red-50/50'
        };
        return colors[levelId] || '';
      }
    },

    // Get performance level text color for mobile view
    getPerformanceLevelTextColor(levelId, gradingType) {
      if (gradingType === 'letter-grade') {
        const colors = {
          'exemplary': 'text-emerald-700',
          'proficient': 'text-blue-700',
          'developing': 'text-amber-700',
          'beginning': 'text-red-700'
        };
        return colors[levelId] || 'text-slate-700';
      } else {
        const colors = {
          'exceeds': 'text-emerald-700',
          'meets': 'text-blue-700',
          'approaching': 'text-amber-700',
          'not-yet': 'text-red-700'
        };
        return colors[levelId] || 'text-slate-700';
      }
    }
  });
});

// Alpine.js collapse plugin (simple implementation)
document.addEventListener('alpine:init', () => {
  Alpine.directive('collapse', (el, { expression }, { effect, evaluateLater }) => {
    const getShow = evaluateLater(expression);

    el.style.overflow = 'hidden';

    effect(() => {
      getShow(show => {
        if (show) {
          el.style.height = 'auto';
          const height = el.scrollHeight + 'px';
          el.style.height = '0px';
          el.offsetHeight; // Force reflow
          el.style.transition = 'height 0.3s ease-out';
          el.style.height = height;
          setTimeout(() => {
            el.style.height = 'auto';
          }, 300);
        } else {
          el.style.height = el.scrollHeight + 'px';
          el.offsetHeight; // Force reflow
          el.style.transition = 'height 0.3s ease-out';
          el.style.height = '0px';
        }
      });
    });
  });
});
