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
│   └── partials/             # EJS partials for each section
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
