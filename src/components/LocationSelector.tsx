/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { getCurrentPosition } from "@/lib/geolocation/getLocation";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";

type Location = {
  country: string;
  state: string;
  city: string;
  countryCode?: string;
  stateCode?: string;
};

export default function LocationSelector({
  onLocationSet,
}: {
  onLocationSet: (location: Location) => void;
}) {
  const [manualMode, setManualMode] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [detecting, setDetecting] = useState(true);
  const [step, setStep] = useState(1);

  const [location, setLocation] = useState<Location>({
    country: "",
    state: "",
    city: "",
  });

  // Auto-detect on mount
  useEffect(() => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      onLocationSet(JSON.parse(stored));
      return;
    }

    const detectLocation = async () => {
      const position = await getCurrentPosition();

      if (!position) {
        setDetecting(false);
        setManualMode(true);
        return;
      }

      const { latitude, longitude } = position.coords;

      try {
        // Use Nominatim just to get ISO codes
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const geo = await res.json();

        // Map into CSC dataset
        const country = Country.getAllCountries().find(
          (c) =>
            c.isoCode === geo.address.country_code?.toUpperCase() ||
            c.name.toLowerCase() === geo.address.country?.toLowerCase()
        );

        let state: IState | undefined;
        let city: ICity | undefined;

        if (country) {
          state = State.getStatesOfCountry(country.isoCode).find(
            (s) =>
              s.name.toLowerCase() === geo.address.state?.toLowerCase() ||
              s.name.toLowerCase() === geo.address.region?.toLowerCase()
          );

          if (state) {
            city = City.getCitiesOfState(country.isoCode, state.isoCode).find((c) =>
              [
                geo.address.city,
                geo.address.town,
                geo.address.village,
                geo.address.county,
              ]
                .filter(Boolean)
                .map((n: string) => n.toLowerCase())
                .includes(c.name.toLowerCase())
            );
          }
        }

        const detected: Location = {
          country: country?.name || geo.address.country || "",
          state: state?.name || geo.address.state || "",
          city:
            city?.name ||
            geo.address.city ||
            geo.address.town ||
            geo.address.village ||
            geo.address.county ||
            "",
          countryCode: country?.isoCode,
          stateCode: state?.isoCode,
        };

        localStorage.setItem("user_location", JSON.stringify(detected));
        onLocationSet(detected);
      } catch (err) {
        console.error("Geocoding failed:", err);
        setDetecting(false);
        setManualMode(true);
      }
    };

    detectLocation();
  }, [onLocationSet]);

  // Load countries from CSC
  useEffect(() => {
    if (!manualMode) return;
    setCountries(Country.getAllCountries());
  }, [manualMode]);

  // Load states when country changes
  useEffect(() => {
    if (!location.country) return;
    const country = countries.find((c) => c.name === location.country);
    if (!country) return;

    const allStates = State.getStatesOfCountry(country.isoCode);
    setStates(allStates);
    setStep(2);
  }, [location.country, countries]);

  // Load cities when state changes
  useEffect(() => {
    if (!location.state || !location.country) return;
    const country = countries.find((c) => c.name === location.country);
    const state = states.find((s) => s.name === location.state);
    if (!country || !state) return;

    const allCities = City.getCitiesOfState(country.isoCode, state.isoCode);
    setCities(allCities);
    setStep(3);
  }, [location.state, location.country, countries, states]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocation((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" ? { state: "", city: "" } : {}),
      ...(name === "state" ? { city: "" } : {}),
    }));

    if (name === "country" && value) {
      setStep(2);
    } else if (name === "state" && value) {
      setStep(3);
    }
  };

  const handleConfirm = () => {
    localStorage.setItem("user_location", JSON.stringify(location));
    onLocationSet(location);
  };

  const handleManualMode = () => {
    setDetecting(false);
    setManualMode(true);
  };

  // --- UI stays same as before ---
  if (detecting) {
    return (
      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-sky-200 max-w-md w-full animate-fadeIn">
        {/* detecting animation UI (same as your previous code) */}
        <div className="text-center space-y-6">
          <h3 className="text-xl font-bold text-sky-700">Detecting your location...</h3>
          <button
            onClick={handleManualMode}
            className="text-sm text-sky-600 hover:text-sky-800 transition-colors font-medium hover:underline"
          >
            Enter manually instead
          </button>
        </div>
      </div>
    );
  }

  if (!manualMode) return null;

  return (
    <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-sky-200 max-w-lg w-full animate-fadeIn">
      <h2 className="text-2xl font-bold text-sky-700 mb-4">Set Your Location</h2>

      <div className="space-y-6">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="country"
            value={location.country}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            name="state"
            value={location.state}
            onChange={handleChange}
            disabled={!location.country}
            className="w-full border px-4 py-2 rounded disabled:bg-gray-100"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            name="city"
            value={location.city}
            onChange={handleChange}
            disabled={!location.state}
            className="w-full border px-4 py-2 rounded disabled:bg-gray-100"
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={!location.country || !location.state || !location.city}
          onClick={handleConfirm}
          className="w-full bg-sky-600 text-white px-6 py-3 rounded hover:bg-sky-700 disabled:opacity-50"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
