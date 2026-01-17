
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Maximize2, Minimize2, FileSpreadsheet, ArrowUpDown, Filter
} from 'lucide-react';

export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'status' | 'currency' | 'actions';
  width?: number;
  render?: (row: any) => React.ReactNode;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  title?: string;
  headerColor?: string;
}

const DataGrid: React.FC<DataGridProps> = ({ columns, data, title }) => {
  const { ui, theme } = useApp();
  const [zoom, setZoom] = useState(100);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const dynamicStyles = useMemo(() => {
    const scale = zoom / 100;
    const baseFontSize = ui.baseFontSize || 14;
    const calculatedFontSize = Math.max(8, baseFontSize * scale * (ui.gridDensity === 'compact' ? 0.8 : 0.9));

    let py = 10;
    if (ui.gridDensity === 'compact') py = 6;
    if (ui.gridDensity === 'spacious') py = 18;

    return {
      fontSize: `${calculatedFontSize}px`,
      padding: `${py * scale}px ${14 * scale}px`,
      headerPadding: `${(py + 4) * scale}px ${14 * scale}px`
    };
  }, [zoom, ui.baseFontSize, ui.gridDensity]);

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

  return (
    <div className={`
      overflow-hidden flex flex-col h-full transition-all duration-300 shadow-sm rounded-2xl border
      ${theme === 'light'
        ? 'bg-white border-slate-200'
        : 'bg-slate-900 border-indigo-900/30'
      }
    `}>
      <div className={`
        px-4 py-3 border-b flex items-center justify-between
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

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse table-fixed min-w-full" style={{ fontSize: dynamicStyles.fontSize }}>
          <thead>
            <tr className={theme === 'light' ? 'bg-slate-800 text-white' : 'bg-indigo-800 text-indigo-100'}>
              <th className="sticky top-0 z-20 w-12 border border-white/5 text-center font-black bg-inherit p-2">#</th>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`sticky top-0 z-20 text-start font-black border border-white/5 uppercase tracking-tighter bg-inherit transition-colors ${col.key !== 'actions' ? 'cursor-pointer hover:bg-white/10' : ''}`}
                  style={{ width: col.width, padding: dynamicStyles.headerPadding }}
                >
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="truncate">{col.label}</span>
                    {col.key !== 'actions' && <ArrowUpDown size={10} className={`shrink-0 transition-opacity ${sortKey === col.key ? 'opacity-100' : 'opacity-20'}`} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={theme === 'light' ? 'bg-white' : 'bg-slate-900'}>
            {sortedData.length > 0 ? sortedData.map((row, idx) => (
              <tr
                key={idx}
                className={`
                  transition-colors border-b
                  ${theme === 'light'
                    ? 'hover:bg-amber-50/50 odd:bg-white even:bg-slate-50/40 border-slate-100'
                    : 'hover:bg-indigo-900/30 odd:bg-slate-900 even:bg-indigo-950/30 border-indigo-900/30'
                  }
                `}
              >
                <td className={`text-center font-bold p-1 tabular-nums border-x ${theme === 'light' ? 'border-slate-100 text-slate-400' : 'border-indigo-900/30 text-indigo-500'}`}>
                  {idx + 1}
                </td>
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`font-bold overflow-hidden whitespace-nowrap border-x ${theme === 'light' ? 'border-slate-100 text-slate-700' : 'border-indigo-900/30 text-indigo-200'}`}
                    style={{ padding: dynamicStyles.padding }}
                  >
                    {col.render ? col.render(row) : (
                      col.type === 'number' ? (
                        <div className={`text-start font-mono truncate tabular-nums ${theme === 'light' ? 'text-blue-700' : 'text-indigo-400'}`}>
                          {row[col.key]?.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>
                      ) : col.type === 'currency' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-[10px] tracking-widest">{row[col.key]}</span>
                        </div>
                      ) : (
                        <span className="truncate block leading-tight">{row[col.key]}</span>
                      )
                    )}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className={`py-24 text-center font-black text-[10px] uppercase tracking-[0.4em] ${theme === 'light' ? 'text-slate-400 bg-slate-50/20' : 'text-indigo-500 bg-indigo-950/20'}`}
                >
                  قاعدة البيانات خالية حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`
        px-4 py-2 border-t flex items-center justify-between text-[9px] font-black uppercase tracking-wider
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
          <span>Alzhra Secure Engine v4.0</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
