import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export const Input = ({ label, name, type = 'text', value, onChange, placeholder, required = false, hint = '' }) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={name} className="block font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3]">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB] dark:bg-[#0E1117] focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all duration-200 font-body placeholder:text-[#6B7280]/50 dark:placeholder:text-[#8A92A3]/50"
            />
            {hint && <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">{hint}</p>}
        </div>
    );
};

export const TextArea = ({ label, name, value, onChange, placeholder, rows = 4, required = false, hint = '' }) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={name} className="block font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3]">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB] dark:bg-[#0E1117] focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all duration-200 font-body resize-y placeholder:text-[#6B7280]/50 dark:placeholder:text-[#8A92A3]/50"
            />
            {hint && <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">{hint}</p>}
        </div>
    );
};

// Maps the friendly color keys used across the admin (see Skills categories)
// to Tailwind dot swatches. Falls back to the live accent color.
const DOT_COLORS = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-400',
    red: 'bg-red-500',
};

// Custom animated dropdown (a listbox). Drop-in replacement for the old native
// <select>: same props, and onChange still receives a synthetic
// { target: { name, value } } so existing handlers work unchanged.
// Options may optionally carry `color` (dot swatch) and/or `icon` (react-icon)
// to render a richer, on-brand row. The panel is portalled to <body> with fixed
// positioning so it is never clipped by overflow containers (e.g. the modal).
export const Select = ({ label, name, value, onChange, options = [], required = false, hint = '', placeholder = 'Select...', disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [pos, setPos] = useState(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const uid = useId();
    const listboxId = `${uid}-listbox`;

    const selectedIndex = options.findIndex((o) => o.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
    const isEmpty = !selected || selected.value === '';

    const computePosition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const gap = 8;
        const estimated = Math.min(options.length * 44 + 12, 288);
        const spaceBelow = window.innerHeight - r.bottom;
        const openUp = spaceBelow < estimated + gap && r.top > spaceBelow;
        setPos({
            left: r.left,
            width: r.width,
            top: r.bottom + gap,
            bottom: window.innerHeight - r.top + gap,
            openUp,
        });
    }, [options.length]);

    const openMenu = () => {
        if (disabled) return;
        computePosition();
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
    };

    const closeMenu = useCallback((refocus = true) => {
        setOpen(false);
        setActiveIndex(-1);
        if (refocus) triggerRef.current?.focus();
    }, []);

    const selectOption = (opt) => {
        onChange?.({ target: { name, value: opt.value } });
        closeMenu();
    };

    // Outside click + keep the panel glued to the trigger on scroll/resize.
    useEffect(() => {
        if (!open) return;
        const onDocMouseDown = (e) => {
            if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
            closeMenu(false);
        };
        const onReflow = () => computePosition();
        document.addEventListener('mousedown', onDocMouseDown);
        window.addEventListener('resize', onReflow);
        window.addEventListener('scroll', onReflow, true);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            window.removeEventListener('resize', onReflow);
            window.removeEventListener('scroll', onReflow, true);
        };
    }, [open, computePosition, closeMenu]);

    // Keep the keyboard-highlighted option scrolled into view.
    useEffect(() => {
        if (!open || activeIndex < 0) return;
        panelRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open]);

    const onKeyDown = (e) => {
        if (disabled) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!open) return openMenu();
                setActiveIndex((i) => Math.min(options.length - 1, i + 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!open) return openMenu();
                setActiveIndex((i) => Math.max(0, i - 1));
                break;
            case 'Home':
                if (open) { e.preventDefault(); setActiveIndex(0); }
                break;
            case 'End':
                if (open) { e.preventDefault(); setActiveIndex(options.length - 1); }
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!open) openMenu();
                else if (activeIndex >= 0) selectOption(options[activeIndex]);
                break;
            case 'Escape':
                if (open) { e.preventDefault(); closeMenu(); }
                break;
            case 'Tab':
                if (open) closeMenu(false);
                break;
            default:
                break;
        }
    };

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={name} className="block font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3]">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}

            <button
                type="button"
                ref={triggerRef}
                id={name}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={open && activeIndex >= 0 ? `${uid}-opt-${activeIndex}` : undefined}
                disabled={disabled}
                onClick={() => (open ? closeMenu() : openMenu())}
                onKeyDown={onKeyDown}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-[#FAFAFB] dark:bg-[#0E1117] text-left font-body outline-none transition-all duration-200
                    ${open
                        ? 'border-accent ring-2 ring-accent/30'
                        : 'border-[#E7E8EE] dark:border-[#262D3A] hover:border-accent/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30'}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {!isEmpty && selected?.color && (
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT_COLORS[selected.color] || 'bg-accent'}`} />
                )}
                {!isEmpty && !selected?.color && selected?.icon && (
                    <selected.icon className="w-4 h-4 shrink-0 text-accent" strokeWidth={2} />
                )}
                <span className={`flex-1 truncate ${isEmpty ? 'text-[#6B7280]/70 dark:text-[#8A92A3]/70' : ''}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <FiChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-accent' : 'text-[#6B7280] dark:text-[#8A92A3]'}`}
                    strokeWidth={2.5}
                />
            </button>

            {open && pos && createPortal(
                <ul
                    ref={panelRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={label || name}
                    style={{
                        position: 'fixed',
                        left: pos.left,
                        width: pos.width,
                        ...(pos.openUp ? { bottom: pos.bottom } : { top: pos.top }),
                        transformOrigin: pos.openUp ? 'bottom center' : 'top center',
                    }}
                    className="z-[60] max-h-[288px] overflow-y-auto p-1.5 rounded-2xl border border-[#E7E8EE] dark:border-[#262D3A] bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(16,24,40,0.28)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] animate-dropdownIn"
                >
                    {options.map((opt, i) => {
                        const isSel = opt.value === value;
                        const isActive = i === activeIndex;
                        const optEmpty = opt.value === '';
                        const OptIcon = opt.icon;
                        return (
                            <li
                                key={opt.value ?? i}
                                id={`${uid}-opt-${i}`}
                                data-index={i}
                                role="option"
                                aria-selected={isSel}
                                onMouseEnter={() => setActiveIndex(i)}
                                onClick={() => selectOption(opt)}
                                style={{ animationDelay: `${Math.min(i, 8) * 22}ms` }}
                                className={`animate-dropdownItemIn flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer font-display text-sm transition-colors duration-150
                                    ${isActive
                                        ? 'bg-accent/10 text-accent'
                                        : optEmpty
                                            ? 'text-[#6B7280] dark:text-[#8A92A3]'
                                            : 'text-[#14151A] dark:text-[#ECEEF1]'}`}
                            >
                                {opt.color ? (
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-transparent transition-shadow ${DOT_COLORS[opt.color] || 'bg-accent'} ${isActive ? 'ring-white dark:ring-[#161B22] shadow-[0_0_0_1px_currentColor]' : ''}`} />
                                ) : OptIcon ? (
                                    <OptIcon className="w-4 h-4 shrink-0" strokeWidth={2} />
                                ) : null}
                                <span className="flex-1 truncate">{opt.label}</span>
                                {isSel && <FiCheck className="w-4 h-4 shrink-0 text-accent" strokeWidth={2.5} />}
                            </li>
                        );
                    })}
                </ul>,
                document.body
            )}

            {hint && <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">{hint}</p>}
        </div>
    );
};