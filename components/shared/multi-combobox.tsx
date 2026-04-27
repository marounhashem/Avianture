"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label?: string };

type Props = {
  /** Submitted as a comma-joined list under this name. */
  name: string;
  label: string;
  /** Selected items (controlled). */
  values: string[];
  onChange: (next: string[]) => void;
  /** Suggestion list (filtered by free typing). `value` submits; `label` is shown next to it. */
  options: Option[];
  placeholder?: string;
  required?: boolean;
  /** Validates a free-typed token before adding (default: any non-empty trimmed string). */
  normalize?: (raw: string) => string | null;
};

/**
 * Multi-select chip-input combobox. Type to filter suggestions, click or
 * press Enter to add. Comma / Enter on free-typed text adds it as a chip.
 * Backspace on empty input removes the last chip. Submits its value list
 * via a hidden input as a comma-joined string.
 */
export function MultiCombobox({
  name,
  label,
  values,
  onChange,
  options,
  placeholder,
  required,
  normalize,
}: Props) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rawIndex, setRawIndex] = useState(0);

  const valueSet = new Set(values);
  const q = query.trim().toLowerCase();
  const filtered = options.filter((o) => {
    if (valueSet.has(o.value)) return false; // hide already-selected
    if (q.length === 0) return true;
    return (
      o.value.toLowerCase().includes(q) ||
      (o.label?.toLowerCase().includes(q) ?? false)
    );
  });

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

  function add(value: string) {
    if (!value) return;
    if (valueSet.has(value)) return;
    onChange([...values, value]);
    setQuery("");
    setRawIndex(0);
    inputRef.current?.focus();
  }

  function remove(value: string) {
    onChange(values.filter((v) => v !== value));
    inputRef.current?.focus();
  }

  function commitTyped() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const normalized = normalize ? normalize(trimmed) : trimmed;
    if (!normalized) {
      // Invalid free-text token — leave query so user can fix it
      return;
    }
    add(normalized);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Backspace" && query.length === 0 && values.length > 0) {
      e.preventDefault();
      remove(values[values.length - 1]);
      return;
    }
    if (!open) {
      if (e.key === "ArrowDown") {
        setOpen(true);
        e.preventDefault();
      }
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        commitTyped();
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
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        add(filtered[activeIndex].value);
      } else {
        commitTyped();
      }
    } else if (e.key === ",") {
      e.preventDefault();
      commitTyped();
    }
  }

  return (
    <div className="space-y-1" ref={wrapperRef}>
      <label htmlFor={id} className="block text-xs font-medium text-slate-400">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <div
        className={cn(
          "relative flex flex-wrap items-center gap-1.5 rounded-md border border-navy-700 bg-navy-950 px-2 py-1.5 min-h-[38px]",
          "focus-within:border-amber-500",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Chips */}
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded bg-navy-800 px-1.5 py-0.5 font-mono text-xs text-amber-400"
          >
            {v}
            <button
              type="button"
              tabIndex={-1}
              aria-label={`Remove ${v}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(v);
              }}
              className="rounded p-0.5 text-amber-400/60 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {/* Live input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          placeholder={values.length === 0 ? placeholder : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-500 transition-transform",
            open && "rotate-180",
          )}
        />
        {/* Hidden form value */}
        <input type="hidden" name={name} value={values.join(",")} />

        {/* Dropdown */}
        {open && (filtered.length > 0 || (q.length > 0 && normalize)) && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute left-0 top-full z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-navy-700 bg-navy-900 py-1 text-sm shadow-lg"
          >
            {filtered.map((opt, i) => {
              const active = i === activeIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(opt.value);
                  }}
                  onMouseEnter={() => setRawIndex(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-1.5",
                    active
                      ? "bg-amber-500/15 text-amber-200"
                      : "text-slate-300 hover:bg-navy-800",
                  )}
                >
                  <span className="font-mono text-amber-400">{opt.value}</span>
                  {opt.label && (
                    <span className="text-xs text-slate-400 truncate">
                      · {opt.label}
                    </span>
                  )}
                </li>
              );
            })}
            {q.length > 0 && filtered.length === 0 && (
              <li
                className="flex cursor-pointer items-center justify-between px-3 py-1.5 text-slate-300 hover:bg-navy-800"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitTyped();
                }}
              >
                <span>
                  Add{" "}
                  <span className="font-mono text-amber-400">
                    {query.trim().toUpperCase()}
                  </span>
                </span>
                <Check className="h-3.5 w-3.5 text-amber-400" />
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
