const fs = require('fs');
const path = require('path');

// Labs from data/labs.js (Recreated here to avoid import complexity in script)
const labs = [
    { id: "basic-electrical-engineering", name: "Basic Electrical Engineering", code: "EEL101" },
    { id: "digital-electronics", name: "Digital Electronics", code: "EEP210" },
    { id: "devices-and-circuits", name: "Devices and Circuits", code: "EEP209" },
    { id: "power-system-lab", name: "Power System Lab", code: "EEP305" },
    { id: "sensor-lab", name: "Sensor Lab", code: "EEP304" },
    { id: "control-system-lab", name: "Control System Lab", code: "EEP308" },
    { id: "power-electronics-lab", name: "Power Electronics Lab", code: "EEP309" },
    { id: "instrumentation-lab", name: "Instrumentation Lab", code: "EEP307" },
    { id: "machines-lab", name: "Machines Lab", code: "EEP306" }
];

const registry = {
    updatedAt: new Date().toISOString(),
    labs: {}
};

labs.forEach(lab => {
    registry.labs[lab.id] = {
        name: lab.name,
        experiments: []
    };

    // Generate 10 placeholder experiments
    for (let i = 1; i <= 10; i++) {
        const expId = i.toString();
        let expData = {
            id: expId,
            title: `Experiment ${i}`,
            fileName: `exp-${i}.json`,
            status: "Guide Only",
            completeness: 0.1
        };

        if (lab.id === 'basic-electrical-engineering' && i === 1) {
            expData.title = "Verification of Kirchhoff Laws";
            expData.status = "Hardware-Oriented";
            expData.completeness = 1.0;
        } else if (lab.id === 'control-system-lab' && i === 1) {
            expData.title = "Transient Response of R-L-C Network";
            expData.status = "Simulation Available";
            expData.completeness = 1.0;
        }

        registry.labs[lab.id].experiments.push(expData);
    }
});

// Write Registry
const registryPath = path.join(__dirname, '../data/experiments/registry.json');
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`Registry generated at ${registryPath}`);

// Create lab directories
labs.forEach(lab => {
    const labDir = path.join(__dirname, `../data/experiments/${lab.id}`);
    if (!fs.existsSync(labDir)) {
        fs.mkdirSync(labDir, { recursive: true });
        console.log(`Created directory: ${labDir}`);
    }
});
