import styles from './Experiment.module.css';

/**
 * Switcher component to render different content types based on the 'type' field.
 */
export default function ContentBlock({ block }) {
    if (!block || !block.type) return null;

    switch (block.type) {
        case 'text':
            return <RichText block={block} />;
        case 'list':
            return <ListBlock block={block} />;
        case 'image':
            return <ImageBlock block={block} />;
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

function RichText({ block }) {
    // Simple improved text rendering with limited Markdown support
    // (Bolding: **text**, Italic: *text*, Newlines)
    const processText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <p key={i}>
                {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('*') && part.endsWith('*')) {
                        return <em key={j}>{part.slice(1, -1)}</em>;
                    }
                    return part;
                })}
            </p>
        ));
    };

    return (
        <div className={`${styles.contentBlock} ${styles.richText}`}>
            {processText(block.content)}
        </div>
    );
}

function ListBlock({ block }) {
    const listClass = block.style === 'ordered' ? styles.ordered : styles.unordered;
    return (
        <div className={styles.contentBlock}>
            {block.style === 'ordered' ? (
                <ol className={`${styles.list} ${listClass}`}>
                    {block.items.map((item, i) => <li key={i} className={styles.listItem}>{item}</li>)}
                </ol>
            ) : (
                <ul className={`${styles.list} ${listClass}`}>
                    {block.items.map((item, i) => <li key={i} className={styles.listItem}>{item}</li>)}
                </ul>
            )}
        </div>
    );
}

function ImageBlock({ block }) {
    return (
        <div className={`${styles.contentBlock} ${styles.imageContainer}`}>
            <div className={styles.imageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.caption || 'Experiment Image'} className={styles.image} />
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
            {/* Using a simple container for now. LaTeX rendering (KaTeX/MathJax) can be added here later */}
            {block.latex}
        </div>
    );
}
