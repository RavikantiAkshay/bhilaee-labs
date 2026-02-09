import styles from './LabComponents.module.css';

export default function LabMetadata({ nature, prerequisites, totalExperiments }) {
    return (
        <dl className={styles.metadata}>
            <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Nature</dt>
                <dd className={styles.metaValue}>{nature}</dd>
            </div>
            <div className={styles.metaDivider}></div>
            <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Prerequisites</dt>
                <dd className={styles.metaValue}>{prerequisites}</dd>
            </div>
            <div className={styles.metaDivider}></div>
            <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Total Experiments</dt>
                <dd className={styles.metaValue}>{totalExperiments}</dd>
            </div>
        </dl>
    );
}
