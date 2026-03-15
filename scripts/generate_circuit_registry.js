const fs = require('fs');
const path = require('path');

const experimentsRoot = path.join(__dirname, '..', 'data', 'experiments');
const registryPath = path.join(experimentsRoot, 'registry.json');
const outputPath = path.join(experimentsRoot, 'circuit_registry.json');

if (!fs.existsSync(registryPath)) {
    console.error('Registry not found at:', registryPath);
    process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const circuitRegistry = [];

Object.entries(registry.labs).forEach(([labId, lab]) => {
    console.log(`Processing lab: ${labId}`);
    
    lab.experiments.forEach(exp => {
        const expPath = path.join(experimentsRoot, labId, exp.fileName);
        const assetsPath = path.join(experimentsRoot, labId, exp.fileName.replace('.json', '.assets.json'));
        
        if (!fs.existsSync(expPath)) return;
        
        const expData = JSON.parse(fs.readFileSync(expPath, 'utf8'));
        const assetsData = fs.existsSync(assetsPath) ? JSON.parse(fs.readFileSync(assetsPath, 'utf8')) : {};
        
        // Scan all sections for images with role circuit-diagram
        if (expData.sections) {
            Object.values(expData.sections).forEach(section => {
                if (section.content && Array.isArray(section.content)) {
                    section.content.forEach(item => {
                        if (item.type === 'image' && (item.role === 'circuit-diagram' || section.title.toLowerCase().includes('circuit diagram'))) {
                            const asset = assetsData[item.assetId];
                            if (asset && asset.path) {
                                circuitRegistry.push({
                                    labId,
                                    labName: lab.name,
                                    experimentId: exp.id,
                                    experimentTitle: exp.title,
                                    assetId: item.assetId,
                                    path: asset.path,
                                    caption: item.caption || asset.description || exp.title,
                                    role: item.role || 'circuit-diagram'
                                });
                            }
                        }
                    });
                }
            });
        }
    });
});

fs.writeFileSync(outputPath, JSON.stringify(circuitRegistry, null, 2));
console.log(`Successfully generated circuit registry with ${circuitRegistry.length} diagrams at ${outputPath}`);
