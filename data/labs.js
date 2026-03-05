
import registry from './experiments/registry.json';

/**
 * Status constants for experiments
 */
export const EXPERIMENT_STATUS = {
  SIMULATION: "Simulation Available",
  GUIDE: "Guide Only",
  HARDWARE: "Hardware-Oriented"
};

/**
 * Metadata for all labs.
 * Experiment lists are now populated dynamically from registry.json where available.
 */
const labMetadata = [
  {
    id: "basic-electrical-engineering",
    name: "Basic Electrical Engineering",
    code: "EEL101",
    description: "Fundamental concepts of electrical engineering including circuit analysis and basic measurements",
    focus: "Fundamental circuit laws and theorems",
    nature: "Circuit-based",
    prerequisites: "12th Grade Physics, Basic Network Theory, AC Fundamentals",
    totalExperiments: 9
  },
  {
    id: "digital-electronics",
    name: "Digital Electronics",
    code: "EEP210",
    description: "Design and implementation of logic gates and combinational circuits using Xilinx software and FPGA boards",
    focus: "Combinational logic synthesis & FPGA implementation",
    nature: "Hardware Implementation",
    prerequisites: "ECL101 (Basic Electronics Engineering), EEL203 (Digital Circuits)",
    totalExperiments: 8
  },
  {
    id: "devices-and-circuits",
    name: "Devices and Circuits",
    code: "EEP209",
    description: "Semiconductor devices, transistor circuits, and amplifier configurations",
    focus: "Semiconductor devices and amplifiers",
    nature: "Component Analysis",
    prerequisites: "Network Analysis",
    totalExperiments: 10
  },
  {
    id: "power-system-lab",
    name: "Power System Lab",
    code: "EEP305",
    description: "Power generation, transmission, distribution, and protection systems",
    focus: "Grid analysis and protection",
    nature: "System Analysis",
    prerequisites: "Electric Machines",
    totalExperiments: 10
  },
  {
    id: "sensor-lab",
    name: "Sensor Lab",
    code: "EEP304",
    description: "Various sensors, transducers, and measurement techniques",
    focus: "Transducers and measurements",
    nature: "Measurement-based",
    prerequisites: "Basic Electronics",
    totalExperiments: 10
  },
  {
    id: "control-system-lab",
    name: "Control System Lab",
    code: "EEP308",
    description: "Feedback control, stability analysis, and controller design",
    focus: "Stability and controller design",
    nature: "Design & Analysis",
    prerequisites: "Signals and Systems",
    totalExperiments: 10
  },
  {
    id: "power-electronics-lab",
    name: "Power Electronics Lab",
    code: "EEP309",
    description: "Power converters, rectifiers, inverters, and motor drives",
    focus: "Power conversion and drives",
    nature: "Hardware & Simulation",
    prerequisites: "Power Systems",
    totalExperiments: 10
  },
  {
    id: "instrumentation-lab",
    name: "Instrumentation Lab",
    code: "EEP307",
    description: "Measurement instruments, signal conditioning, and data acquisition",
    focus: "Data acquisition and conditioning",
    nature: "Measurement-based",
    prerequisites: "Sensors & Transducers",
    totalExperiments: 10
  },
  {
    id: "machines-lab",
    name: "Machines Lab",
    code: "EEP306",
    description: "DC machines, AC machines, transformers, and special machines",
    focus: "Electromechanical conversion",
    nature: "Hardware-Oriented",
    prerequisites: "Basic Electrical Engg",
    totalExperiments: 10
  }
];

// Combine metadata with registry data
export const labs = labMetadata.map(lab => {
  const regLab = registry.labs[lab.id];

  let experiments;
  if (regLab && regLab.experiments && regLab.experiments.length > 0) {
    // Use experiments from registry
    experiments = regLab.experiments.map(exp => ({
      id: exp.id, // Keep as string or number as per registry (usually string "1")
      name: exp.title, // Map 'title' from registry to 'name' for UI
      status: exp.status || EXPERIMENT_STATUS.GUIDE
    }));
  } else {
    // Fallback to placeholder generation
    experiments = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Experiment ${i + 1}`,
      status: EXPERIMENT_STATUS.GUIDE
    }));
  }

  return {
    ...lab,
    experiments
  };
});

/**
 * Helper function to get a lab by its slug
 */
export function getLabBySlug(slug) {
  return labs.find(lab => lab.id === slug);
}

/**
 * Helper function to get all lab slugs (for static path generation)
 */
export function getAllLabSlugs() {
  return labs.map(lab => lab.id);
}

/**
 * Get a flat list of every experiment across all labs,
 * each decorated with its parent lab metadata.
 */
export function getAllExperiments() {
  return labs.flatMap(lab =>
    lab.experiments.map(exp => ({
      ...exp,
      labId: lab.id,
      labName: lab.name,
      labCode: lab.code
    }))
  );
}
