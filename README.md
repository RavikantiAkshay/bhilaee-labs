# Basic Labs Guide — Virtual Labs (EEE) ⚡

A structured virtual laboratory platform for **Electrical & Electronics Engineering** students, providing comprehensive experiment guides, observation data, circuit diagrams, and interactive simulations.

> **Status**: Active Development · **23 / 90** experiments fully populated

---

## ✨ Features

### 🏠 Homepage
- **Labs Dashboard** — Access all **9 core EEE labs** at a glance via interactive cards.
- **Cross-Lab Experiment Search** — Search any experiment by name across all labs; results appear in place of the grid with lab name badges on each card.
- **Responsive Grid** — Adapts seamlessly across desktop, tablet, and mobile.

### 📘 Lab Landing Pages
- **Metadata Bar** — Lab code, nature (Hardware / Simulation / Theory), total experiments.
- **Experiment Cards** — Each card shows experiment number, title, and status badge.
- **Status Indicators** — Color-coded: `Simulation Available`, `Hardware-Oriented`, `Software-Oriented`, `Guide Only`.

### 🧪 Experiment Pages
- **Structured Sections** — Every experiment follows a fixed academic flow:
  > Aim → Apparatus → Theory → Pre-Lab → Procedure → Simulation → Observations → Calculations → Results & Analysis → Post-Lab / Viva Voce → Conclusion → References
- **Rich Content Rendering** — Supports:
  - Formatted text with **bold**, *italic*, and clickable links
  - Ordered & unordered lists
  - Data tables (with responsive horizontal scroll)
  - Circuit diagram and hardware observation images (via Asset Registry)
  - LaTeX equations (powered by KaTeX)
  - Syntax-highlighted code blocks (Verilog, VHDL, Properties, etc.)
- **Sticky Sidebar TOC** — Auto-generated from applicable sections (desktop).
- **Graceful Degradation** — Sections marked "Not Applicable" are hidden cleanly.

### 🚀 Simulation Integration
- **Launch Simulator** — One-click button opens the external circuit simulator in a new tab.
- **Shared Simulations** — Experiments across different labs can share the same simulator (e.g., Devices & Circuits Exp 1 reuses Basic EE Exp 4's transient simulator).
- **Context-Aware Notes** — Experiment-specific hints (e.g., "Set simulation type to Transient Analysis").

### 🎨 UI / UX
- **Clean Academic Design** — Professional typography, consistent spacing, muted color palette.
- **Viva Voce Styling** — Q&A sections with accent-bordered question highlights.
- **Mobile-First** — Responsive layout with collapsible sidebar on smaller screens.

---

## 📊 Content Progress

| Lab | Code | Experiments | Complete | Details |
|-----|------|:-----------:|:--------:|---------|
| Basic Electrical Engineering | EEL101 | 10 | **7** | Exp 1–7 ✅ (6 with simulations) |
| Digital Electronics | EEP210 | 10 | **8** | Exp 1–8 ✅ (FPGA-based) |
| Instrumentation Lab | EEP307 | 10 | **5** | Exp 1–5 ✅ (ESP32-based) |
| Devices and Circuits | EEP209 | 10 | **1** | Exp 1 ✅ (shares Basic EE sim) |
| Control System Lab | EEP308 | 10 | **1** | Exp 1 ✅ |
| Machines Lab | EEP306 | 10 | **1** | Exp 1 ✅ (shares Basic EE sim) |
| Power System Lab | EEP305 | 10 | 0 | Skeleton |
| Sensor Lab | EEP304 | 10 | 0 | Skeleton |
| Power Electronics Lab | EEP309 | 10 | 0 | Skeleton |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------:|
| Framework | **Next.js 15** (App Router) |
| UI | **React 19** + CSS Modules |
| Math | **KaTeX** via `react-katex` |
| Data | JSON files + dynamic imports |
| Hosting | Vercel |

---

## 📦 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/RavikantiAkshay/basic-lab-guide.git
cd basic-lab-guide

# 2. Install dependencies
npm install

# 3. Create environment file
echo "NEXT_PUBLIC_SIMULATOR_URL=<your-simulator-url>" > .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
basic-lab-guide/
├── app/                          # Next.js App Router
│   ├── page.js                   # Homepage (server → HomeContent)
│   ├── layout.js                 # Root layout (Header + Footer)
│   ├── globals.css               # Design tokens & global styles
│   └── lab/
│       └── [slug]/               # Dynamic Lab Landing Page
│           └── experiment/
│               └── [experimentId]/  # Dynamic Experiment Page
│
├── components/
│   ├── Header.js                 # Global navigation bar
│   ├── Footer.js                 # Global footer
│   ├── HomeContent.js            # Home page client component (search + grid)
│   ├── SearchBar.js              # Cross-lab experiment search input
│   ├── SearchBar.module.css      # Search UI styles
│   ├── ExperimentCard.js         # Lab page experiment cards
│   ├── ExperimentList.js         # Grid container for cards
│   ├── LabHeader.js              # Lab title + breadcrumb
│   ├── LabMetadata.js            # Lab info bar (code, nature, count)
│   ├── LabComponents.module.css  # Styles for lab page components
│   └── experiment/
│       ├── ExperimentLayout.js   # Sidebar + content shell
│       ├── ContentBlock.js       # Universal content renderer
│       └── Experiment.module.css # Experiment page styles
│
├── data/
│   ├── labs.js                   # Lab metadata + getAllExperiments()
│   ├── experiments.js            # Experiment loader (async JSON import)
│   ├── experiment_schema.js      # Section order, titles, enums
│   └── experiments/
│       ├── registry.json         # Master index (90 experiments)
│       ├── basic-electrical-engineering/
│       │   ├── exp-{1..7}.json        # Fully populated experiments
│       │   └── exp-{1..7}.assets.json # Asset registries
│       ├── digital-electronics/
│       │   ├── exp-{1..8}.json        # Fully populated experiments
│       │   └── exp-{1..8}.assets.json # Asset registries
│       ├── instrumentation-lab/
│       │   ├── exp-{1..5}.json
│       │   └── exp-{1..5}.assets.json
│       ├── devices-and-circuits/
│       │   ├── exp-1.json + assets
│       ├── control-system-lab/
│       │   └── exp-1.json
│       └── machines-lab/
│           ├── exp-1.json + assets
│
├── public/
│   └── assets/
│       └── labs/                  # Experiment images & diagrams
│           ├── basic-electrical-engineering/
│           ├── digital-electronics/
│           ├── instrumentation-lab/
│           ├── devices-and-circuits/
│           └── machines-lab/
│
├── scripts/                       # Utility scripts
├── package.json
└── next.config.mjs
```

---

## 🧩 Data Schema

Each experiment JSON file follows a strict schema:

```jsonc
{
  "id": "exp-1",
  "title": "Experiment Title",
  "labId": "basic-electrical-engineering",
  "status": "Simulation Available",  // | "Hardware-Oriented" | "Software-Oriented" | "Guide Only"
  "meta": {
    "simulationId": "basic-ee-exp-4",  // optional — links to external simulator
    "experimentType": "hardware",
    "difficulty": "intermediate",
    "estimatedTimeMinutes": 120
  },
  "sections": {
    "aim":         { "id": "aim",         "title": "Aim",         "isApplicable": true, "content": [...] },
    "apparatus":   { ... },
    "theory":      { ... },
    "preLab":      { ... },        // Circuit diagrams via assetId
    "procedure":   { ... },
    "simulation":  { ..., "route": "default" },   // Simulator launch
    "observation": { ... },        // Tables, hardware photos
    "calculation": { ... },
    "result":      { ... },
    "postLab":     { ... },        // Viva Voce Q&A
    "conclusion":  { ... },
    "resources":   { ... }
  }
}
```

**Content block types**: `text`, `list`, `table`, `image`, `code`, `equation`

**Asset registries** (`*.assets.json`) map `assetId` keys to file paths and descriptions under `public/assets/labs/`.

---

## 📝 License

Internal Use — Department of Electrical Engineering
