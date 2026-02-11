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
 * Lab Metadata - Static details about the labs
 */
const labMetadata = [
  {
    id: "basic-electrical-engineering",
    name: "Basic Electrical Engineering",
    code: "EEL101",
    description: "Fundamental concepts of electrical engineering including circuit analysis and basic measurements",
    focus: "Fundamental circuit laws and theorems",
    nature: "Circuit-based",
    prerequisites: "12th Grade Physics, Calculus",
    totalExperiments: 10
  },
  {
    id: "digital-electronics",
    name: "Digital Electronics",
    code: "EEP210",
    description: "Logic gates, combinational and sequential circuits, and digital system design",
    focus: "Digital logic and system design",
    nature: "Design & Simulation",
    prerequisites: "Basic Electronics",
    totalExperiments: 10
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

/**
 * Labs data, merged with Registry for live experiment status and titles
 */
export const labs = labMetadata.map(meta => {
  const registryLab = registry.labs[meta.id];
  let experiments = [];

  if (registryLab && registryLab.experiments) {
    experiments = registryLab.experiments.map(exp => ({
      id: exp.id,
      name: exp.title, // Map registry 'title' to UI 'name'
      status: exp.status || EXPERIMENT_STATUS.GUIDE
    }));
  } else {
    // Fallback if no registry data (shouldn't happen if registry is compliant)
    experiments = Array.from({ length: meta.totalExperiments }, (_, i) => ({
      id: i + 1,
      name: `Experiment ${i + 1}`,
      status: EXPERIMENT_STATUS.GUIDE
    }));
  }

  return {
    ...meta,
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
