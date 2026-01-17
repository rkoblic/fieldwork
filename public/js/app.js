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

    // UI state
    isInitializing: true,
    isLoading: false,
    error: null,
    resultsActiveTab: 'objectives',

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

        // Initialize custom forms with first demo data as template
        this.customInstitution = JSON.parse(JSON.stringify(institutions[0]));
        this.customEmployer = JSON.parse(JSON.stringify(employers[0]));
        this.customStudent = JSON.parse(JSON.stringify(students[0]));

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

    // Load synthesis (called from animation component)
    async loadSynthesis() {
      this.isLoading = true;
      try {
        if (this.mode === 'demo') {
          // Load pre-generated output
          const outputKey = `${this.selectedInstitution}-${this.selectedEmployer}-${this.selectedStudent}`;
          const response = await fetch(`/api/synthesis/demo/${outputKey}`);
          if (!response.ok) throw new Error('Synthesis not found');
          this.synthesisOutput = await response.json();
        } else {
          // Call Claude API for custom synthesis
          const response = await fetch('/api/synthesis/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              framework: this.framework,
              institution: this.customInstitution,
              employer: this.customEmployer,
              student: this.customStudent
            })
          });
          if (!response.ok) throw new Error('Synthesis failed');
          this.synthesisOutput = await response.json();
        }
        this.currentStep = 'results';
      } catch (e) {
        console.error('Synthesis error:', e);
        this.error = 'Failed to generate learning experience';
        this.currentStep = 'student'; // Go back to last input step
      }
      this.isLoading = false;
    },

    // Start over
    startOver() {
      this.currentStep = 'landing';
      this.synthesisOutput = null;
      this.resultsActiveTab = 'objectives';
      this.error = null;
    },

    // Copy demo data to custom forms
    useAsTemplate(type, id) {
      if (type === 'institution') {
        const inst = this.institutions.find(i => i.id === id);
        if (inst) {
          this.customInstitution = JSON.parse(JSON.stringify(inst));
          this.customInstitution.id = 'custom-inst';
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
