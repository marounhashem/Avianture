"use client";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { createFlightAction } from "@/app/app/flights/new/actions";

// Initial state for useActionState lives here (not in actions.ts), because
// files with `"use server"` can only export async functions.
const initialState: { error: string | null } = { error: null };
import { AirportPicker } from "@/components/shared/airport-picker";
import { getTimezoneForIcao, findAirport } from "@/lib/data/locations";

/**
 * Parses a `<input type="datetime-local">` value as UTC.
 * Browser gives us "2026-04-29T13:30" — JS would parse that as local time
 * by default, so we explicitly construct a UTC instant.
 */
function parseAsUtc(value: string): Date | null {
  if (!value) return null;
  // Tolerate "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const ts = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s ?? 0),
  );
  return new Date(ts);
}

function formatInZone(d: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "2-digit",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "shortOffset",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60_000);
  if (totalMin <= 0) return "—";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function NewFlightForm() {
  const [originIcao, setOriginIcao] = useState("");
  const [destIcao, setDestIcao] = useState("");
  const [etdUtc, setEtdUtc] = useState("");
  const [etaUtc, setEtaUtc] = useState("");
  const [state, formAction] = useActionState(
    createFlightAction,
    initialState,
  );

  const originTz = getTimezoneForIcao(originIcao);
  const destTz = getTimezoneForIcao(destIcao);
  const originAirport = findAirport(originIcao);
  const destAirport = findAirport(destIcao);

  const etdDate = useMemo(() => parseAsUtc(etdUtc), [etdUtc]);
  const etaDate = useMemo(() => parseAsUtc(etaUtc), [etaUtc]);

  const etaBeforeEtd =
    etdDate !== null &&
    etaDate !== null &&
    etaDate.getTime() <= etdDate.getTime();

  const duration =
    etdDate && etaDate && etaDate > etdDate
      ? formatDuration(etaDate.getTime() - etdDate.getTime())
      : null;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-navy-700 bg-navy-900 p-6"
    >
      <Field
        label="Tail number"
        name="tailNumber"
        placeholder="A6-AVN"
        required
        mono
      />
      <Field
        label="Aircraft type"
        name="aircraftType"
        placeholder="Gulfstream G650"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AirportPicker
          label="Origin"
          name="originIcao"
          required
          onChange={setOriginIcao}
          placeholder="City or ICAO..."
        />
        <AirportPicker
          label="Destination"
          name="destIcao"
          required
          onChange={setDestIcao}
          placeholder="City or ICAO..."
        />
      </div>

      {/* Times */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TimeField
            label="ETD (UTC)"
            name="etdUtc"
            required
            value={etdUtc}
            onChange={setEtdUtc}
            localPreview={
              etdDate && originIcao
                ? `${formatInZone(etdDate, originTz)} (${originAirport?.city ?? originIcao})`
                : null
            }
          />
          <TimeField
            label="ETA (UTC)"
            name="etaUtc"
            required
            value={etaUtc}
            onChange={setEtaUtc}
            min={etdUtc || undefined}
            error={etaBeforeEtd ? "ETA must be after ETD (UTC)." : undefined}
            localPreview={
              etaDate && destIcao
                ? `${formatInZone(etaDate, destTz)} (${destAirport?.city ?? destIcao})`
                : null
            }
          />
        </div>

        {/* Centered duration row, only when both times are valid + ETA > ETD */}
        {duration && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-navy-700" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-medium text-amber-300">
              <ArrowRight className="h-3 w-3" />
              Flight time {duration}
            </span>
            <span className="h-px flex-1 bg-navy-700" />
          </div>
        )}
      </div>

      <Field label="PAX" name="pax" type="number" min={0} max={500} required />
      <Field
        label="Purpose (optional)"
        name="purpose"
        placeholder="Charter / VIP / Medical"
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          {state.error}
        </p>
      )}

      <SubmitButton disabledReason={etaBeforeEtd} />
    </form>
  );
}

function SubmitButton({ disabledReason }: { disabledReason: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabledReason || pending}
      className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create flight"}
    </button>
  );
}

function Field({
  label,
  name,
  mono,
  ...rest
}: {
  label: string;
  name: string;
  mono?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-medium text-slate-400"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500 ${mono ? "font-mono" : ""}`}
        {...rest}
      />
    </div>
  );
}

function TimeField({
  label,
  name,
  required,
  value,
  onChange,
  min,
  localPreview,
  error,
}: {
  label: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (next: string) => void;
  min?: string;
  localPreview?: string | null;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-medium text-slate-400"
      >
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="datetime-local"
        required={required}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
      />
      <div className="min-h-[14px] mt-1 text-[11px]">
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : localPreview ? (
          <span className="text-slate-500">{localPreview}</span>
        ) : null}
      </div>
    </div>
  );
}
