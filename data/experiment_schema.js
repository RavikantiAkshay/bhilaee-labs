/**
 * Enforces the fixed section order for all experiments.
 * These keys map to the data structure in lab data files.
 */
export const EXPERIMENT_SECTIONS = {
    AIM: 'aim',
    APPARATUS: 'apparatus',
    THEORY: 'theory',
    PRE_LAB: 'preLab',
    PROCEDURE: 'procedure',
    SIMULATION: 'simulation',
    OBSERVATION: 'observation',
    CALCULATION: 'calculation',
    RESULT: 'result',
    CONCLUSION: 'conclusion'
};

/**
 * Human-readable titles for sections.
 * Can be overridden per experiment, but these are defaults.
 */
export const SECTION_TITLES = {
    [EXPERIMENT_SECTIONS.AIM]: 'Aim',
    [EXPERIMENT_SECTIONS.APPARATUS]: 'Apparatus & Software',
    [EXPERIMENT_SECTIONS.THEORY]: 'Theory',
    [EXPERIMENT_SECTIONS.PRE_LAB]: 'Pre-Lab / Circuit Diagram',
    [EXPERIMENT_SECTIONS.PROCEDURE]: 'Procedure',
    [EXPERIMENT_SECTIONS.SIMULATION]: 'Simulation / Execution',
    [EXPERIMENT_SECTIONS.OBSERVATION]: 'Observations',
    [EXPERIMENT_SECTIONS.CALCULATION]: 'Calculations',
    [EXPERIMENT_SECTIONS.RESULT]: 'Results & Analysis',
    [EXPERIMENT_SECTIONS.CONCLUSION]: 'Conclusion'
};

/**
 * Ordered array of section keys to ensure consistent rendering.
 */
export const SECTION_ORDER = [
    EXPERIMENT_SECTIONS.AIM,
    EXPERIMENT_SECTIONS.APPARATUS,
    EXPERIMENT_SECTIONS.THEORY,
    EXPERIMENT_SECTIONS.PRE_LAB,
    EXPERIMENT_SECTIONS.PROCEDURE,
    EXPERIMENT_SECTIONS.SIMULATION,
    EXPERIMENT_SECTIONS.OBSERVATION,
    EXPERIMENT_SECTIONS.CALCULATION,
    EXPERIMENT_SECTIONS.RESULT,
    EXPERIMENT_SECTIONS.CONCLUSION
];

/**
 * Allowed content block types for rich content rendering.
 */
export const CONTENT_TYPES = {
    TEXT: 'text',       // Standard paragraph or markdown
    LIST: 'list',       // Ordered or unordered lists
    IMAGE: 'image',     // Images with captions
    TABLE: 'table',     // Data tables with headers
    CODE: 'code',       // Code snippets with language support
    EQUATION: 'equation' // Mathematical formulas (LaTeX)
};

/**
 * Factory function to create a blank experiment structure.
 * Ensures strict adherence to the schema.
 * @param {string} id - Unique experiment alphanumeric ID (e.g. 'exp-1')
 * @param {string} title - Human readable title
 */
export function createExperiment(id, title) {
    const experiment = {
        id,
        title,
        status: 'Guide Only', // Default
        sections: {}
    };

    // Initialize all sections with default empty state
    SECTION_ORDER.forEach(sectionKey => {
        experiment.sections[sectionKey] = {
            id: sectionKey,
            title: SECTION_TITLES[sectionKey],
            isApplicable: true, // Default to true, explicit opt-out
            content: [] // Array of ContentBlocks
        };
    });

    return experiment;
}
