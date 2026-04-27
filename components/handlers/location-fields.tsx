"use client";
import { useState } from "react";
import { Combobox } from "@/components/shared/combobox";
import {
  COUNTRIES,
  ALL_CITIES,
  CITIES_BY_COUNTRY,
} from "@/lib/data/locations";

/**
 * Two linked comboboxes for the Handlers form:
 *   - Country (alphabetical, selectable from list or free text)
 *   - City    (filtered alphabetically by selected country, or all cities
 *             when no recognized country is selected)
 *
 * Both write their values into the parent <form> via standard input names
 * `country` and `city` respectively.
 */
export function LocationFields({
  defaultCountry,
  defaultCity,
}: {
  defaultCountry?: string;
  defaultCity?: string;
}) {
  const [country, setCountry] = useState(defaultCountry ?? "");
  const [city, setCity] = useState(defaultCity ?? "");

  // Cities to suggest:
  // - exact country match in our map → use those (alphabetical, curated)
  // - otherwise → fall back to all known cities so user still gets type-ahead
  const cityOptions =
    country && CITIES_BY_COUNTRY[country]
      ? CITIES_BY_COUNTRY[country]
      : ALL_CITIES;

  return (
    <>
      <Combobox
        name="country"
        label="Country"
        options={COUNTRIES}
        value={country}
        onChange={setCountry}
        onSelect={(picked) => {
          // When user picks a country, clear city if it's no longer in the
          // new country's list — saves them from a stale combo.
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
    </>
  );
}
