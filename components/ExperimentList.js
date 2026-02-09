import styles from './LabComponents.module.css';
import ExperimentCard from './ExperimentCard';

export default function ExperimentList({ experiments, labSlug }) {
    return (
        <section className={styles.grid}>
            {experiments.map((exp) => (
                <ExperimentCard key={exp.id} experiment={exp} labSlug={labSlug} />
            ))}
        </section>
    );
}
