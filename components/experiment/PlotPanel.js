'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Scatter } from 'react-chartjs-2';
import styles from './PlotPanel.module.css';

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, zoomPlugin);

/**
 * Determine if a column (by index) is numeric.
 * A column is numeric if >= 80% of its non-empty values parse as finite numbers.
 */
function isNumericColumn(rows, colIndex) {
    let total = 0;
    let numeric = 0;
    for (const row of rows) {
        const val = row[colIndex];
        if (val === undefined || val === null || String(val).trim() === '') continue;
        total++;
        const parsed = parseFloat(String(val).replace(/,/g, ''));
        if (!isNaN(parsed) && isFinite(parsed)) numeric++;
    }
    if (total === 0) return false;
    return (numeric / total) >= 0.8;
}

/**
 * Parse a cell value into a number, returning null if unparseable.
 */
function parseCell(val) {
    if (val === undefined || val === null) return null;
    const cleaned = String(val).replace(/,/g, '').trim();
    if (cleaned === '') return null;
    const n = parseFloat(cleaned);
    return (!isNaN(n) && isFinite(n)) ? n : null;
}

export default function PlotPanel({ headers, rows }) {
    const [xCol, setXCol] = useState('');
    const [yCol, setYCol] = useState('');
    const [y2Col, setY2Col] = useState('');
    const [showChart, setShowChart] = useState(false);
    const chartRef = useRef(null);

    // Find numeric columns
    const numericCols = useMemo(() => {
        return headers
            .map((h, i) => ({ index: i, name: h }))
            .filter(col => isNumericColumn(rows, col.index));
    }, [headers, rows]);

    // Build chart data
    const chartData = useMemo(() => {
        if (!showChart || xCol === '' || yCol === '') return null;

        const xi = parseInt(xCol, 10);
        const yi = parseInt(yCol, 10);
        const y2i = y2Col !== '' ? parseInt(y2Col, 10) : null;

        const data1 = [];
        const data2 = [];

        for (const row of rows) {
            const xv = parseCell(row[xi]);
            const yv = parseCell(row[yi]);
            if (xv !== null && yv !== null) {
                data1.push({ x: xv, y: yv });
            }
            if (y2i !== null) {
                const y2v = parseCell(row[y2i]);
                if (xv !== null && y2v !== null) {
                    data2.push({ x: xv, y: y2v });
                }
            }
        }

        const datasets = [
            {
                label: headers[yi],
                data: data1,
                showLine: true,
                borderColor: '#228be6',
                backgroundColor: 'rgba(34, 139, 230, 0.15)',
                pointBackgroundColor: '#228be6',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0.1
            }
        ];

        if (y2i !== null && data2.length > 0) {
            datasets.push({
                label: headers[y2i],
                data: data2,
                showLine: true,
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.15)',
                pointBackgroundColor: '#fd7e14',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                borderDash: [6, 3],
                tension: 0.1
            });
        }

        return { datasets };
    }, [showChart, xCol, yCol, y2Col, headers, rows]);

    const chartOptions = useMemo(() => {
        if (!showChart || xCol === '' || yCol === '') return {};
        const xi = parseInt(xCol, 10);
        const yi = parseInt(yCol, 10);
        const y2i = y2Col !== '' ? parseInt(y2Col, 10) : null;

        return {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.8,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: headers[xi], font: { weight: 600, size: 13 } },
                    grace: '5%',
                    grid: { color: 'rgba(0,0,0,0.06)' }
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: y2i !== null
                            ? `${headers[yi]} / ${headers[y2i]}`
                            : headers[yi],
                        font: { weight: 600, size: 13 }
                    },
                    grace: '5%',
                    grid: { color: 'rgba(0,0,0,0.06)' }
                }
            },
            plugins: {
                legend: {
                    display: y2i !== null,
                    position: 'top',
                    align: 'end',
                    labels: { usePointStyle: true, pointStyle: 'circle', padding: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: (${ctx.parsed.x}, ${ctx.parsed.y})`
                    }
                },
                zoom: {
                    pan: { enabled: true, mode: 'xy', threshold: 5 },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy'
                    }
                }
            },
            interaction: { mode: 'nearest', intersect: false }
        };
    }, [showChart, xCol, yCol, y2Col, headers]);

    const handleGenerate = useCallback(() => {
        setShowChart(true);
    }, []);

    const handleResetZoom = useCallback(() => {
        chartRef.current?.resetZoom();
    }, []);

    const canGenerate = xCol !== '' && yCol !== '' && xCol !== yCol;
    const isSingleRow = rows.length === 1;

    return (
        <div className={styles.plotPanel}>
            {/* Column Selector */}
            <div className={styles.selectorRow}>
                <div className={styles.selectorGroup}>
                    <span className={styles.selectorLabel}>X-axis</span>
                    <select
                        className={styles.selectorDropdown}
                        value={xCol}
                        onChange={e => { setXCol(e.target.value); setShowChart(false); }}
                    >
                        <option value="">— Select —</option>
                        {numericCols.map(c => (
                            <option key={c.index} value={c.index}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectorGroup}>
                    <span className={styles.selectorLabel}>Y-axis</span>
                    <select
                        className={styles.selectorDropdown}
                        value={yCol}
                        onChange={e => { setYCol(e.target.value); setShowChart(false); }}
                    >
                        <option value="">— Select —</option>
                        {numericCols.filter(c => String(c.index) !== xCol).map(c => (
                            <option key={c.index} value={c.index}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectorGroup}>
                    <span className={styles.selectorLabel}>Y2</span>
                    <select
                        className={styles.selectorDropdown}
                        value={y2Col}
                        onChange={e => { setY2Col(e.target.value); setShowChart(false); }}
                    >
                        <option value="">— None —</option>
                        {numericCols
                            .filter(c => String(c.index) !== xCol && String(c.index) !== yCol)
                            .map(c => (
                                <option key={c.index} value={c.index}>{c.name}</option>
                            ))}
                    </select>
                </div>

                <button
                    className={styles.generateBtn}
                    disabled={!canGenerate}
                    onClick={handleGenerate}
                >
                    Generate Plot
                </button>
            </div>

            {/* Chart */}
            {showChart && chartData && (
                <div className={styles.chartArea}>
                    <div className={styles.chartControls}>
                        {isSingleRow && (
                            <span className={styles.warning}>
                                ⚠ Only 1 data point — plot may not be meaningful
                            </span>
                        )}
                        <button className={styles.resetBtn} onClick={handleResetZoom}>
                            Reset Zoom
                        </button>
                    </div>
                    <div className={styles.chartContainer}>
                        <Scatter
                            ref={chartRef}
                            data={chartData}
                            options={chartOptions}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
