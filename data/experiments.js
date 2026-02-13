import { createExperiment } from './experiment_schema';
import registry from './experiments/registry.json';

/**
 * Data Access Layer for Experiments.
 * Reads from the static Registry and loads individual JSON files.
 */

/**
 * Retrieve experiment data by Lab ID and Experiment ID.
 * Returns null if not found in registry.
 * Returns skeleton structure if content file is missing.
 */
export async function getExperiment(labSlug, experimentId) {
    const labData = registry.labs[labSlug];
    if (!labData) return null;

    const experimentMeta = labData.experiments.find(e => e.id === experimentId);
    if (!experimentMeta) return null;

    // Default skeleton
    let experiment = createExperiment(experimentMeta.id, experimentMeta.title);
    experiment.labId = labSlug;
    experiment.status = experimentMeta.status;

    // Try to load content file if available
    try {
        // Dynamic import based on registry filename
        // Note: adjustments might be needed for path resolution in production builds
        // Next.js handles this well if paths are static-analyzable, but here it's dynamic.
        // We'll see if we need to map paths explicitly.
        const content = await import(`./experiments/${labSlug}/${experimentMeta.fileName}`);

        // Merge content into skeleton
        // We assume content file follows schema, but we can be defensive
        if (content.default) {
            experiment = { ...experiment, ...content.default };
        } else {
            experiment = { ...experiment, ...content };
        }

        // Try to load asset registry if available (sidecar file)
        try {
            // Assuming fileName is like 'exp-1.json', we want 'exp-1.assets.json'
            const assetFileName = experimentMeta.fileName.replace('.json', '.assets.json');
            const assets = await import(`./experiments/${labSlug}/${assetFileName}`);
            experiment.assets = assets.default || assets;
        } catch (assetError) {
            // No assets file found, ignore
        }

    } catch (error) {
        console.error(`ERROR loading content for ${labSlug}/${experimentId}:`, error);
        console.error(`Current working directory: ${process.cwd()}`);
        // Fallback to skeleton (already created)
    }

    return experiment;
}

/**
 * Helper to get all available experiment paths for static generation.
 * Returns array of { slug, experimentId }
 */
export function getAllExperimentPaths() {
    const paths = [];
    Object.keys(registry.labs).forEach(labSlug => {
        registry.labs[labSlug].experiments.forEach(exp => {
            paths.push({ slug: labSlug, experimentId: exp.id });
        });
    });
    return paths;
}
