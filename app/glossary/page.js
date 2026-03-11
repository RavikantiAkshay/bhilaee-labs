import fs from 'fs';
import path from 'path';
import GlossaryClient from './GlossaryClient';
import { getAllExperiments } from '@/data/labs';

// This runs on the server to gather all terms
async function fetchAllGlossaryTerms() {
    const terms = [];
    
    try {
        const filePath = path.join(process.cwd(), 'data', 'glossary.json');
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileContent);

            for (const [termKey, definition] of Object.entries(data)) {
                if (definition && definition.trim().length > 0) {
                    const capitalizedTerm = termKey.charAt(0).toUpperCase() + termKey.slice(1);
                    terms.push({
                        term: capitalizedTerm,
                        definition: definition.trim(),
                        sourceExpId: 'global',
                        sourceExpName: 'General Glossary',
                        sourceLabId: 'Reference'
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error loading centralized glossary data:`, error);
    }

    // Sort alphabetically by term
    return terms.sort((a, b) => a.term.localeCompare(b.term));
}

export default async function GlossaryRoute() {
    const terms = await fetchAllGlossaryTerms();
    
    return <GlossaryClient initialTerms={terms} />;
}
