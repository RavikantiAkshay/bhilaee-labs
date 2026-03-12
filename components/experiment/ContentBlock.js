import styles from './Experiment.module.css';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ZoomableImage from './ZoomableImage';
import EditableTableBlock from './EditableTableBlock';

/**
 * Switcher component to render different content types based on the 'type' field.
 * Accepts optional glossary data for term highlighting.
 */
export default function ContentBlock({ block, assets, sectionId, glossaryTerms, highlightedTerms, experimentId }) {
    if (!block || !block.type) return null;

    switch (block.type) {
        case 'text':
            return <RichText block={block} glossaryTerms={glossaryTerms} highlightedTerms={highlightedTerms} />;
        case 'list':
            return <ListBlock block={block} glossaryTerms={glossaryTerms} highlightedTerms={highlightedTerms} />;
        case 'image':
            return <ImageBlock block={block} assets={assets} />;
        case 'table':
            return <TableBlock block={block} sectionId={sectionId} experimentId={experimentId} />;
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

function TableBlock({ block, sectionId, experimentId }) {
    // We defer to the Client Component to maintain editing state and rendering
    return <EditableTableBlock block={block} sectionId={sectionId} experimentId={experimentId} />;
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
