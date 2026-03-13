import { labs, getLabBySlug, getAllLabSlugs } from '@/data/labs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LabHeader from '@/components/LabHeader';
import LabMetadata from '@/components/LabMetadata';
import ExperimentList from '@/components/ExperimentList';
import LabNav from '@/components/LabNav';

/**
 * Generate static paths for all labs
 */
export async function generateStaticParams() {
    const slugs = getAllLabSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

/**
 * Generate metadata for each lab page
 */
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const lab = getLabBySlug(slug);

    if (!lab) {
        return { title: 'Lab Not Found' };
    }

    return {
        title: `${lab.name} | Basic Labs Guide`,
        description: lab.focus,
    };
}

/**
 * Lab Landing Page Component
 */
export default async function LabPage({ params }) {
    const { slug } = await params;
    const lab = getLabBySlug(slug);

    if (!lab) {
        notFound();
    }

    // Calculate next and previous labs
    const currentIndex = labs.findIndex(l => l.id === lab.id);
    const prevLab = currentIndex > 0 ? labs[currentIndex - 1] : null;
    const nextLab = currentIndex < labs.length - 1 ? labs[currentIndex + 1] : null;

    return (
        <main className="lab-page">
            <nav className="breadcrumb noPrint">
                <Link href="/">← Back to Labs</Link>
                <span> / {lab.name}</span>
            </nav>

            <LabHeader
                name={lab.name}
                code={lab.code}
                focus={lab.focus}
            />

            <LabMetadata
                nature={lab.nature}
                prerequisites={lab.prerequisites}
                totalExperiments={lab.totalExperiments}
            />

            <section className="experiments-section">
                <ExperimentList 
                    experiments={lab.experiments} 
                    labSlug={lab.id} 
                    labName={lab.name}
                    labCode={lab.code}
                />
            </section>

            <LabNav prevLab={prevLab} nextLab={nextLab} />
        </main>
    );
}
