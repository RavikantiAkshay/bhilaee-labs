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
    const [isTweaking, setIsTweaking] = useState(false);
    
    // currentRows hold the actual data sent to the plot
    const [currentRows, setCurrentRows] = useState(block.rows || []);
    // draftRows hold the temporary edits before saving
    const [draftRows, setDraftRows] = useState(block.rows || []);
    // Snapshot for non-cumulative tweaks
    const [preTweakRows, setPreTweakRows] = useState(null);

    // Tweak configuration
    const [tolerance, setTolerance] = useState(5); // 5% by default
    const [selectedCols, setSelectedCols] = useState(() => {
        // Default select all numeric columns except S.No (usually col 0)
        return (block.headers || []).map((h, i) => {
            if (h.toLowerCase().includes('s.no') || h.toLowerCase().includes('serial')) return null;
            return i;
        }).filter(item => item !== null);
    });

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
            setIsTweaking(false);
            setPreTweakRows(null);
        }
    };

    const handleTweakToggle = () => {
        if (!isTweaking) {
            // Enter tweak mode: ensure we are editing
            let baseData = draftRows;
            if (!isEditing) {
                baseData = JSON.parse(JSON.stringify(currentRows));
                setDraftRows(baseData);
                setIsEditing(true);
            }
            setIsTweaking(true);
            setPreTweakRows(JSON.parse(JSON.stringify(baseData))); // Save point zero
        } else {
            setIsTweaking(false);
            setPreTweakRows(null);
        }
    };

    const generateTweakedData = () => {
        const source = preTweakRows || draftRows;
        if (!source || source.length === 0) return;

        const tolFactor = tolerance / 100;
        const numCols = source[0].length;
        
        // Deep copy to work on
        let tweakedTable = JSON.parse(JSON.stringify(source));

        // Helper to format values with correct precision
        const formatValue = (val, originalCell) => {
            const originalStr = String(originalCell);
            const decimalIdx = originalStr.indexOf('.');
            const precision = decimalIdx === -1 ? 2 : (originalStr.length - decimalIdx - 1);
            return val.toFixed(precision);
        };

        selectedCols.forEach(colIndex => {
            const colData = source.map(row => {
                const val = parseFloat(String(row[colIndex]).replace(/,/g, ''));
                return isNaN(val) ? null : val;
            });

            // Skip columns that aren't fully numeric for now
            if (colData.some(v => v === null)) return;

            // Detect Global Trend (Monotonicity)
            let isIncreasing = true;
            let isDecreasing = true;
            let isStrict = false; // Check if there's actually a trend or just flat data

            for (let i = 1; i < colData.length; i++) {
                if (colData[i] > colData[i - 1]) isDecreasing = false;
                if (colData[i] < colData[i - 1]) isIncreasing = false;
                if (colData[i] !== colData[i - 1]) isStrict = true;
            }

            const isMonotonic = isStrict && (isIncreasing || isDecreasing);

            if (isMonotonic) {
                // TREND-AWARE Jitter: apply variance to the DELTAS (intervals)
                // This guarantees the trend is preserved (stays increasing/decreasing)
                let lastTweakedVal = colData[0] * (1 + (Math.random() * 2 - 1) * (tolFactor * 0.5)); // Slower start jitter
                tweakedTable[0][colIndex] = formatValue(lastTweakedVal, source[0][colIndex]);

                for (let i = 1; i < colData.length; i++) {
                    const originalDelta = colData[i] - colData[i - 1];
                    // Vary the delta by the tolerance
                    const jitteredDelta = originalDelta * (1 + (Math.random() * 2 - 1) * tolFactor);
                    
                    // Crucial: Step-preservation check
                    // If original delta was positive, ensure jittered delta stays positive (and vice versa)
                    const normalizedDelta = (originalDelta > 0) ? Math.max(0.0001, jitteredDelta) : Math.min(-0.0001, jitteredDelta);
                    
                    lastTweakedVal += normalizedDelta;
                    tweakedTable[i][colIndex] = formatValue(lastTweakedVal, source[i][colIndex]);
                }
            } else {
                // STANDARD Jitter: Independent random variation
                for (let i = 0; i < colData.length; i++) {
                    const factor = 1 + ((Math.random() * 2 - 1) * tolFactor);
                    const tweaked = colData[i] * factor;
                    tweakedTable[i][colIndex] = formatValue(tweaked, source[i][colIndex]);
                }
            }
        });

        setDraftRows(tweakedTable);
    };

    const toggleColSelection = (idx) => {
        setSelectedCols(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleSave = async () => {
        const originalRows = [...currentRows];
        setCurrentRows(draftRows);
        setIsEditing(false);
        setIsTweaking(false);
        setPreTweakRows(null);

        try {
            if (user) {
                // Persist to Supabase
                const { error } = await saveObservation(user.id, experimentId, sectionId, draftRows);
                if (error) throw error;
            } else {
                // Persist to localStorage
                const localKey = `${experimentId}-draftData-${sectionId}`;
                localStorage.setItem(localKey, JSON.stringify(draftRows));
            }
        } catch (e) {
            console.error('EditableTableBlock: Save failed', e);
            alert('Could not save data to cloud. Reverting UI.');
            setCurrentRows(originalRows);
        }
    };

    const handleReset = () => {
        if (confirm("Reset table to its default experimental values? Current changes will be lost.")) {
            setCurrentRows(block.rows || []);
            setIsEditing(false);
            setIsTweaking(false);
            setPreTweakRows(null);
        }
    };

    const handleChange = (rowIndex, colIndex, value) => {
        const newDraft = [...draftRows];
        newDraft[rowIndex] = [...newDraft[rowIndex]];
        newDraft[rowIndex][colIndex] = value;
        setDraftRows(newDraft);
        // If we were in the middle of a tweak-preview, update the base snapshot too
        if (preTweakRows) {
            const newPreTweak = [...preTweakRows];
            newPreTweak[rowIndex] = [...newPreTweak[rowIndex]];
            newPreTweak[rowIndex][colIndex] = value;
            setPreTweakRows(newPreTweak);
        }
    };

    return (
        <div className={`${styles.contentBlock} ${styles.tableWrapper}`}>
            {/* Top Toolbar: Apply Tolerance (Left) | Plot & Edit (Right) */}
            {(canPlot || isEditing) && (
                <div className={styles.tableToolbar}>
                    {canPlot && (
                        <button
                            className={`${styles.tweakToggleBtn} ${isTweaking ? styles.tweakToggleActive : ''}`}
                            onClick={handleTweakToggle}
                            title="Introduce random variance/errors to data"
                        >
                            🎲 Apply Tolerance
                        </button>
                    )}
                    <div style={{ flex: 1 }}></div>
                    {canPlot && (
                        <button
                            className={`${styles.plotToggleBtn} ${isPlotOpen ? styles.plotToggleActive : ''}`}
                            onClick={() => setIsPlotOpen(!isPlotOpen)}
                            title={isPlotOpen ? 'Close plot' : 'Plot this data'}
                        >
                            📊 {isPlotOpen ? 'Close Plot' : 'Plot Data'}
                        </button>
                    )}
                    <button 
                        className={`${styles.editToggleBtn} ${isEditing && !isTweaking ? styles.plotToggleActive : ''}`} 
                        onClick={handleEditToggle}
                        title={isEditing ? 'Cancel editing' : 'Edit table data'}
                    >
                        {isEditing ? '✕ Cancel' : '✎ Edit Data'}
                    </button>
                </div>
            )}

            {/* Tweak Panel */}
            {isTweaking && (
                <div className={styles.tweakPanel}>
                    <div className={styles.tweakPanelHeader}>
                        <h4>🎲 Data Randomizer (Tolerance Control)</h4>
                        <span className={styles.editHint}>Introduce realistic error margins based on a tolerance limit.</span>
                    </div>
                    <div className={styles.tweakPanelBody}>
                        <div className={styles.colSelectGroup}>
                            <span className={styles.colSelectLabel}>Select columns to tweak:</span>
                            <div className={styles.colChips}>
                                {block.headers.map((header, i) => (
                                    <div 
                                        key={i} 
                                        className={`${styles.colChip} ${selectedCols.includes(i) ? styles.colChipActive : ''}`}
                                        onClick={() => toggleColSelection(i)}
                                    >
                                        <span className={styles.chipCheck}>
                                            {selectedCols.includes(i) ? '✓' : '○'}
                                        </span>
                                        {header}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.toleranceGroup}>
                            <span className={styles.colSelectLabel}>Tolerance (±%):</span>
                            <div className={styles.toleranceInputWrapper}>
                                <input 
                                    type="number" 
                                    className={styles.toleranceInput} 
                                    value={tolerance} 
                                    onChange={(e) => setTolerance(Math.max(0, parseFloat(e.target.value) || 0))} 
                                />
                                <button className={styles.tweakBtn} onClick={generateTweakedData}>
                                    Generate Samples
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPlotOpen && (
                <div className={styles.inlinePlotContainer}>
                    <PlotPanel headers={block.headers} rows={isEditing ? draftRows : currentRows} />
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
                    <span className={styles.editHint}>
                        {isTweaking ? 'Previewing random variations — "Generate" to rerun, "Save" to keep.' : 'Editing data — changes will update the plot.'}
                    </span>
                    <div className={styles.editBtnGroup}>
                        <button className={styles.resetBtn} onClick={handleReset}>Reset to Default</button>
                        <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
}
