import Link from 'next/link';
import { labs } from '@/data/labs';

export default function Home() {
    return (
        <>
            <section className="hero">
                <h1>Basic Labs Guide</h1>
                <p>Electrical Engineering Labs</p>
            </section>

            <section className="labs-section">
                <h2>Select a Lab</h2>
                <div className="labs-grid">
                    {labs.map((lab) => (
                        <Link key={lab.id} href={`/lab/${lab.id}`} className="lab-card">
                            <h3>{lab.name}</h3>
                            <p className="lab-code">{lab.code}</p>
                            <p className="lab-description">{lab.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
