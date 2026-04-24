import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Navigation, CheckCircle2, Clock, Leaf,
  Shield, Car, X, ExternalLink, Locate, AlertCircle,
  Route, ChevronRight, RefreshCw,
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import findparkgo from '../../components/images/findparkgo.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface LatLng { lat: number; lng: number; }

interface Carpark {
  carparkNumber: string;
  area: string;
  development: string;
  location: LatLng;
  availableLots: number;
  lotType: string;
  agencyCode: string;
  fetchedAt: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const makeIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = makeIcon('red');
const userIcon = makeIcon('blue');
const greenIcon = makeIcon('green');
const yellowIcon = makeIcon('gold');
const redIcon = makeIcon('red');

const getCarparkIcon = (lots: number) =>
  lots > 20 ? greenIcon : lots > 0 ? yellowIcon : redIcon;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function getStatusLabel(lots: number) {
  if (lots > 20) return { label: 'Available', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
  if (lots > 0) return { label: 'Limited', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
  return { label: 'Full', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points.map(p => [p.lat, p.lng])), { padding: [60, 60] });
    }
  }, [points, map]);
  return null;
}

// ─── Navigation Modal ─────────────────────────────────────────────────────────

function NavigationModal({
  carpark,
  allCarparks,
  onClose,
}: {
  carpark: Carpark;
  allCarparks: Carpark[];
  onClose: () => void;
}) {
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);

  const nearbyCarparks = allCarparks.filter(cp =>
    cp.carparkNumber !== carpark.carparkNumber &&
    haversineKm(carpark.location, cp.location) <= 1.5
  );

  const fetchRoute = async (from: LatLng, to: LatLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.[0]) {
        setRoutePoints(
          data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }))
        );
      }
    } catch {
      setRoutePoints([from, to]);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setLocating(false);
        fetchRoute(p, carpark.location);
      },
      (err) => {
        setGeoError(`Location access denied: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const distanceKm = userPos ? haversineKm(userPos, carpark.location) : null;
  const estMinutes = distanceKm ? Math.round((distanceKm / 30) * 60) : null;
  const availableNearby = nearbyCarparks.filter(c => c.availableLots > 0).length;

  const openGoogleMaps = () => {
    const dest = `${carpark.location.lat},${carpark.location.lng}`;
    const base = 'https://www.google.com/maps/dir/?api=1';
    const url = userPos
      ? `${base}&origin=${userPos.lat},${userPos.lng}&destination=${dest}&travelmode=driving`
      : `${base}&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const Map = MapContainer as any;
  const MapTile = TileLayer as any;
  const MapMarker = Marker as any;
  const MapPolyline = Polyline as any;
  const MapTooltip = Tooltip as any;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      >
        {/* Header */}
        <div className="bg-[#660000] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Route size={18} className="text-white/80" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Navigate To</p>
              <p className="text-white font-black text-base leading-tight">{carpark.development}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition p-1">
            <X size={20} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="bg-[#7a0000] px-5 py-2 flex items-center gap-4 text-white text-xs flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <strong>{availableNearby}</strong> of <strong>{nearbyCarparks.length}</strong> nearby carparks available
          </span>
          {distanceKm && (
            <>
              <span className="text-white/40">|</span>
              <span>📍 {distanceKm.toFixed(1)} km · ~{estMinutes} min by car</span>
            </>
          )}
        </div>

        {/* Map */}
        <div className="w-full h-[320px] relative">
          {locating && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-3 z-10">
              <Locate size={28} className="text-[#660000] animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Detecting your location…</p>
            </div>
          )}

          {geoError && !locating && (
            <div className="absolute inset-0 bg-amber-50 flex flex-col items-center justify-center gap-2 z-10 px-6 text-center">
              <AlertCircle size={28} className="text-amber-500" />
              <p className="text-xs font-bold text-gray-700">Location access was denied</p>
              <p className="text-[10px] text-gray-500">Enable location in browser settings, or use Google Maps below.</p>
            </div>
          )}

          {!locating && (
            <Map
              center={[carpark.location.lat, carpark.location.lng]}
              zoom={15}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <MapTile attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Destination */}
              <MapMarker position={[carpark.location.lat, carpark.location.lng]} icon={destinationIcon}>
                <MapTooltip permanent direction="top" offset={[0, -10]}>
                  <span className="text-xs font-bold">🅿 {carpark.development}</span>
                </MapTooltip>
              </MapMarker>

              {/* User */}
              {userPos && (
                <MapMarker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                  <MapTooltip permanent direction="top" offset={[0, -10]}>
                    <span className="text-xs font-bold">📍 You</span>
                  </MapTooltip>
                </MapMarker>
              )}

              {/* Route */}
              {userPos && routePoints.length > 0 && (
                <MapPolyline
                  positions={routePoints.map(p => [p.lat, p.lng])}
                  color="#660000" weight={5} opacity={0.85} dashArray="10,5"
                />
              )}

              {/* Nearby carparks */}
              {nearbyCarparks.map((cp, i) => (
                <MapMarker
                  key={`${cp.carparkNumber}-${i}`}
                  position={[cp.location.lat, cp.location.lng]}
                  icon={getCarparkIcon(cp.availableLots)}
                >
                  <MapTooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="text-xs space-y-1 min-w-[160px]">
                      <p className="font-bold text-gray-800">{cp.development}</p>
                      <p className={cp.availableLots > 20 ? 'text-green-700 font-bold' : cp.availableLots > 0 ? 'text-yellow-600 font-bold' : 'text-red-600 font-bold'}>
                        {cp.availableLots > 0 ? `${cp.availableLots} slots available` : 'Full'}
                      </p>
                      <p className="text-gray-400">{haversineKm(carpark.location, cp.location).toFixed(2)} km away</p>
                    </div>
                  </MapTooltip>
                </MapMarker>
              ))}

              {userPos && <FitBounds points={[userPos, carpark.location]} />}
            </Map>
          )}
        </div>

        {/* Info */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
          <MapPin size={13} className="text-[#660000]" />
          {carpark.area} · Carpark {carpark.carparkNumber} · Type: {carpark.lotType}
        </div>

        {/* Legend */}
        <div className="px-5 py-2 flex items-center gap-4 text-[10px] text-gray-400 font-semibold uppercase tracking-widest border-t border-gray-100 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />You</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />Destination</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />Limited</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Full</span>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-3 flex gap-3">
          <button
            onClick={openGoogleMaps}
            className="flex-1 flex items-center justify-center gap-2 bg-[#660000] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#7a0000] transition"
          >
            <ExternalLink size={14} />
            Open in Google Maps
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition flex items-center gap-1"
          >
            Close <ChevronRight size={13} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FacilityDetails() {
  const { id } = useParams();
  const [carpark, setCarpark] = useState<Carpark | null>(null);
  const [allCarparks, setAllCarparks] = useState<Carpark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parking/availability`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const all: Carpark[] = data.data ?? [];
      setAllCarparks(all);
      const found = all.find(cp => cp.carparkNumber === id);
      if (found) {
        setCarpark(found);
        setLastUpdated(new Date(found.fetchedAt).toLocaleTimeString());
      } else {
        setError(`Carpark "${id}" not found in live data.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [id]);

  const status = carpark ? getStatusLabel(carpark.availableLots) : null;

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#660000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading facility data…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !carpark) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <AlertCircle size={40} className="text-red-500 mx-auto" />
          <p className="font-bold text-gray-800">Could not load facility</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchData}
            className="bg-[#660000] text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#7a0000] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main ──
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-24 max-w-[1800px] mx-auto min-h-screen bg-[#f9fafb]">

      {/* Hero */}
      <div className="mb-12">
        <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-xl">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${findparkgo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'bgMove 20s ease-in-out infinite alternate',
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 h-full flex items-center px-6 sm:px-10 text-white">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">Park 'n Spot Facility Details</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mt-2">
                WHERE EVERY SPACE BECOMES A MOMENT OF CONVENIENCE
              </h1>
              <p className="text-white/70 mt-4 text-sm sm:text-base max-w-xl">
                Real-time parking insights and smart infrastructure details.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3">
          Parking Facilities / <span className="text-[#660000]">Carpark {id}</span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              {carpark.development}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{carpark.area} · Type: {carpark.lotType} · Agency: {carpark.agencyCode}</p>
          </div>

          {/* Live badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${status!.bg} ${status!.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse inline-block" />
            {status!.label} · Updated {lastUpdated}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowNav(true)}
            className="bg-[#660000] text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#7a0000] transition flex items-center gap-2"
          >
            <Navigation size={14} />
            Navigate
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition border ${saved ? 'bg-[#660000] text-white border-[#660000]' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            {saved ? 'Saved ✓' : '★ Save'}
          </button>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <Shield className="text-[#660000] mb-3" />
          <h3 className="font-bold">Security Network</h3>
          <p className="text-sm text-gray-500 mt-1">24/7 CCTV coverage across parking zones.</p>
        </div>
        <div className="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <Car className="text-[#660000] mb-3" />
          <h3 className="font-bold">Smart Allocation</h3>
          <p className="text-sm text-gray-500 mt-1">Real-time parking distribution system.</p>
        </div>
        <div className="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <Leaf className="text-green-600 mb-3" />
          <h3 className="font-bold">Eco Efficiency</h3>
          <p className="text-sm text-gray-500 mt-1">Reduced idle time and emissions.</p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Live Availability */}
        <div className="lg:col-span-4 bg-white border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-[#660000]" />
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-8">Live Availability</h3>
          <div className={`text-6xl font-black ${status!.color}`}>
            {carpark.availableLots}
          </div>
          <p className="text-gray-500 font-semibold mt-2 text-sm">Available Slots</p>
          <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs font-bold border ${status!.bg} ${status!.color}`}>
            <CheckCircle2 size={14} />
            {status!.label}
          </div>
          <p className="text-[10px] text-gray-400 mt-4">Last updated: {lastUpdated}</p>
        </div>

        {/* Usage Overview — visual bar chart */}
        <div className="lg:col-span-8 bg-white border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Parking Usage Overview</h3>
          <div className="flex items-end gap-1 h-[260px]">
            {[20, 35, 60, 85, 95, 80, 50, 40, 65, 75, 45, 25].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#660000]/10 hover:bg-[#660000] transition rounded-t-sm cursor-pointer"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
            {['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="lg:col-span-5 bg-white border rounded-2xl p-6">
          <h3 className="font-bold mb-5">Peak Hours</h3>
          <div className="space-y-5">
            <div className="flex gap-3">
              <Clock className="text-[#660000]" />
              <div>
                <p className="font-bold">Morning (8am – 10am)</p>
                <p className="text-sm text-gray-500">Higher parking demand</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Leaf className="text-green-600" />
              <div>
                <p className="font-bold">Off Peak (2pm – 4pm)</p>
                <p className="text-sm text-gray-500">Better availability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map thumbnail */}
        <div className="lg:col-span-7 bg-white border rounded-2xl overflow-hidden">
          <div className="w-full h-[260px]">
            <MapContainer
              center={[carpark.location.lat, carpark.location.lng]}
              zoom={16}
              scrollWheelZoom={false}
              zoomControl={false}
              className="w-full h-full"
              dragging={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[carpark.location.lat, carpark.location.lng]}
                icon={destinationIcon}
              />
            </MapContainer>
          </div>
          <div className="bg-[#660000] text-white p-4 flex items-center gap-2 text-sm">
            <MapPin size={14} />
            {carpark.area} · Carpark {carpark.carparkNumber}
          </div>
        </div>

      </div>

      {/* Facility Visuals */}
      <div className="mt-12">
        <h2 className="text-lg font-bold mb-4">Facility Visuals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <img className="rounded-xl h-32 w-full object-cover" src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800" alt="" />
          <img className="rounded-xl h-32 w-full object-cover" src="https://images.unsplash.com/photo-1494526585095-c41746248156?w=800" alt="" />
          <img className="rounded-xl h-32 w-full object-cover" src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800" alt="" />
          <img className="rounded-xl h-32 w-full object-cover" src="https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800" alt="" />
        </div>
      </div>

      {/* Navigation Modal */}
      <AnimatePresence>
        {showNav && (
          <NavigationModal
            carpark={carpark}
            allCarparks={allCarparks}
            onClose={() => setShowNav(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bgMove {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}