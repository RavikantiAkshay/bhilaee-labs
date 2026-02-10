const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '../data/experiments/registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Update Instrumentation Lab Exp 5
const labId = 'instrumentation-lab';
const expId = '5';

const lab = registry.labs[labId];
if (!lab) {
    console.error(`Lab ${labId} not found`);
    process.exit(1);
}

const exp = lab.experiments.find(e => e.id === expId);
if (!exp) {
    console.error(`Experiment ${expId} not found in ${labId}`);
    process.exit(1);
}

// Update the experiment object
exp.title = "Detection of moisture levels in (1) Air, (2) Dry Soil, and (3) Wet Soil using a moisture sensor interfaced with ESP32";
exp.status = "Hardware-Oriented";
exp.completeness = 1.0;

// Write back
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`Updated ${labId}/${expId} in registry.`);
