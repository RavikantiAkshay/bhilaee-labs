import { getLabBySlug, getAllLabSlugs } from '@/data/labs';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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
        description: lab.description,
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

    return (
        <main className="lab-page">
            <nav className="breadcrumb">
                <Link href="/">← Back to Labs</Link>
                <span> / {lab.name}</span>
            </nav>

            <header className="lab-header">
                <h1>{lab.name}</h1>
                <p className="lab-code">{lab.code}</p>
                <p className="lab-description">{lab.description}</p>
            </header>

            <section className="experiments-section">
                <h2>Experiments</h2>
                <p className="placeholder">Experiments coming soon...</p>
            </section>
        </main>
    );
}
