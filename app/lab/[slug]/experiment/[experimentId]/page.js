import { notFound } from 'next/navigation';
import { getExperiment, getAllExperimentPaths } from '@/data/experiments';
import { SECTION_ORDER, SECTION_TITLES } from '@/data/experiment_schema';
import ExperimentLayout from '@/components/experiment/ExperimentLayout';
import ContentBlock from '@/components/experiment/ContentBlock';
import styles from '@/components/experiment/Experiment.module.css';

/**
 * Validates and retrieves parameters (slug, experimentId).
 * Then fetches and renders the experiment using the universal skeleton.
 */
export default async function ExperimentPage({ params }) {
    const { slug, experimentId } = await params;
    const experiment = await getExperiment(slug, experimentId);

    if (!experiment) {
        notFound();
    }

    // Enhance experiment object with labSlug for back-link if not present
    if (!experiment.labId) experiment.labId = slug;

    return (
        <ExperimentLayout experiment={experiment}>
            {SECTION_ORDER.map((sectionKey) => {
                const section = experiment.sections[sectionKey];
                // Safety check: if section data is missing for some reason
                if (!section) return null;

                const isApplicable = section.isApplicable !== false;
                const hasContent = section.content && section.content.length > 0;

                return (
                    <section key={sectionKey} id={sectionKey} className={styles.sectionContainer}>
                        <h2 className={styles.sectionTitle}>
                            {section.title || SECTION_TITLES[sectionKey]}
                            {!isApplicable && <span className={styles.notApplicableBadge}> (Not Applicable)</span>}
                        </h2>

                        {isApplicable ? (
                            hasContent ? (
                                <div className={styles.sectionContent}>
                                    {section.content.map((block, index) => (
                                        <ContentBlock key={index} block={block} />
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyPlaceholder}>Content coming soon...</p>
                            )
                        ) : (
                            <p className={styles.notApplicableText}>
                                This section is not required for this experiment.
                            </p>
                        )}
                    </section>
                );
            })}
        </ExperimentLayout>
    );
}

// Ensure static paths are generated for known experiments
export async function generateStaticParams() {
    return getAllExperimentPaths();
}
