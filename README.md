# Bhilai EE Labs Guide

A structured virtual laboratory platform for **Electrical & Electronics Engineering** students. Provides comprehensive experiment guides with observations, circuit diagrams, equations, and one-click access to an interactive circuit simulator.

**Live →** [bhilaee-labs.vercel.app](https://bhilaee-labs.vercel.app)
**Companion App →** [Bhilai EE Circuit Simulator](https://bhilaee-simulator.vercel.app) · [Repository](https://github.com/RavikantiAkshay/basic-simulator)

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Next.js 15 (App Router)                            │
│                                                     │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │ registry │───►│  labs.js     │───►│ Homepage  │  │
│  │  .json   │    │ (merge meta) │    │ (cards)   │  │
│  └──────────┘    └──────────────┘    └───────────┘  │
│                                                     │
│  /lab/[slug]/experiment/[experimentId]               │
│  ┌───────────────────────────────────────────────┐  │
│  │  experiments.js                               │  │
│  │  1. Read registry → find fileName             │  │
│  │  2. fs.readFile(exp-N.json)                   │  │
│  │  3. fs.readFile(exp-N.assets.json)            │  │
│  │  4. Merge into experiment object              │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────▼───────────────────────────┐  │
│  │  ExperimentLayout.js                          │  │
│  │  ├── Sidebar TOC (from applicable sections)   │  │
│  │  ├── ContentBlock renderer (6 content types)  │  │
│  │  └── "Launch Simulator" button                │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Page Hierarchy

```
/                                      → Homepage (all 9 labs as cards)
/lab/[slug]                            → Lab Landing Page (experiment list)
/lab/[slug]/experiment/[experimentId]   → Experiment Page (full content)
```

| URL Example | Renders |
|-------------|---------|
| `/` | Homepage with 9 lab cards + cross-lab search |
| `/lab/basic-electrical-engineering` | Lab page with experiment cards |
| `/lab/devices-and-circuits/experiment/4` | Experiment 4 of DnC lab |

---

## Data Flow

### How Experiment Data Loads

```
registry.json
    ↓
labs.js reads registry, merges with lab metadata (code, name, nature)
    ↓
Lab Landing Page renders experiment cards with status badges
    ↓
User clicks an experiment card
    ↓
experiments.js reads the JSON file:
    data/experiments/<labSlug>/exp-<N>.json
    ↓
Also tries to load sidecar asset file:
    data/experiments/<labSlug>/exp-<N>.assets.json
    ↓
Merges both into a single experiment object
    ↓
ExperimentLayout.js renders with ContentBlock components
```

### Registry (`registry.json`)

The master index mapping all labs to their experiments:

```json
{
  "labs": {
    "basic-electrical-engineering": {
      "name": "Basic Electrical Engineering",
      "experiments": [
        { "id": "1", "title": "...", "fileName": "exp-1.json", "status": "Simulation Available", "completeness": 1 },
        { "id": "2", ... }
      ]
    },
    "devices-and-circuits": { ... }
  }
}
```

The `status` field controls the color-coded badge shown on experiment cards:

| Status | Badge Color | Meaning |
|--------|:-----------:|---------|
| `Simulation Available` | Green | Has a linked interactive simulation |
| `Hardware-Oriented` | Orange | Hardware-only, no simulation |
| `Software-Oriented` | Blue | Software/FPGA-based experiment |
| `Guide Only` | Gray | Documentation only, placeholder |

---

## Experiment JSON Schema

Every experiment follows a strict structure defined in `experiment_schema.js`:

```json
{
  "id": "exp-4",
  "title": "Mathematical Operations with Op-Amps",
  "labId": "devices-and-circuits",
  "status": "Simulation Available",
  "meta": {
    "simulationId": "devices_and_circuits-exp4",
    "simulationType": "Transient / DC Analysis",
    "experimentType": "hardware",
    "status": "simulation-available",
    "difficulty": "intermediate",
    "estimatedTimeMinutes": 120,
    "version": "1.1.0",
    "contentState": "complete",
    "reviewStatus": "unreviewed"
  },
  "sections": {
    "aim":         { "id": "aim",         "isApplicable": true, "content": [...] },
    "apparatus":   { ... },
    "theory":      { ... },
    "preLab":      { ... },
    "procedure":   { ... },
    "simulation":  { "route": "default", ... },
    "observation": { ... },
    "calculation": { ... },
    "result":      { ... },
    "conclusion":  { ... },
    "postLab":     { ... },
    "resources":   { ... }
  }
}
```

### Section Order (Fixed)

Experiments always render sections in this order:

> Aim → Apparatus & Software → Theory → Pre-Lab / Circuit Diagram → Procedure → Simulation / Execution → Observations → Calculations → Results & Analysis → Conclusion → Post-Lab / Viva Voce → References & Resources

Sections with `"isApplicable": false` are hidden from the page and sidebar.

### Content Block Types

The `content` array in each section contains typed blocks rendered by `ContentBlock.js`:

| Type | Renders | Key Fields |
|------|---------|------------|
| `text` | Rich text with **bold**, *italic*, links | `content` (string) |
| `list` | Ordered or unordered list | `style` ("ordered"/"unordered"), `items` |
| `table` | Data table with horizontal scroll | `headers`, `rows` |
| `image` | Image from asset registry | `assetId`, `caption`, `role` |
| `equation` | LaTeX math via KaTeX | `value` (LaTeX string) |
| `code` | Syntax-highlighted code block | `language`, `content` |

---

## Asset System

Images (circuit diagrams, oscilloscope captures, simulation outputs) are managed through a **sidecar asset registry**.

For each experiment file `exp-N.json`, there's an optional `exp-N.assets.json`:

```json
{
  "fig1-inv-amp": {
    "path": "/assets/labs/devices-and-circuits/exp-5/fig1-inv-amp.png",
    "description": "Circuit diagram of inverting amplifier"
  },
  "obs-inv-case2": {
    "path": "/assets/labs/devices-and-circuits/exp-5/obs-inv-case2.png",
    "description": "Oscilloscope capture"
  }
}
```

Content blocks reference images by `assetId`. The `ImageBlock` component looks up the `assetId` in the loaded assets to resolve the actual file path under `public/assets/labs/`.

---

## Simulator Integration

### How the "Launch Simulator" Button Works

The button is rendered by `ExperimentLayout.js` when these conditions are met:
1. `experiment.status === "Simulation Available"`
2. `experiment.sections.simulation.route` is set (either `"default"` or a custom URL)

**URL construction logic:**

```js
const simulatorUrl = process.env.NEXT_PUBLIC_SIMULATOR_URL
    || 'https://bhilaee-simulator.vercel.app';

// If route is "default", use the standard simulator URL
// If route is a custom URL, use that instead
const href = `${simulatorUrl}?expId=${experiment.meta.simulationId}&newSession=true`;
```

The `simulationId` in the experiment's `meta` field maps directly to a template ID in the simulator's template registry. This is how the two apps stay connected.

### Linking a New Experiment to the Simulator

To make an experiment launchable from the guide:

1. **Create the template** in the simulator (`MyApp1/src/templates/my_template.js`).
2. **Register it** in `MyApp1/src/templates/index.js` with a unique `expId`.
3. **Update the experiment JSON** in `MyApp2`:
   - Set `"status": "Simulation Available"`
   - Add `"simulationId": "<expId>"` to `meta`
   - Set `"route": "default"` in the `simulation` section
4. **Update `registry.json`** to change the experiment's status badge.

### Shared Simulations

Multiple experiments can share the same simulator template. For example, DnC Exp 1 (Transient Response) reuses `basic-ee-exp-4` by setting:
```json
"meta": { "simulationId": "basic-ee-exp-4" }
```

---

## Content Progress

| Lab | Code | Total | Complete | Simulation |
|-----|------|:-----:|:--------:|:----------:|
| Basic Electrical Engineering | EEL101 | 9 | **7** | 6 |
| Digital Electronics | EEP210 | 8 | **8** | — |
| Devices and Circuits | EEP209 | 8 | **6** | 5 |
| Instrumentation Lab | EEP307 | 10 | **5** | — |
| Control System Lab | EEP308 | 10 | **1** | — |
| Machines Lab | EEP306 | 10 | **1** | 1 |
| Power System Lab | EEP305 | 10 | 0 | — |
| Sensor Lab | EEP304 | 10 | 0 | — |
| Power Electronics Lab | EEP309 | 10 | 0 | — |

---

## UI Features

### Homepage
- **Lab Cards** — 9 labs displayed as interactive cards with name, code, and experiment count.
- **Cross-Lab Search** — Real-time search across all experiments by name. Results show lab badges.
- **Responsive Grid** — Adapts from 3 columns (desktop) to 1 column (mobile).

### Lab Landing Pages
- **Metadata Bar** — Lab code, nature, total experiment count.
- **Experiment Cards** — Number, title, and color-coded status badge.

### Experiment Pages
- **Sticky Sidebar TOC** — Auto-generated from applicable sections (desktop only).
- **Rich Content Rendering** — Text, lists, tables, images, LaTeX equations, code blocks.
- **Viva Voce Styling** — Q&A blocks with accent-bordered question highlights.
- **Print / PDF** — One-click print button with print-optimized CSS.
- **Bookmark** — Save experiments for quick access.
- **Mobile-First** — Collapsible sidebar, responsive tables with horizontal scroll.

---

## Project Structure

```
├── app/                              # Next.js App Router
│   ├── page.js                       # Homepage → HomeContent
│   ├── layout.js                     # Root layout (Header + Footer)
│   ├── globals.css                   # Design tokens & global styles
│   └── lab/
│       └── [slug]/                   # Dynamic Lab Landing Page
│           ├── page.js
│           └── experiment/
│               └── [experimentId]/   # Dynamic Experiment Page
│                   └── page.js
│
├── components/
│   ├── Header.js                     # Global nav bar ("Bhilai EE Labs")
│   ├── Footer.js                     # Global footer
│   ├── HomeContent.js                # Homepage client component (search + grid)
│   ├── SearchBar.js                  # Cross-lab experiment search
│   ├── ExperimentCard.js             # Lab page experiment cards
│   ├── ExperimentList.js             # Grid container for cards
│   ├── LabHeader.js                  # Lab title + breadcrumb
│   ├── LabMetadata.js                # Lab info bar
│   └── experiment/
│       ├── ExperimentLayout.js       # Sidebar + content shell + sim button
│       ├── ContentBlock.js           # Universal content type renderer
│       └── Experiment.module.css     # Experiment page styles
│
├── data/
│   ├── labs.js                       # Lab metadata + registry merge
│   ├── experiments.js                # Experiment loader (fs.readFile)
│   ├── experiment_schema.js          # Section order, content types, enums
│   └── experiments/
│       ├── registry.json             # Master index of all experiments
│       ├── basic-electrical-engineering/
│       │   ├── exp-{1..7}.json       # Experiment content
│       │   └── exp-{1..7}.assets.json# Asset registries
│       ├── digital-electronics/
│       ├── devices-and-circuits/
│       ├── instrumentation-lab/
│       ├── control-system-lab/
│       └── machines-lab/
│
├── public/assets/labs/               # Static images & diagrams
│   ├── basic-electrical-engineering/
│   ├── digital-electronics/
│   ├── devices-and-circuits/
│   ├── instrumentation-lab/
│   └── machines-lab/
│
├── .env.local                        # NEXT_PUBLIC_SIMULATOR_URL
├── package.json
└── next.config.mjs
```

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/RavikantiAkshay/basic-lab-guide.git
cd basic-lab-guide

# 2. Install dependencies
npm install

# 3. Configure simulator URL
echo "NEXT_PUBLIC_SIMULATOR_URL=https://bhilaee-simulator.vercel.app" > .env.local

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SIMULATOR_URL` | `https://bhilaee-simulator.vercel.app` | Base URL for the circuit simulator |

If the environment variable is not set, the app falls back to the production URL automatically.

---

## Adding a New Experiment

### 1. Create the experiment JSON

```bash
data/experiments/<lab-slug>/exp-<N>.json
```

Follow the schema in `experiment_schema.js`. All 12 sections should be present; set `"isApplicable": false` for unused sections.

### 2. Create the asset registry (if images are needed)

```bash
data/experiments/<lab-slug>/exp-<N>.assets.json
```

Map `assetId` keys to paths under `public/assets/labs/<lab-slug>/exp-<N>/`.

### 3. Add images to public directory

```bash
public/assets/labs/<lab-slug>/exp-<N>/<filename>.png
```

### 4. Register in `registry.json`

Add an entry to the lab's experiment array:

```json
{ "id": "<N>", "title": "...", "fileName": "exp-<N>.json", "status": "Guide Only", "completeness": 1 }
```

### 5. Link to simulator (optional)

See [Simulator Integration](#simulator-integration) above.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 15** (App Router, Server Components) |
| UI | **React 19** + CSS Modules |
| Math Rendering | **KaTeX** via `react-katex` |
| Data | Static JSON files loaded via `fs.readFile` at build/request time |
| Hosting | **Vercel** |

---

## License

Internal Use — Department of Electrical Engineering, IIT Bhilai