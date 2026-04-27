"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  required?: boolean;
  /** Called when user picks a value from the dropdown (not on free typing). */
  onSelect?: (selected: string) => void;
};

/**
 * A small client-side combobox: input + filtered dropdown.
 * - Free typing is allowed (input value submits as-is to forms).
 * - Suggestions filtered case-insensitively by `contains`.
 * - Dropdown opens on focus or typing; closes on blur, escape, or selection.
 * - Styled to match the rest of the app: navy bg, slate border, amber focus.
 */
export function Combobox({
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  required,
  onSelect,
}: Props) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  // Raw cursor position for keyboard nav. We CLAMP it to the filtered range
  // inline (see safeIndex below) so a filter change doesn't need an effect to
  // reset state — that would trip React 19's cascading-render purity check.
  const [rawIndex, setRawIndex] = useState(0);

  const q = value.trim().toLowerCase();
  const filtered =
    q.length === 0
      ? options
      : options.filter((o) => o.toLowerCase().includes(q));

  const activeIndex =
    filtered.length > 0
      ? Math.min(Math.max(0, rawIndex), filtered.length - 1)
      : -1;

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(option: string) {
    onChange(option);
    onSelect?.(option);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setRawIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setRawIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        pick(filtered[activeIndex]);
      }
    }
  }

  return (
    <div className="space-y-1" ref={wrapperRef}>
      <label htmlFor={id} className="block text-xs font-medium text-slate-400">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 pr-9 text-sm outline-none focus:border-amber-500"
        />
        {value ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-amber-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-transform",
              open && "rotate-180",
            )}
          />
        )}
        {open && filtered.length > 0 && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-navy-700 bg-navy-900 py-1 text-sm shadow-lg"
          >
            {filtered.map((opt, i) => {
              const active = i === activeIndex;
              const exact = opt.toLowerCase() === q;
              return (
                <li
                  key={opt}
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => {
                    // Use mousedown so it fires before input blur
                    e.preventDefault();
                    pick(opt);
                  }}
                  onMouseEnter={() => setRawIndex(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-1.5",
                    active
                      ? "bg-amber-500/15 text-amber-200"
                      : "text-slate-300 hover:bg-navy-800",
                  )}
                >
                  <span>{opt}</span>
                  {exact && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </li>
              );
            })}
          </ul>
        )}
        {open && filtered.length === 0 && q.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-500">
            No matches. Press Enter to keep &ldquo;{value}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
