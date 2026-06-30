import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A dependency-free location picker. Rather than pulling in a heavy map
 * SDK (Leaflet/Google Maps) purely for a pin-drop, this component offers
 * geolocation capture (via the browser's Geolocation API) plus manual
 * lat/lng entry, with a simple visual crosshair preview. This keeps the
 * bundle small and works without an API key; swapping in a full
 * interactive map tile provider later only means replacing this one
 * component, since the parent form only cares about the {lat, lng} value.
 */
export default function MapLocationPicker({ value, onChange }) {
  const { t } = useTranslation();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not available on this device.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setError('Could not get your location. You can enter it manually below.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded border border-sand-light bg-teal-50 dark:border-teal-600 dark:bg-teal-700/40">
        <svg width="100%" height="100%" className="absolute inset-0 opacity-30" aria-hidden="true">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-teal-300" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {value ? (
          <div className="relative z-10 flex flex-col items-center gap-1 text-teal-500 dark:text-teal-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span className="font-mono text-xs">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </span>
          </div>
        ) : (
          <span className="relative z-10 text-sm text-sand">{t('complaint.pinOnMap')}</span>
        )}
      </div>

      <button type="button" onClick={useCurrentLocation} disabled={locating} className="btn-secondary w-full text-sm">
        {locating ? t('common.loading') : t('complaint.pinOnMap')}
      </button>

      {error && <p className="text-xs text-rust-500">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-eyebrow" htmlFor="lat-input">Latitude</label>
          <input
            id="lat-input"
            type="number"
            step="0.000001"
            className="input-field mt-1"
            value={value?.lat ?? ''}
            onChange={(e) => onChange({ lat: parseFloat(e.target.value), lng: value?.lng ?? 0 })}
          />
        </div>
        <div>
          <label className="label-eyebrow" htmlFor="lng-input">Longitude</label>
          <input
            id="lng-input"
            type="number"
            step="0.000001"
            className="input-field mt-1"
            value={value?.lng ?? ''}
            onChange={(e) => onChange({ lat: value?.lat ?? 0, lng: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
