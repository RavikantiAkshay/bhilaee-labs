'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { saveObservation, getSavedObservations } from '@/lib/db';
import styles from './Experiment.module.css';

const PlotPanel = dynamic(() => import('./PlotPanel'), { ssr: false });

export default function EditableTableBlock({ block, sectionId, experimentId }) {
    const { user } = useAuth();
    // Determine plot eligibility (reused from TableBlockInner)
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

    const isPlotAllowedSection = ['observation', 'calculation', 'result'].includes(sectionId);
    const canPlot = isPlotAllowedSection && numericCount >= 2 && (block.rows || []).length >= 1;

    // Component State
    const [isEditing, setIsEditing] = useState(false);
    const [isPlotOpen, setIsPlotOpen] = useState(false);
    // currentRows hold the actual data sent to the plot
    const [currentRows, setCurrentRows] = useState(block.rows || []);
    // draftRows hold the temporary edits before saving
    const [draftRows, setDraftRows] = useState(block.rows || []);

    // -- Persistence Hook --
    useEffect(() => {
        const loadSavedData = async () => {
            if (user) {
                // Try to load from Supabase
                const { data } = await getSavedObservations(user.id, experimentId);
                const match = data?.find(d => d.section_id === sectionId);
                if (match?.data) {
                    setCurrentRows(match.data);
                }
            } else {
                // Try to load from localStorage for guest
                const localKey = `${experimentId}-draftData-${sectionId}`;
                const saved = localStorage.getItem(localKey);
                if (saved) {
                    setCurrentRows(JSON.parse(saved));
                }
            }
        };
        loadSavedData();
    }, [user, experimentId, sectionId]);

    const handleEditToggle = () => {
        if (!isEditing) {
            // Enter edit mode: init draft with current
            setDraftRows(JSON.parse(JSON.stringify(currentRows)));
            setIsEditing(true);
        } else {
            // Cancel edit mode
            setIsEditing(false);
        }
    };

    const handleSave = async () => {
        setCurrentRows(draftRows);
        setIsEditing(false);

        if (user) {
            // Persist to Supabase
            await saveObservation(user.id, experimentId, sectionId, draftRows);
        } else {
            // Persist to localStorage
            const localKey = `${experimentId}-draftData-${sectionId}`;
            localStorage.setItem(localKey, JSON.stringify(draftRows));
        }
    };

    const handleReset = () => {
        setCurrentRows(block.rows || []);
        setIsEditing(false);
    };

    const handleChange = (rowIndex, colIndex, value) => {
        const newDraft = [...draftRows];
        newDraft[rowIndex] = [...newDraft[rowIndex]];
        newDraft[rowIndex][colIndex] = value;
        setDraftRows(newDraft);
    };

    return (
        <div className={`${styles.contentBlock} ${styles.tableWrapper}`}>
            {/* Top Toolbar: Plot & Edit */}
            {canPlot && (
                <div className={styles.tableToolbar}>
                    <button
                        className={`${styles.plotToggleBtn} ${isPlotOpen ? styles.plotToggleActive : ''}`}
                        onClick={() => setIsPlotOpen(!isPlotOpen)}
                        title={isPlotOpen ? 'Close plot' : 'Plot this data'}
                    >
                        📊 {isPlotOpen ? 'Close Plot' : 'Plot Data'}
                    </button>
                    <button 
                        className={styles.editToggleBtn} 
                        onClick={handleEditToggle}
                        title={isEditing ? 'Cancel editing' : 'Edit table data'}
                    >
                        {isEditing ? '✕ Cancel' : '✎ Edit Data'}
                    </button>
                </div>
            )}

            {isPlotOpen && (
                <div className={styles.inlinePlotContainer}>
                    <PlotPanel headers={block.headers} rows={currentRows} />
                </div>
            )}

            <div className={styles.tableScroll}>
                <table className={`${styles.table} ${isEditing ? styles.tableEditing : ''}`}>
                    <thead>
                        <tr>
                            {block.headers.map((header, i) => <th key={i}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {(isEditing ? draftRows : currentRows).map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j}>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className={styles.tableInput}
                                                value={cell}
                                                onChange={(e) => handleChange(i, j, e.target.value)}
                                            />
                                        ) : (
                                            cell
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Edit Action Bar */}
            {isEditing && (
                <div className={styles.tableEditActions}>
                    <span className={styles.editHint}>Editing data — changes will update the plot.</span>
                    <div className={styles.editBtnGroup}>
                        <button className={styles.resetBtn} onClick={handleReset}>Reset to Default</button>
                        <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
}
