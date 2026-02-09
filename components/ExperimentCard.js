import Link from 'next/link';
import styles from './LabComponents.module.css';

export default function ExperimentCard({ experiment, labSlug }) {
    // Helper to create safe class names from status strings
    // e.g. "Simulation Available" -> "status_Simulation_Available"
    const statusClass = styles[`status_${experiment.status.replace(/ /g, '_').replace(/-/g, '_')}`] || styles.status_Guide_Only;

    return (
        <Link href={`/lab/${labSlug}/experiment/${experiment.id}`} className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.expNumber}>{String(experiment.id).padStart(2, '0')}</span>
                <span className={`${styles.statusTag} ${statusClass}`}>
                    {experiment.status}
                </span>
            </div>
            <h3 className={styles.expTitle}>{experiment.name}</h3>
        </Link>
    );
}
