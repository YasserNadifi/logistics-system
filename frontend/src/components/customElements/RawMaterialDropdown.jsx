import React, { useState, useRef, useEffect } from 'react';

/**
 * options: array of inventory items:
 * {
 *   id,
 *   quantity,
 *   reorderThreshold,
 *   rawMaterialDto: { id, name, sku, ... }
 * }
 *
 * value: the selected rawMaterialDto.id (string or number)
 * onChange: fn(rawMaterialIdString)
 */
const RawMaterialDropdownInventory = ({ value, onChange, options = [], placeholder = 'Select Raw Material' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);

  // selected by rawMaterialDto.id
  const selected = options.find(opt => String(opt.rawMaterialDto?.id) === String(value));

  const filtered = options.filter(opt => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = (opt.rawMaterialDto?.name || '').toLowerCase();
    const sku = (opt.rawMaterialDto?.sku || '').toLowerCase();
    return name.includes(q) || sku.includes(q);
  });

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => setHighlight(0), [query, open]);

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) {
        onChange(String(item.rawMaterialDto.id));
        setOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Raw Material</label>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
        className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg bg-white hover:shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-900 truncate">
              {selected ? selected.rawMaterialDto.name : placeholder}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {selected ? selected.rawMaterialDto.sku : 'SKU'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {selected && (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                (selected.quantity <= selected.reorderThreshold && selected.reorderThreshold > 0)
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Qty: {Number(selected.quantity ?? 0)}
            </span>
          )}
          <svg className={`h-4 w-4 text-gray-400 transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-lg border border-gray-100">
          <div className="px-3 py-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search by name or SKU..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <ul role="listbox" tabIndex={-1} className="max-h-56 overflow-auto divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No results</li>
            ) : filtered.map((inv, idx) => {
              const isHighlighted = idx === highlight;
              const rm = inv.rawMaterialDto || {};
              const lowStock = inv.reorderThreshold > 0 && inv.quantity <= inv.reorderThreshold;
              return (
                <li
                  key={inv.id}
                  role="option"
                  aria-selected={String(rm.id) === String(value)}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => { onChange(String(rm.id)); setOpen(false); setQuery(''); }}
                  className={`cursor-pointer px-4 py-3 flex items-center justify-between ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{rm.name}</span>
                    <span className="text-xs text-gray-500 truncate">{rm.sku}</span>
                  </div>

                  <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                    {lowStock && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Low
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {Number(inv.quantity ?? 0)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RawMaterialDropdownInventory;
