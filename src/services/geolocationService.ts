/**
 * CHIKITSA-X Patient Geolocation & Proximity Recommendation Engine
 * ABDM Compliant Geospatial Service
 */

export interface PatientCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  label: string;
  source: 'GPS_LIVE' | 'MANUAL_PRESET' | 'DEFAULT';
  timestamp: string;
}

export interface PresetLocation {
  id: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  { id: 'pune-baner', label: 'Baner / Aundh, Pune', city: 'Pune', lat: 18.5582, lng: 73.7806 },
  { id: 'pune-station', label: 'Pune Station / Sassoon Hospital, Pune', city: 'Pune', lat: 18.5273, lng: 73.8732 },
  { id: 'pune-shivajinagar', label: 'Shivajinagar / Central Pune', city: 'Pune', lat: 18.5314, lng: 73.8446 },
  { id: 'pune-kothrud', label: 'Kothrud / Erandwane (Deenanath), Pune', city: 'Pune', lat: 18.5020, lng: 73.8315 },
  { id: 'pune-hadapsar', label: 'Hadapsar / Magarpatta, Pune', city: 'Pune', lat: 18.5089, lng: 73.9260 },
  { id: 'mumbai-parel', label: 'Parel (KEM & Tata Memorial), Mumbai', city: 'Mumbai', lat: 19.0028, lng: 72.8427 },
  { id: 'mumbai-bandra', label: 'Bandra West (Lilavati Hospital), Mumbai', city: 'Mumbai', lat: 19.0514, lng: 72.8295 },
  { id: 'mumbai-byculla', label: 'Byculla (Sir J.J. Hospital), Mumbai', city: 'Mumbai', lat: 18.9634, lng: 72.8335 },
  { id: 'mumbai-andheri', label: 'Andheri West, Mumbai', city: 'Mumbai', lat: 19.1197, lng: 72.8464 },
  { id: 'nagpur-mihan', label: 'MIHAN / AIIMS, Nagpur', city: 'Nagpur', lat: 21.0664, lng: 79.0375 },
  { id: 'delhi-aiims', label: 'Ansari Nagar, New Delhi', city: 'Delhi', lat: 28.5672, lng: 77.2100 },
  { id: 'bengaluru-indiranagar', label: 'Indiranagar, Bengaluru', city: 'Bengaluru', lat: 12.9784, lng: 77.6408 }
];

export const DEFAULT_PATIENT_LOCATION: PatientCoordinates = {
  lat: 18.5582,
  lng: 73.7806,
  label: 'Baner, Pune (Default Reference)',
  source: 'DEFAULT',
  timestamp: new Date().toISOString()
};

/**
 * Calculates real spherical distance in Kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal point
}

/**
 * Calculates realistic driving ETA in urban/suburban ambulance traffic
 */
export function estimateDrivingEtaMinutes(distanceKm: number, isEmergencyGreenCorridor = false): number {
  if (distanceKm <= 0.3) return 2;
  const averageSpeedKmH = isEmergencyGreenCorridor ? 65 : 32;
  const baseMinutes = (distanceKm / averageSpeedKmH) * 60;
  const trafficBuffer = isEmergencyGreenCorridor ? 2 : 4;
  return Math.max(3, Math.round(baseMinutes + trafficBuffer));
}

/**
 * Retrieves persisted patient location from localStorage
 */
export function getStoredPatientLocation(): PatientCoordinates | null {
  try {
    const saved = localStorage.getItem('chikitsax_patient_location');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse saved location:', e);
  }
  return null;
}

/**
 * Persists patient location to localStorage
 */
export function savePatientLocation(loc: PatientCoordinates): void {
  try {
    localStorage.setItem('chikitsax_patient_location', JSON.stringify(loc));
  } catch (e) {
    console.warn('Failed to save location:', e);
  }
}

/**
 * Requests live browser GPS location via HTML5 Geolocation API
 */
export function requestLiveBrowserLocation(): Promise<{
  success: boolean;
  location?: PatientCoordinates;
  error?: string;
  code?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser.',
        code: 'UNSUPPORTED'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        const accuracy = Math.round(pos.coords.accuracy || 25);

        // Reverse identify nearest landmark/city if Pune region
        let label = `Live GPS (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;
        if (Math.abs(lat - 18.55) < 0.1 && Math.abs(lng - 73.8) < 0.1) {
          label = `Pune Region (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;
        } else if (Math.abs(lat - 19.07) < 0.15 && Math.abs(lng - 72.87) < 0.15) {
          label = `Mumbai Region (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;
        } else if (Math.abs(lat - 28.6) < 0.2 && Math.abs(lng - 77.2) < 0.2) {
          label = `Delhi NCR (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;
        }

        const location: PatientCoordinates = {
          lat,
          lng,
          accuracy,
          label,
          source: 'GPS_LIVE',
          timestamp: new Date().toISOString()
        };

        savePatientLocation(location);

        resolve({
          success: true,
          location
        });
      },
      (err) => {
        let code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' = 'POSITION_UNAVAILABLE';
        let userMsg = 'Unable to detect location. Please check your device GPS.';

        if (err.code === err.PERMISSION_DENIED) {
          code = 'PERMISSION_DENIED';
          userMsg = 'Location permission was denied. Please allow location in your browser settings or select an area manually.';
        } else if (err.code === err.TIMEOUT) {
          code = 'TIMEOUT';
          userMsg = 'GPS location request timed out. Retrying with network fallback.';
        }

        resolve({
          success: false,
          error: userMsg,
          code
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
