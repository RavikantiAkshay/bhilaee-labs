import styles from './Experiment.module.css';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import PlotToggleButton from './PlotToggleButton';
import ZoomableImage from './ZoomableImage';

/**
 * Switcher component to render different content types based on the 'type' field.
 * Accepts optional glossary data for term highlighting.
 */
export default function ContentBlock({ block, assets, sectionId, glossaryTerms, highlightedTerms }) {
    if (!block || !block.type) return null;

    switch (block.type) {
        case 'text':
            return <RichText block={block} glossaryTerms={glossaryTerms} highlightedTerms={highlightedTerms} />;
        case 'list':
            return <ListBlock block={block} glossaryTerms={glossaryTerms} highlightedTerms={highlightedTerms} />;
        case 'image':
            return <ImageBlock block={block} assets={assets} />;
        case 'table':
            return <TableBlock block={block} sectionId={sectionId} />;
        case 'code':
            return <CodeBlock block={block} />;
        case 'equation':
            return <EquationBlock block={block} />;
        default:
            console.warn(`Unknown content block type: ${block.type}`);
            return null;
    }
}

/**
 * Wraps a matched glossary term with a highlighted tooltip span.
 */
function GlossaryHighlight({ term, definition, children }) {
    return (
        <span className={styles.glossaryTerm}>
            {children}
            <span className={styles.glossaryTooltip}>
                <span className={styles.glossaryTooltipTerm}>{term}</span>
                {definition}
            </span>
        </span>
    );
}

/**
 * Takes a plain text string and checks for glossary term matches.
 * Only highlights the first occurrence per experiment page (tracked via highlightedTerms Set).
 * Returns an array of React elements (text + highlighted spans).
 */
function applyGlossaryHighlights(text, glossaryTerms, highlightedTerms, keyPrefix) {
    if (!glossaryTerms || glossaryTerms.size === 0 || !text || text.length === 0) {
        return [text];
    }

    // Build a regex that matches any glossary term (whole word, case-insensitive)
    // Sort terms by length (longest first) to avoid partial matches
    const availableTerms = [];
    for (const [term] of glossaryTerms) {
        if (!highlightedTerms.has(term)) {
            availableTerms.push(term);
        }
    }

    if (availableTerms.length === 0) return [text];

    // Sort longest first so "power factor correction" matches before "power"
    availableTerms.sort((a, b) => b.length - a.length);

    // Escape regex special chars in terms, then join with |
    const escaped = availableTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'i');

    const result = [];
    let remaining = text;
    let matchIndex = 0;

    while (remaining.length > 0) {
        const match = remaining.match(pattern);
        if (!match) {
            result.push(remaining);
            break;
        }

        const matchedText = match[0];
        const termKey = matchedText.toLowerCase();
        const idx = match.index;

        // Check again if this term was already highlighted (could have been claimed in an earlier iteration)
        if (highlightedTerms.has(termKey)) {
            // Skip this match, add everything up to and including the match as plain text
            result.push(remaining.substring(0, idx + matchedText.length));
            remaining = remaining.substring(idx + matchedText.length);
            continue;
        }

        // Add text before the match
        if (idx > 0) {
            result.push(remaining.substring(0, idx));
        }

        // Mark as highlighted
        highlightedTerms.add(termKey);

        // Add the highlighted element
        const definition = glossaryTerms.get(termKey);
        result.push(
            <GlossaryHighlight key={`${keyPrefix}-g-${matchIndex}`} term={termKey} definition={definition}>
                {matchedText}
            </GlossaryHighlight>
        );

        remaining = remaining.substring(idx + matchedText.length);
        matchIndex++;
    }

    return result;
}

const processRichText = (text, glossaryTerms, highlightedTerms) => {
    if (!text) return null;

    // Check if this is a Q&A format (heuristic: contains "**Q:**" or "Q:")
    const isQA = text.includes("**Q:**") || text.startsWith("Q:");

    // Split by newlines first
    return text.split('\n').map((line, i) => {
        // Special styling for Question lines
        const isQuestionLine = line.trim().startsWith("**Q:**") || line.trim().startsWith("Q:");

        const content = (
            <span key={i} className={isQuestionLine ? styles.questionText : undefined}>
                {/* 
                   Regex explanation:
                   1. \[([^\]]+)\]\(([^)]+)\) -> Matches [text](url)
                   2. (\*\*.*?\*\*) -> Matches **bold**
                   3. (\*.*?\*) -> Matches *italic*
                   4. (\$[^\$]+\$) -> Matches $inline math$
                */}
                {line.split(/(\[[^\]]+\]\([^)]+\)|\*\*.*?\*\*|\*.*?\*|\$[^\$]+\$)/g).map((part, j) => {
                    // Link: [text](url)
                    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) {
                        return (
                            <a
                                key={j}
                                href={linkMatch[2]}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#228be6', textDecoration: 'underline' }}
                            >
                                {linkMatch[1]}
                            </a>
                        );
                    }
                    // Bold: **text**
                    if (part.startsWith('**') && part.endsWith('**')) {
                        const boldContent = part.slice(2, -2);
                        // Apply glossary to text inside bold too
                        const highlighted = applyGlossaryHighlights(boldContent, glossaryTerms, highlightedTerms, `b-${i}-${j}`);
                        return <strong key={j}>{highlighted}</strong>;
                    }
                    // Italic: *text*
                    if (part.startsWith('*') && part.endsWith('*')) {
                        const italicContent = part.slice(1, -1);
                        const highlighted = applyGlossaryHighlights(italicContent, glossaryTerms, highlightedTerms, `i-${i}-${j}`);
                        return <em key={j}>{highlighted}</em>;
                    }
                    // Inline Math: $latex$
                    if (part.startsWith('$') && part.endsWith('$')) {
                        return <InlineMath key={j} math={part.slice(1, -1)} />;
                    }
                    // Plain text — apply glossary highlights here
                    return applyGlossaryHighlights(part, glossaryTerms, highlightedTerms, `t-${i}-${j}`);
                })}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        );

        return content;
    });
};

function RichText({ block, glossaryTerms, highlightedTerms }) {
    return (
        <div className={`${styles.contentBlock} ${styles.richText}`}>
            {processRichText(block.content, glossaryTerms, highlightedTerms)}
        </div>
    );
}

function ListBlock({ block, glossaryTerms, highlightedTerms }) {
    const listClass = block.style === 'ordered' ? styles.ordered : styles.unordered;
    return (
        <div className={styles.contentBlock}>
            {block.style === 'ordered' ? (
                <ol className={`${styles.list} ${listClass}`}>
                    {block.items.map((item, i) => {
                        const isQAItem = typeof item === 'string' && (item.trim().startsWith('Q:') || item.trim().startsWith('**Q:**'));
                        return (
                            <li key={i} className={`${styles.listItem} ${isQAItem ? styles.qaListItem : ''}`}>
                                {processRichText(item, glossaryTerms, highlightedTerms)}
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <ul className={`${styles.list} ${listClass}`}>
                    {block.items.map((item, i) => {
                        const isQAItem = typeof item === 'string' && (item.trim().startsWith('Q:') || item.trim().startsWith('**Q:**'));
                        return (
                            <li key={i} className={`${styles.listItem} ${isQAItem ? styles.qaListItem : ''}`}>
                                {processRichText(item, glossaryTerms, highlightedTerms)}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function ImageBlock({ block, assets }) {
    let src = block.src;
    let alt = block.caption || 'Experiment Image';

    // Asset System Logic
    if (block.assetId) {
        if (assets && assets[block.assetId]) {
            src = assets[block.assetId].path;
            const assetDesc = assets[block.assetId].description;
            if (assetDesc) alt = assetDesc; // Use registry description for ALT if available
        } else {
            console.warn(`Missing asset definition for ID: ${block.assetId}`);
            src = '/images/placeholder-missing.png'; // Fallback
        }
    }

    if (!src) return null; // Don't render broken image block

    return (
        <div className={`${styles.contentBlock} ${styles.imageContainer}`}>
            <div className={styles.imageWrapper}>
                <ZoomableImage src={src} alt={alt} className={styles.image} />
                {block.caption && <p className={styles.caption}>{block.caption}</p>}
            </div>
        </div>
    );
}

function TableBlock({ block, sectionId }) {
    return <TableBlockInner block={block} sectionId={sectionId} />;
}

// We need a separate default export wrapper to keep ContentBlock as a server component,
// but TableBlockInner must be imported from a client file for the plot toggle.
// Since ContentBlock already uses KaTeX (client), we can use dynamic import for PlotPanel.
function TableBlockInner({ block, sectionId }) {
    // Check if table has >= 2 numeric columns (for plot eligibility)
    const numericCount = (block.headers || []).filter((_, i) => {
        let total = 0, numeric = 0;
        for (const row of (block.rows || [])) {
            const val = row[i];
            if (val === undefined || val === null || String(val).trim() === '') continue;
            total++;
            const parsed = parseFloat(String(val).replace(/,/g, ''));
            if (!isNaN(parsed) && isFinite(parsed)) numeric++;
        }
        return total > 0 && (numeric / total) >= 0.8;
    }).length;

    // Only allow plotting in specific data-heavy sections
    const isPlotAllowedSection = ['observation', 'calculation', 'result'].includes(sectionId);

    // Final plot condition
    const canPlot = isPlotAllowedSection && numericCount >= 2 && (block.rows || []).length >= 1;

    return (
        <div className={`${styles.contentBlock} ${styles.tableWrapper}`} style={{ position: 'relative' }}>
            {canPlot && <PlotToggleButton headers={block.headers} rows={block.rows} />}
            <table className={styles.table}>
                <thead>
                    <tr>
                        {block.headers.map((header, i) => <th key={i}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {block.rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => <td key={j}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CodeBlock({ block }) {
    return (
        <div className={`${styles.contentBlock} ${styles.codeBlock}`}>
            <div className={styles.codeHeader}>
                <span>{block.language || 'Code'}</span>
            </div>
            <pre className={styles.codeContent}>
                <code>{block.code}</code>
            </pre>
        </div>
    );
}

function EquationBlock({ block }) {
    const latex = block.value || block.content || block.latex || '';
    // Strip $$ if present, though BlockMath handles it usually
    const cleanLatex = latex.replace(/^\$\$|\$\$$/g, '');

    return (
        <div className={`${styles.contentBlock} ${styles.equation}`}>
            <BlockMath math={cleanLatex} />
        </div>
    );
}
