import { createFlightAction } from "./actions";
import { AirportPicker } from "@/components/shared/airport-picker";

export default function NewFlightPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">New flight</h1>
      <form
        action={createFlightAction as unknown as (fd: FormData) => void}
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
            placeholder="Type city, country, or ICAO..."
          />
          <AirportPicker
            label="Destination"
            name="destIcao"
            required
            placeholder="Type city, country, or ICAO..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ETD (UTC)" name="etdUtc" type="datetime-local" required />
          <Field label="ETA (UTC)" name="etaUtc" type="datetime-local" required />
        </div>
        <Field label="PAX" name="pax" type="number" min={0} max={500} required />
        <Field
          label="Purpose (optional)"
          name="purpose"
          placeholder="Charter / VIP / Medical"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
        >
          Create flight
        </button>
      </form>
    </div>
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
