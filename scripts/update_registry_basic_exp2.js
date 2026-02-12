const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '../data/experiments/registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Update Basic Electrical Lab Exp 2
const labId = 'basic-electrical-engineering';
const expId = '2';

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
exp.title = "Superposition Theorem";
exp.status = "Hardware-Oriented";
exp.completeness = 1.0;

// Write back
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`Updated ${labId}/${expId} in registry.`);
