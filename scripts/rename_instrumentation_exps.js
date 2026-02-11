const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '../data/experiments/registry.json');
const experimentsDir = path.join(__dirname, '../data/experiments');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const labId = 'instrumentation-lab';
const lab = registry.labs[labId];

if (!lab) {
    console.error('Lab not found');
    process.exit(1);
}

const updates = {
    '1': "IR Object Detection",
    '2': "Ultrasonic Distance Measurement",
    '3': "Ultrasonic Speed Measurement",
    '4': "Rain Intensity Detection",
    '5': "Moisture Level Detection"
};

// Update Registry and Files
Object.entries(updates).forEach(([id, newTitle]) => {
    const exp = lab.experiments.find(e => e.id === id);
    if (exp) {
        console.log(`Renaming Exp ${id}: "${exp.title}" -> "${newTitle}"`);
        // Update Registry
        exp.title = newTitle;

        // Update File
        const filePath = path.join(experimentsDir, labId, exp.fileName);
        if (fs.existsSync(filePath)) {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            content.title = newTitle;
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            console.log(`  Updated file: ${exp.fileName}`);
        } else {
            console.warn(`  File not found: ${filePath}`);
        }
    }
});

// Save Registry
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
console.log('Registry saved.');
