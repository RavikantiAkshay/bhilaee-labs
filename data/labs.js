/**
 * Labs data for Basic Labs Guide
 * Each lab contains: id (slug), name, code, and description
 * The experiments array is a placeholder for future expansion
 */

export const labs = [
    {
        id: "basic-electrical-engineering",
        name: "Basic Electrical Engineering",
        code: "EEL101",
        description: "Fundamental concepts of electrical engineering including circuit analysis and basic measurements",
        experiments: []
    },
    {
        id: "digital-electronics",
        name: "Digital Electronics",
        code: "EEP210",
        description: "Logic gates, combinational and sequential circuits, and digital system design",
        experiments: []
    },
    {
        id: "devices-and-circuits",
        name: "Devices and Circuits",
        code: "EEP209",
        description: "Semiconductor devices, transistor circuits, and amplifier configurations",
        experiments: []
    },
    {
        id: "power-system-lab",
        name: "Power System Lab",
        code: "EEP305",
        description: "Power generation, transmission, distribution, and protection systems",
        experiments: []
    },
    {
        id: "sensor-lab",
        name: "Sensor Lab",
        code: "EEP304",
        description: "Various sensors, transducers, and measurement techniques",
        experiments: []
    },
    {
        id: "control-system-lab",
        name: "Control System Lab",
        code: "EEP308",
        description: "Feedback control, stability analysis, and controller design",
        experiments: []
    },
    {
        id: "power-electronics-lab",
        name: "Power Electronics Lab",
        code: "EEP309",
        description: "Power converters, rectifiers, inverters, and motor drives",
        experiments: []
    },
    {
        id: "instrumentation-lab",
        name: "Instrumentation Lab",
        code: "EEP307",
        description: "Measurement instruments, signal conditioning, and data acquisition",
        experiments: []
    },
    {
        id: "machines-lab",
        name: "Machines Lab",
        code: "EEP306",
        description: "DC machines, AC machines, transformers, and special machines",
        experiments: []
    }
];

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
