import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from './Icons';

export default function SearchableDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  allowCustom = false,
  required = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(opt => {
    const textToSearch = typeof opt === 'string' 
      ? opt 
      : `${opt.label} ${opt.searchTerms || ''} ${opt.value}`;
    return textToSearch.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get display value for display box
  const getDisplayValue = () => {
    if (allowCustom) {
      return value || "";
    }
    const selectedOpt = options.find(opt => 
      typeof opt === 'string' ? opt === value : opt.value === value
    );
    return selectedOpt ? (typeof selectedOpt === 'string' ? selectedOpt : selectedOpt.label) : "";
  };

  // Handle custom input typing (for Make, Model, Color)
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setSearchQuery(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (opt) => {
    const optValue = typeof opt === 'string' ? opt : opt.value;
    onChange(optValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={`searchable-dropdown-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      {allowCustom ? (
        // Mode 1: Searchable Input with Suggestions (Make, Model, Color)
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            required={required}
            type="text"
            className="input-control"
            value={value || ""}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
           
          />
          <div style={{ 
            position: 'absolute', 
            right: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            color: 'var(--text-muted)' 
          }}>
            {value && (
              <button 
                type="button" 
                onClick={handleClear} 
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      ) : (
        // Mode 2: Selector with Search Popover (Customer, Vehicle)
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="input-control"
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}
        >
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            maxWidth: 'calc(100% - 28px)',
            color: getDisplayValue() ? 'var(--text-primary)' : 'var(--text-muted)'
          }}>
            {getDisplayValue() || placeholder}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
            {value && (
              <button 
                type="button" 
                onClick={handleClear} 
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="dropdown-menu" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-dropdown)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          maxHeight: '220px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {!allowCustom && (
            <div style={{ 
              padding: '4px', 
              borderBottom: '1px solid var(--border-color)', 
              marginBottom: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(0,0,0,0.06)'
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', flexShrink: 0 }} />
              <input
                type="text"
                autoFocus
                className="input-control"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.85rem',
                 
                  boxShadow: 'none'
                }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', display: 'flex', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((opt, i) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = optValue === value;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  >
                    <span>{optLabel}</span>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--primary)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

