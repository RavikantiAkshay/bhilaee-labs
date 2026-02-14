import styles from './Experiment.module.css';

/**
 * Switcher component to render different content types based on the 'type' field.
 */
export default function ContentBlock({ block, assets }) {
    if (!block || !block.type) return null;

    switch (block.type) {
        case 'text':
            return <RichText block={block} />;
        case 'list':
            return <ListBlock block={block} />;
        case 'image':
            return <ImageBlock block={block} assets={assets} />;
        case 'table':
            return <TableBlock block={block} />;
        case 'code':
            return <CodeBlock block={block} />;
        case 'equation':
            return <EquationBlock block={block} />;
        default:
            console.warn(`Unknown content block type: ${block.type}`);
            return null;
    }
}

const processRichText = (text) => {
    if (!text) return null;
    // Split by newlines first
    return text.split('\n').map((line, i) => (
        <span key={i}>
            {/* 
               Regex explanation:
               1. \[([^\]]+)\]\(([^)]+)\) -> Matches [text](url)
               2. (\*\*.*?\*\*) -> Matches **bold**
               3. (\*.*?\*) -> Matches *italic*
            */}
            {line.split(/(\[[^\]]+\]\([^)]+\)|\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
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
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                // Italic: *text*
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={j}>{part.slice(1, -1)}</em>;
                }
                return part;
            })}
            {i < text.split('\n').length - 1 && <br />}
        </span>
    ));
};

function RichText({ block }) {
    return (
        <div className={`${styles.contentBlock} ${styles.richText}`}>
            {processRichText(block.content)}
        </div>
    );
}

function ListBlock({ block }) {
    const listClass = block.style === 'ordered' ? styles.ordered : styles.unordered;
    return (
        <div className={styles.contentBlock}>
            {block.style === 'ordered' ? (
                <ol className={`${styles.list} ${listClass}`}>
                    {block.items.map((item, i) => <li key={i} className={styles.listItem}>{processRichText(item)}</li>)}
                </ol>
            ) : (
                <ul className={`${styles.list} ${listClass}`}>
                    {block.items.map((item, i) => <li key={i} className={styles.listItem}>{processRichText(item)}</li>)}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className={styles.image} />
                {block.caption && <p className={styles.caption}>{block.caption}</p>}
            </div>
        </div>
    );
}

function TableBlock({ block }) {
    return (
        <div className={`${styles.contentBlock} ${styles.tableWrapper}`}>
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
    return (
        <div className={`${styles.contentBlock} ${styles.equation}`}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
                {block.content || block.latex}
            </pre>
        </div>
    );
}
