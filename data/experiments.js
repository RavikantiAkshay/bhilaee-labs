import { EXPERIMENT_SECTIONS, CONTENT_TYPES, createExperiment } from './experiment_schema';

/**
 * Mock data store for individual experiments.
 * In a real app, this would be fetched from an API or separate JSON files.
 */

// --- 1. Control Systems (MATLAB-based) ---
const controlSystemExp1 = createExperiment('exp-1', 'Transient Response of R-L-C Network');
controlSystemExp1.status = 'Simulation Available';
controlSystemExp1.labId = 'control-system-lab'; // Link back to parent lab

controlSystemExp1.sections[EXPERIMENT_SECTIONS.AIM].content = [
    { type: CONTENT_TYPES.TEXT, content: "To study the transient response of a series R-L-C circuit for a step input." }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.APPARATUS].content = [
    {
        type: CONTENT_TYPES.LIST, style: 'unordered', items: [
            "MATLAB software",
            "Control System Toolbox"
        ]
    }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.THEORY].content = [
    { type: CONTENT_TYPES.TEXT, content: "The transient response of a control system exhibits damped oscillations before reaching steady state." },
    { type: CONTENT_TYPES.EQUATION, latex: "G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta\\omega_n s + \\omega_n^2}" },
    { type: CONTENT_TYPES.TEXT, content: "Where $\\zeta$ is the damping ratio and $\\omega_n$ is the natural frequency." }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.PRE_LAB].isApplicable = false; // Pure software exp

controlSystemExp1.sections[EXPERIMENT_SECTIONS.PROCEDURE].content = [
    {
        type: CONTENT_TYPES.LIST, style: 'ordered', items: [
            "Launch MATLAB.",
            "Define the transfer function using `tf` command.",
            "Apply a step input using `step` command.",
            "Observe the rise time, peak time, and settling time."
        ]
    }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.SIMULATION].content = [
    { type: CONTENT_TYPES.TEXT, content: "Use the following MATLAB code to simulate the system:" },
    {
        type: CONTENT_TYPES.CODE, language: 'matlab', code:
            `wn = 5;
zeta = 0.5;
num = [wn^2];
den = [1 2*zeta*wn wn^2];
sys = tf(num, den);
step(sys);
title('Step Response of Underdamped System');`
    }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.OBSERVATION].content = [
    {
        type: CONTENT_TYPES.TABLE, headers: ["Parameter", "Value"], rows: [
            ["Rise Time (tr)", "0.5 s"],
            ["Peak Time (tp)", "0.8 s"],
            ["Settling Time (ts)", "1.2 s"]
        ]
    }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.RESULT].content = [
    { type: CONTENT_TYPES.TEXT, content: "The step response was plotted and time domain specifications were verified." }
];

controlSystemExp1.sections[EXPERIMENT_SECTIONS.CONCLUSION].content = [
    { type: CONTENT_TYPES.TEXT, content: "The system behaves as an underdamped second-order system." }
];


// --- 2. Basic Electrical (Hardware-based) ---
const basicElectricalExp1 = createExperiment('exp-1', 'Verification of Kirchhoff Laws');
basicElectricalExp1.status = 'Hardware-Oriented';
basicElectricalExp1.labId = 'basic-electrical-engineering';

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.AIM].content = [
    { type: CONTENT_TYPES.TEXT, content: "To verify Kirchhoff's Current Law (KCL) and Voltage Law (KVL)." }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.APPARATUS].content = [
    {
        type: CONTENT_TYPES.LIST, style: 'unordered', items: [
            "DC Power Supply (0-30V)",
            "Resistors (1k, 2.2k, 4.7k)",
            "Breadboard",
            "Multimeter",
            "Connecting Wires"
        ]
    }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.PRE_LAB].content = [
    { type: CONTENT_TYPES.TEXT, content: "Circuit Diagram for KVL:" },
    // Placeholder image
    { type: CONTENT_TYPES.IMAGE, src: "/placeholder-circuit.png", caption: "Figure 1: Series Circuit for KVL" }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.PROCEDURE].content = [
    {
        type: CONTENT_TYPES.LIST, style: 'ordered', items: [
            "Connect the circuit as shown in Figure 1.",
            "Set the DC source voltage to 10V.",
            "Measure the voltage drop across each resistor.",
            "Verify that the sum of voltage drops equals the source voltage."
        ]
    }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.SIMULATION].isApplicable = false; // Pure hardware exp

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.OBSERVATION].content = [
    {
        type: CONTENT_TYPES.TABLE, headers: ["Resistor", "Measured Voltage(V)", "Calculated Voltage(V)"], rows: [
            ["R1 (1k)", "2.1V", "2.12V"],
            ["R2 (2.2k)", "4.6V", "4.65V"],
            ["R3 (1.5k)", "3.2V", "3.23V"]
        ]
    }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.CALCULATION].content = [
    { type: CONTENT_TYPES.TEXT, content: "Theoretical Voltage Calculation using Voltage Divider Rule:" },
    { type: CONTENT_TYPES.EQUATION, latex: "V_x = V_{source} \\times \\frac{R_x}{R_{total}}" }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.RESULT].content = [
    { type: CONTENT_TYPES.TEXT, content: "The algebraic sum of voltages in the loop was found to be zero." }
];

basicElectricalExp1.sections[EXPERIMENT_SECTIONS.CONCLUSION].content = [
    { type: CONTENT_TYPES.TEXT, content: "Kirchhoff's Voltage Law is verified within experimental error limits." }
];


// --- Registry ---
const experiments = {
    'control-system-lab': {
        '1': controlSystemExp1
    },
    'basic-electrical-engineering': {
        '1': basicElectricalExp1
    }
};

/**
 * Retrieve experiment data by Lab ID and Experiment ID.
 * Returns null if not found.
 */
export function getExperiment(labSlug, experimentId) {
    if (!experiments[labSlug]) return null;
    return experiments[labSlug][experimentId] || null;
}

/**
 * Helper to get all available experiment paths for static generation.
 * Returns array of { slug, experimentId }
 */
export function getAllExperimentPaths() {
    const paths = [];
    Object.keys(experiments).forEach(labSlug => {
        Object.keys(experiments[labSlug]).forEach(experimentId => {
            paths.push({ slug: labSlug, experimentId });
        });
    });
    return paths;
}
