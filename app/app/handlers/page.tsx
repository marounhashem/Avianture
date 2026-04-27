import Link from "next/link";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createHandlerAction, updateHandlerAction } from "./actions";
import { LocationFields } from "@/components/handlers/location-fields";

export default async function HandlersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string }>;
}) {
  const user = await requireOperator();
  const { edit, error } = await searchParams;

  const handlers = await db.handler.findMany({
    where: { operatorId: user.operatorId },
    orderBy: { name: "asc" },
  });

  const errorText =
    error === "invalid-input"
      ? "Some fields were invalid. Check and try again."
      : error === "not-found"
        ? "That handler couldn't be found."
        : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Handlers</h1>

      {errorText && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {errorText}
        </div>
      )}

      {/* Create form */}
      <form
        action={createHandlerAction as unknown as (fd: FormData) => void}
        className="rounded-lg border border-navy-700 bg-navy-900 p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold text-slate-300">Add a handler</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <Field name="name" label="Name" required placeholder="LCLK FBO Larnaca" />
          <Field name="company" label="Company" placeholder="Cyprus Handling" />
          <Field name="email" label="Email" type="email" placeholder="ops@example.com" />
          {/* Country → City → Airports, all linked: city options filter by country, airport options filter by city */}
          <LocationFields />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
          >
            Add handler
          </button>
        </div>
      </form>

      {/* List */}
      <ul className="divide-y divide-navy-700 rounded-lg border border-navy-700 bg-navy-900">
        {handlers.length === 0 && (
          <li className="p-4 text-sm text-slate-500">No handlers yet.</li>
        )}
        {handlers.map((h) => {
          if (edit === h.id) {
            // Inline edit form
            return (
              <li key={h.id} className="p-4 space-y-3">
                <form
                  action={
                    updateHandlerAction as unknown as (fd: FormData) => void
                  }
                  className="space-y-3"
                >
                  <input type="hidden" name="id" value={h.id} />
                  <div className="grid gap-2 md:grid-cols-3">
                    <Field name="name" label="Name" required defaultValue={h.name} />
                    <Field
                      name="company"
                      label="Company"
                      defaultValue={h.company ?? ""}
                    />
                    <Field
                      name="email"
                      label="Email"
                      type="email"
                      defaultValue={h.email ?? ""}
                    />
                    <LocationFields
                      defaultCountry={h.country ?? ""}
                      defaultCity={h.city ?? ""}
                      defaultAirports={h.airports}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="rounded-md bg-amber-500 px-4 py-2 text-xs font-medium text-navy-950 hover:bg-amber-400"
                    >
                      Save
                    </button>
                    <Link
                      href="/app/handlers"
                      className="text-xs text-slate-400 hover:text-amber-400"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </li>
            );
          }

          // Read-only row
          return (
            <li key={h.id} className="p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium">{h.name}</span>
                    {h.company && (
                      <span className="text-xs text-slate-400">{h.company}</span>
                    )}
                  </div>
                  {(h.city || h.country) && (
                    <div className="text-xs text-slate-400">
                      {[h.city, h.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {h.airports.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {h.airports.map((code) => (
                        <span
                          key={code}
                          className="rounded font-mono text-[11px] bg-navy-800 px-1.5 py-0.5 text-amber-400"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {h.email && (
                    <span className="text-xs text-slate-400">{h.email}</span>
                  )}
                  <Link
                    href={`/app/handlers?edit=${h.id}`}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  type,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  // The id needs to be unique per instance because the same Field is rendered
  // multiple times on the page (create form + each edit form).
  const inputId = `field-${name}-${defaultValue ?? "new"}`;
  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-slate-400"
      >
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        id={inputId}
        name={name}
        type={type ?? "text"}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
        className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
      />
    </div>
  );
}
