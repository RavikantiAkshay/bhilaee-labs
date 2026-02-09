import styles from './LabComponents.module.css';

export default function LabHeader({ name, code, focus }) {
    return (
        <header className={styles.header}>
            <div className={styles.titleGroup}>
                <h1 className={styles.labName}>{name}</h1>
                <div className={styles.subtext}>
                    <span className={styles.labCode}>{code}</span>
                    <span className={styles.separator}>|</span>
                    <span className={styles.labFocus}>{focus}</span>
                </div>
            </div>
        </header>
    );
}
