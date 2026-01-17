# FieldWork

AI-powered experiential learning design prototype that transforms employer projects into structured, academically rigorous learning experiences.

## What is FieldWork?

FieldWork synthesizes four inputs to create personalized field placement curricula:

1. **FieldWork Framework** - Pedagogical foundation (Kolb Cycle, DEAL Reflections, NACE Competencies)
2. **Institution Profile** - University requirements (term length, credits, learning outcomes)
3. **Employer Project** - Real-world project details (tasks, deliverables, skills needed)
4. **Student Profile** - Individual learner background (major, skills, interests)

The output is a complete learning experience including:
- Personalized learning objectives with traceability
- Week-by-week curriculum
- Assessment rubrics and deliverables
- Four-way alignment crosswalk

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Build Tailwind CSS
npm run tailwind:build

# Start the server
npm start
```

Open http://localhost:3000 in your browser.

### Development

```bash
# Run with hot reload (Tailwind watch + nodemon)
npm run dev
```

## Demo Mode vs Custom Mode

### Demo Mode
Explore pre-configured combinations of 2 institutions, 2 employers, and 2 students (8 total combinations). All data is pre-generated - no API key required.

### Custom Mode
Edit any profile or enter your own data. When custom data differs from demo templates, FieldWork calls the Claude API to generate a personalized synthesis.

To enable custom mode:
1. Copy `.env.example` to `.env`
2. Add your Anthropic API key: `ANTHROPIC_API_KEY=sk-ant-...`

## Demo Data

### Institutions
- **Westbrook University** - 12-week term, 3 credits, letter grades
- **Pacific Coast College** - 15-week term, 4 credits, pass/fail portfolio

### Employer Projects
- **Bridgewater Community Foundation** - Donor engagement research (nonprofit)
- **Horizon Strategic Consulting** - Client onboarding process improvement

### Student Profiles
- **Anna Liu** - Psychology major, Business minor, research/data skills
- **Ben Williams** - Communications major, Digital Media minor, content/writing skills

## Deployment

### Vercel

1. Push to a git repository
2. Import project in Vercel
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

The included `vercel.json` handles the Express server configuration.

## Project Structure

```
fieldwork/
├── server/           # Express backend
│   ├── index.js      # Entry point
│   ├── routes/       # API and page routes
│   └── services/     # Claude API integration
├── views/            # EJS templates
│   ├── index.ejs     # Main shell
│   └── partials/     # Modular components
├── public/           # Static assets
│   ├── css/          # Tailwind output
│   └── js/           # Alpine.js store
└── data/             # JSON data files
    └── outputs/      # Pre-generated syntheses
```

## Tech Stack

- **Express.js** - Backend server
- **EJS** - Server-side templating
- **Alpine.js** - Reactive UI components
- **Tailwind CSS** - Utility-first styling
- **Claude API** - AI synthesis for custom mode

## License

Proprietary - All rights reserved.
