"use client";
import { useState } from "react";
import { Combobox } from "@/components/shared/combobox";
import { MultiCombobox } from "@/components/shared/multi-combobox";
import {
  COUNTRIES,
  ALL_CITIES,
  CITIES_BY_COUNTRY,
  getAirportsForLocation,
} from "@/lib/data/locations";

/**
 * Three linked fields for the Handlers form:
 *   1. Country  (alphabetical, free-text fallback)
 *   2. City     (filtered by country)
 *   3. Airports (multi-select chips, filtered by city/country)
 *
 * Submits via standard form input names: `country`, `city`, `airports`
 * (the airports field's hidden input is a comma-joined ICAO list, which
 * the existing server-side parseAirports() already understands).
 */
export function LocationFields({
  defaultCountry,
  defaultCity,
  defaultAirports,
}: {
  defaultCountry?: string;
  defaultCity?: string;
  defaultAirports?: string[];
}) {
  const [country, setCountry] = useState(defaultCountry ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  const [airports, setAirports] = useState<string[]>(defaultAirports ?? []);

  // City suggestions: country-specific if known, else all cities.
  const cityOptions =
    country && CITIES_BY_COUNTRY[country]
      ? CITIES_BY_COUNTRY[country]
      : ALL_CITIES;

  // Airport suggestions follow city (then country, then nothing).
  const airportOptions = getAirportsForLocation(city, country).map((a) => ({
    value: a.icao,
    label: a.name,
  }));

  return (
    <>
      <Combobox
        name="country"
        label="Country"
        options={COUNTRIES}
        value={country}
        onChange={setCountry}
        onSelect={(picked) => {
          // Clear city if it no longer fits the new country
          if (city && CITIES_BY_COUNTRY[picked]) {
            if (!CITIES_BY_COUNTRY[picked].includes(city)) {
              setCity("");
            }
          }
        }}
        placeholder="Cyprus"
      />
      <Combobox
        name="city"
        label="City"
        options={cityOptions}
        value={city}
        onChange={setCity}
        placeholder="Larnaca"
      />
      <MultiCombobox
        name="airports"
        label="Airports (ICAO)"
        values={airports}
        onChange={setAirports}
        options={airportOptions}
        placeholder={
          airportOptions.length > 0 ? "Pick or type ICAO..." : "Type ICAO..."
        }
        normalize={(raw) => {
          // Free-text ICAO entries: 4-char alphanumeric, uppercased.
          const upper = raw.trim().toUpperCase();
          return /^[A-Z0-9]{4}$/.test(upper) ? upper : null;
        }}
      />
    </>
  );
}
