import React, { useState, useRef, useEffect } from 'react';

/**
 * GenericDropdown (inventory-aware)
 *
 * Props:
 * - value: current selected id (string or number) — this will be the inner DTO id:
 *     - for product-inventory -> returns productDto.id
 *     - for raw-material-inventory -> returns rawMaterialDto.id
 *     - for plain product/rawMaterial objects -> returns .id
 * - onChange(idString)
 * - options: array of either:
 *     - inventory items: { id, quantity, reorderThreshold, productDto: {...} } OR { ..., rawMaterialDto: {...} }
 *     - or plain items: { id, name, sku, unit, ... } (fallback)
 * - placeholder: label string
 */
const GenericDropdown = ({ value, onChange, options = [], placeholder = 'Select...' , compact = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  // Normalization: map every option into unified shape.
  const normalized = options.map(opt => {
    // product inventory: has productDto
    if (opt && opt.productDto) {
      const p = opt.productDto;
      return {
        _type: 'product-inv',
        original: opt,
        id: String(p.id),
        title: p.name || p.sku || `#${p.id}`,
        subtitle: p.sku || '',
        badge: Number(opt.quantity ?? 0),
        unit: p.unit || '',
        lowStock: opt.reorderThreshold > 0 && opt.quantity <= opt.reorderThreshold
      };
    }

    // raw material inventory: has rawMaterialDto
    if (opt && opt.rawMaterialDto) {
      const r = opt.rawMaterialDto;
      return {
        _type: 'raw-inv',
        original: opt,
        id: String(r.id),
        title: r.name || r.sku || `#${r.id}`,
        subtitle: r.sku || '',
        badge: Number(opt.quantity ?? 0),
        unit: r.unit || '',
        lowStock: opt.reorderThreshold > 0 && opt.quantity <= opt.reorderThreshold
      };
    }

    // plain product/rawMaterial object fallback
    return {
      _type: 'plain',
      original: opt,
      id: String(opt.id),
      title: opt.name || opt.sku || `#${opt.id}`,
      subtitle: opt.sku || '',
      badge: null,
      unit: opt.unit || '',
      lowStock: false
    };
  });

  const selected = normalized.find(n => String(n.id) === String(value));

  const filtered = normalized.filter(n => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (n.title || '').toLowerCase().includes(q) || (n.subtitle || '').toLowerCase().includes(q);
  });

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => setHighlight(0), [query, open, options]);

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
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = filtered[highlight];
      if (sel) {
        // map back to id depending on type
        if (sel._type === 'product-inv') onChange(String(sel.original.productDto.id));
        else if (sel._type === 'raw-inv') onChange(String(sel.original.rawMaterialDto.id));
        else onChange(String(sel.original.id));
        setOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };
    // compact paddings when true
const buttonPadding = compact ? 'px-3' : 'px-4 py-3';
const inputPadding  = compact ? 'px-2 py-1' : 'px-3 py-2';

  const listItemPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  const buttonHeight = compact ? 'h-10' : '';
const inputHeight = compact ? 'h-9' : ''; // slightly smaller for the search input inside dropdown


  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{placeholder}</label>

<button
  type="button"
  onClick={() => setOpen(o => !o)}
  onKeyDown={onKeyDown}
  className={`w-full text-left ${buttonPadding} ${buttonHeight} border border-gray-300 rounded-lg bg-white hover:shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
  aria-haspopup="listbox"
  aria-expanded={open}
> 
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">{selected ? selected.title : placeholder}</span>
        {(!compact && (selected ? selected.subtitle : true)) && (
      <span className="text-xs text-gray-500 truncate">{selected ? selected.subtitle : ''}</span>
    )}
        </div>

        <div className="flex items-center space-x-3">
          {/* show quantity badge if present (inventory) */}
          {selected && selected.badge != null && (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${selected.lowStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
              Qty: {selected.badge}
            </span>
          )}

          {/* show unit badge if no quantity but unit exists */}
          {selected && selected.badge == null && selected.unit && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{selected.unit}</span>
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
  className={`w-full ${inputPadding} ${inputHeight} text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
/>
          </div>

          <ul role="listbox" tabIndex={-1} className="max-h-64 overflow-auto divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No results</li>
            ) : filtered.map((item, idx) => {
              const isHighlighted = idx === highlight;
              return (
                <li
                  key={`${item._type}-${item.id}-${idx}`}
                  role="option"
                  aria-selected={String(item.id) === String(value)}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => {
                    if (item._type === 'product-inv') onChange(String(item.original.productDto.id));
                    else if (item._type === 'raw-inv') onChange(String(item.original.rawMaterialDto.id));
                    else onChange(String(item.original.id));
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`cursor-pointer ${listItemPadding} flex items-center justify-between ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                    <span className="text-xs text-gray-500 truncate">{item.subtitle}</span>
                  </div>

                  <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                    {item.lowStock && <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Low</span>}
                    {item.badge != null ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{item.badge}</span>
                    ) : item.unit ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{item.unit}</span>
                    ) : null}
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

export default GenericDropdown;
