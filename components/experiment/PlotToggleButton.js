'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './PlotPanel.module.css';

// Lazy-load PlotPanel (Chart.js uses canvas, can't SSR)
const PlotPanel = dynamic(() => import('./PlotPanel'), { ssr: false });

export default function PlotToggleButton({ headers, rows }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className={`${styles.plotToggle} ${open ? styles.plotToggleActive : ''}`}
                onClick={() => setOpen(prev => !prev)}
                title={open ? 'Close plot' : 'Plot this data'}
            >
                📊 {open ? 'Close Plot' : 'Plot'}
            </button>
            {open && <PlotPanel headers={headers} rows={rows} />}
        </>
    );
}
