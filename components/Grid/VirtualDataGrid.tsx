import React, { useState, useMemo, useRef, useEffect, CSSProperties } from 'react';
import { List } from 'react-window';
import { useApp } from '../../context/AppContext';
import {
    Maximize2, Minimize2, FileSpreadsheet, ArrowUpDown, Filter
} from 'lucide-react';

// Custom hook to replace AutoSizer
const useContainerSize = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current) return;

        const updateSize = () => {
            if (ref.current) {
                setSize({
                    width: ref.current.clientWidth || 400,
                    height: ref.current.clientHeight || 300
                });
            }
        };

        updateSize();

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(ref.current);

        return () => resizeObserver.disconnect();
    }, [ref]);

    return size;
};


// Re-using the Column interface from DataGrid
export interface Column {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'status' | 'currency' | 'actions';
    width?: number; // width in pixels is highly recommended for virtualization
    render?: (row: any) => React.ReactNode;
}

interface VirtualDataGridProps {
    columns: Column[];
    data: any[];
    title?: string;
    rowHeight?: number;
}

// Row props interface for react-window v2
interface RowProps {
    sortedData: any[];
    columns: Column[];
    dynamicStyles: {
        fontSize: string;
        rowHeight: number;
        padding: string;
    };
    theme: string;
}

// Row component for react-window v2
const RowComponent = ({
    index,
    style,
    sortedData,
    columns,
    dynamicStyles,
    theme
}: {
    ariaAttributes: any;
    index: number;
    style: CSSProperties;
} & RowProps) => {
    const row = sortedData[index];

    return (
        <div
            style={style}
            className={`
      flex items-center border-b transition-colors
      ${theme === 'light'
                    ? 'hover:bg-amber-50/50 odd:bg-white even:bg-slate-50/40 border-slate-100'
                    : 'hover:bg-indigo-900/30 odd:bg-slate-900 even:bg-indigo-950/30 border-indigo-900/30'
                }
    `}
        >
            {/* Index Column */}
            <div
                className={`
         shrink-0 w-12 text-center font-bold tabular-nums border-e h-full flex items-center justify-center
         ${theme === 'light' ? 'border-slate-100 text-slate-400' : 'border-indigo-900/30 text-indigo-500'}
       `}
                style={{ fontSize: dynamicStyles.fontSize }}
            >
                {index + 1}
            </div>

            {/* Data Columns */}
            {columns.map((col) => (
                <div
                    key={col.key}
                    className={`
          shrink-0 h-full flex items-center border-e overflow-hidden whitespace-nowrap
          ${theme === 'light' ? 'border-slate-100 text-slate-700' : 'border-indigo-900/30 text-indigo-200'}
        `}
                    style={{
                        width: col.width || 150, // Default width if not specified
                        padding: dynamicStyles.padding,
                        fontSize: dynamicStyles.fontSize
                    }}
                >
                    {col.render ? col.render(row) : (
                        col.type === 'number' ? (
                            <div className={`w-full text-start font-mono truncate tabular-nums ${theme === 'light' ? 'text-blue-700' : 'text-indigo-400'}`}>
                                {row[col.key]?.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                            </div>
                        ) : col.type === 'currency' ? (
                            <div className="flex items-center gap-1.5">
                                <span className="font-black text-[10px] tracking-widest">{row[col.key]}</span>
                            </div>
                        ) : (
                            <span className="truncate block leading-tight w-full">{row[col.key]}</span>
                        )
                    )}
                </div>
            ))}
        </div>
    );
};

const VirtualDataGrid: React.FC<VirtualDataGridProps> = ({ columns, data, title, rowHeight = 45 }) => {
    const { ui, theme } = useApp();
    const [zoom, setZoom] = useState(100);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Container ref and size for virtualization
    const containerRef = useRef<HTMLDivElement>(null);
    const { width: containerWidth, height: containerHeight } = useContainerSize(containerRef);

    const dynamicStyles = useMemo(() => {
        const scale = zoom / 100;
        const baseFontSize = ui.baseFontSize || 14;
        const calculatedFontSize = Math.max(8, baseFontSize * scale * (ui.gridDensity === 'compact' ? 0.8 : 0.9));

        // Adjust row height based on zoom and density
        let baseRowHeight = rowHeight;
        if (ui.gridDensity === 'compact') baseRowHeight = 35;
        if (ui.gridDensity === 'spacious') baseRowHeight = 55;

        return {
            fontSize: `${calculatedFontSize}px`,
            rowHeight: baseRowHeight * scale,
            padding: `${(ui.gridDensity === 'compact' ? 4 : 8) * scale}px ${10 * scale}px`
        };
    }, [zoom, ui.baseFontSize, ui.gridDensity, rowHeight]);

    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortOrder]);

    const handleSort = (key: string) => {
        if (key === 'actions') return;
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    // Row props for react-window v2 API
    const rowProps: RowProps = useMemo(() => ({
        sortedData,
        columns,
        dynamicStyles,
        theme
    }), [sortedData, columns, dynamicStyles, theme]);

    return (
        <div className={`
      flex flex-col h-full transition-all duration-300 shadow-sm rounded-2xl border overflow-hidden
      ${theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-slate-900 border-indigo-900/30'
            }
    `}>
            {/* Header Toolbar */}
            <div className={`
        px-4 py-3 border-b flex items-center justify-between shrink-0
        ${theme === 'light'
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-900 border-indigo-900/30'
                }
      `}>
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-900/50 text-indigo-400 border-indigo-800/30'}`}>
                        <FileSpreadsheet size={14} />
                    </div>
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.1em] ${theme === 'light' ? 'text-slate-800' : 'text-indigo-200'}`}>
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center border rounded overflow-hidden ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-indigo-900/30 border-indigo-800/30'}`}>
                        <button
                            onClick={() => setZoom(z => Math.max(60, z - 10))}
                            className={`p-1.5 transition-all border-e ${theme === 'light' ? 'text-slate-400 hover:text-amber-600 border-slate-200' : 'text-indigo-400 hover:text-indigo-200 border-indigo-800/30'}`}
                        >
                            <Minimize2 size={12} />
                        </button>
                        <span className={`px-3 text-[9px] font-black tabular-nums ${theme === 'light' ? 'text-slate-600' : 'text-indigo-300'}`}>
                            {zoom}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(140, z + 10))}
                            className={`p-1.5 transition-all border-s ${theme === 'light' ? 'text-slate-400 hover:text-amber-600 border-slate-200' : 'text-indigo-400 hover:text-indigo-200 border-indigo-800/30'}`}
                        >
                            <Maximize2 size={12} />
                        </button>
                    </div>
                    <button className={`p-1.5 border transition-colors ${theme === 'light' ? 'bg-white border-slate-200 text-slate-400 hover:text-amber-600' : 'bg-indigo-900/30 border-indigo-800/30 text-indigo-400 hover:text-indigo-200'}`}>
                        <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className={`
        flex border-b shrink-0 overflow-hidden
        ${theme === 'light' ? 'bg-slate-800 text-white' : 'bg-indigo-800 text-indigo-100'}
      `}
                style={{ paddingRight: '10px' }} // Compensate for scrollbar in body
            >
                <div className="w-12 shrink-0 border-e border-white/5 p-2 text-center font-black">#</div>
                {columns.map(col => (
                    <div
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`
               shrink-0 p-2 text-start font-black border-e border-white/5 uppercase tracking-tighter cursor-pointer hover:bg-white/10 flex items-center justify-between gap-2
             `}
                        style={{ width: col.width || 150 }}
                    >
                        <span className="truncate">{col.label}</span>
                        {col.key !== 'actions' && <ArrowUpDown size={10} className={`shrink-0 transition-opacity ${sortKey === col.key ? 'opacity-100' : 'opacity-20'}`} />}
                    </div>
                ))}
            </div>

            {/* Virtualized Body */}
            <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 200 }}>
                {containerHeight > 0 && containerWidth > 0 && (
                    <List<RowProps>
                        rowComponent={RowComponent}
                        rowCount={sortedData.length}
                        rowHeight={dynamicStyles.rowHeight}
                        rowProps={rowProps}
                        className="custom-scrollbar"
                        style={{ height: containerHeight, width: containerWidth }}
                    />
                )}
            </div>

            {/* Footer */}
            <div className={`
        px-4 py-2 border-t flex items-center justify-between text-[9px] font-black uppercase tracking-wider shrink-0
        ${theme === 'light'
                    ? 'bg-white border-slate-100 text-slate-400'
                    : 'bg-slate-900 border-indigo-900/30 text-indigo-500'
                }
      `}>
                <div className="flex gap-4">
                    <span>سجلات: {sortedData.length}</span>
                    <span>وضع العرض: {ui.gridDensity}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Alzhra Speed Engine v1.0</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default VirtualDataGrid;
