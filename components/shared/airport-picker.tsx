"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_AIRPORTS, findAirport, type FullAirport } from "@/lib/data/locations";

type Props = {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
};

/**
 * Smart airport picker for the New Flight form.
 * Search across ICAO, airport name, city, and country. Pick from the dropdown
 * (sets the input to the 4-char ICAO and shows airport metadata as a hint),
 * or just type any 4-char ICAO that isn't in our curated list.
 *
 * Submits via standard <input name>; value is always a 4-char uppercase ICAO.
 */
export function AirportPicker({
  name,
  label,
  required,
  defaultValue,
  placeholder,
}: Props) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState((defaultValue ?? "").toUpperCase());
  const [query, setQuery] = useState((defaultValue ?? "").toUpperCase());
  const [open, setOpen] = useState(false);
  const [rawIndex, setRawIndex] = useState(0);

  const matched: FullAirport | null = findAirport(value);

  const q = query.trim().toLowerCase();
  const filtered: FullAirport[] = useMemo(() => {
    if (q.length === 0) return ALL_AIRPORTS.slice(0, 30); // small default set
    return ALL_AIRPORTS.filter((a) => {
      return (
        a.icao.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      );
    }).slice(0, 50);
  }, [q]);

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

  function pick(airport: FullAirport) {
    setValue(airport.icao);
    setQuery(airport.icao);
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
          value={query}
          placeholder={placeholder ?? "Type city, country, or ICAO..."}
          onChange={(e) => {
            const raw = e.target.value;
            setQuery(raw);
            // Only sync `value` if the typed text could be a valid 4-char ICAO
            // (otherwise the input shows the search query while the form value stays last-picked)
            const upper = raw.trim().toUpperCase();
            if (/^[A-Z0-9]{4}$/.test(upper)) {
              setValue(upper);
            } else {
              setValue(""); // invalidate until they pick or finish typing
            }
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          maxLength={60}
          className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 pr-9 font-mono text-sm uppercase outline-none focus:border-amber-500"
        />
        {value ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setValue("");
              setQuery("");
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
            className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-navy-700 bg-navy-900 py-1 text-sm shadow-lg"
          >
            {filtered.map((a, i) => {
              const active = i === activeIndex;
              return (
                <li
                  key={a.icao}
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(a);
                  }}
                  onMouseEnter={() => setRawIndex(i)}
                  className={cn(
                    "cursor-pointer px-3 py-1.5",
                    active ? "bg-amber-500/15" : "hover:bg-navy-800",
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        active ? "text-amber-300" : "text-amber-400",
                      )}
                    >
                      {a.icao}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        active ? "text-amber-200" : "text-slate-300",
                      )}
                    >
                      {a.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {a.city} · {a.country}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {open && filtered.length === 0 && q.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-500">
            No matches.{" "}
            {/^[A-Z0-9]{4}$/.test(query.trim().toUpperCase()) ? (
              <>
                Press Enter to use{" "}
                <span className="font-mono text-amber-400">
                  {query.trim().toUpperCase()}
                </span>
              </>
            ) : (
              "Type a 4-char ICAO to enter manually."
            )}
          </div>
        )}
      </div>
      {/* Hint line below the input — shows the matched airport for confirmation */}
      <div className="min-h-[14px] text-[11px] text-slate-500">
        {matched ? (
          <>
            <span className="text-slate-300">{matched.name}</span> ·{" "}
            <span>
              {matched.city}, {matched.country}
            </span>
          </>
        ) : value && /^[A-Z0-9]{4}$/.test(value) ? (
          <span className="text-slate-400">Custom ICAO (not in list)</span>
        ) : null}
      </div>
    </div>
  );
}
