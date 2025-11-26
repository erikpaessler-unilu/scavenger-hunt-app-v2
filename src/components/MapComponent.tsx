import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Lock, CheckCircle, Navigation, Loader } from 'lucide-react';
import { Map, Marker } from 'pigeon-maps';
import type { Location } from '../App';

interface MapComponentProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  onRequestLocation?: () => void;
  locationPermission?: 'prompt' | 'granted' | 'denied';
  isRequestingLocation?: boolean;
}

export function MapComponent({ 
  locations, 
  selectedLocationId, 
  onLocationSelect,
  userLocation,
  onRequestLocation,
  locationPermission = 'prompt',
  isRequestingLocation = false
}: MapComponentProps) {
  // Calculate bounds for all locations (including user location if available)
  const allPoints = userLocation 
    ? [...locations.map(loc => ({ lat: loc.lat, lng: loc.lng })), userLocation]
    : locations.map(loc => ({ lat: loc.lat, lng: loc.lng }));

  const bounds = allPoints.reduce(
    (acc, point) => ({
      minLat: Math.min(acc.minLat, point.lat),
      maxLat: Math.max(acc.maxLat, point.lat),
      minLng: Math.min(acc.minLng, point.lng),
      maxLng: Math.max(acc.maxLng, point.lng)
    }),
    {
      minLat: allPoints[0]?.lat || 0,
      maxLat: allPoints[0]?.lat || 0,
      minLng: allPoints[0]?.lng || 0,
      maxLng: allPoints[0]?.lng || 0
    }
  );

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const latRange = bounds.maxLat - bounds.minLat || 0.01;
  const lngRange = bounds.maxLng - bounds.minLng || 0.01;

  // Calculate zoom level to fit all markers
  const calculateZoom = () => {
    const maxRange = Math.max(latRange, lngRange);
    if (maxRange > 0.5) return 11;
    if (maxRange > 0.1) return 13;
    if (maxRange > 0.05) return 14;
    if (maxRange > 0.01) return 15;
    return 16;
  };

  const [center, setCenter] = useState<[number, number]>([centerLat, centerLng]);
  const [zoom, setZoom] = useState(calculateZoom());
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Update center when user location changes
  useEffect(() => {
    if (userLocation && locationPermission === 'granted') {
      setCenter([
        (userLocation.lat + centerLat) / 2,
        (userLocation.lng + centerLng) / 2
      ]);
    }
  }, [userLocation, locationPermission]);

  // Calculate distance between two points (in meters)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Custom marker component for locations
  const CustomMarker = ({ location, index }: { location: Location; index: number }) => {
    const isSelected = location.id === selectedLocationId;
    const isHovered = hoveredMarker === location.id;
    const distance = userLocation 
      ? calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng)
      : null;

    return (
      <div
        style={{
          position: 'relative',
          transform: 'translate(-50%, -100%)',
          cursor: location.unlocked ? 'pointer' : 'not-allowed'
        }}
        onMouseEnter={() => setHoveredMarker(location.id)}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        {/* Marker Pin */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (location.unlocked) {
              onLocationSelect(location.id);
            }
          }}
          style={{
            width: isSelected ? 48 : 40,
            height: isSelected ? 48 : 40,
            background: location.unlocked 
              ? (isSelected ? '#ea580c' : '#fb923c')
              : '#9ca3af',
            border: '4px solid white',
            borderRadius: '50% 50% 50% 0',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(-45deg) scale(${isHovered ? 1.1 : 1})`,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ transform: 'rotate(45deg)' }}>
            {location.unlocked ? (
              <MapPin style={{ width: 20, height: 20, color: 'white' }} />
            ) : (
              <Lock style={{ width: 20, height: 20, color: 'white' }} />
            )}
          </div>
        </div>

        {/* Number Badge */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid white',
            background: location.unlocked ? '#22c55e' : '#9ca3af',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transform: 'rotate(45deg)'
          }}
        >
          <span style={{ transform: 'rotate(-45deg)' }}>{index + 1}</span>
        </div>

        {/* Tooltip */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-8px)',
              background: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '2px solid #fed7aa',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {location.unlocked ? (
                <CheckCircle style={{ width: 16, height: 16, color: '#22c55e' }} />
              ) : (
                <Lock style={{ width: 16, height: 16, color: '#9ca3af' }} />
              )}
              <span style={{ color: '#ea580c', fontWeight: 600, fontSize: 14 }}>
                {location.name}
              </span>
            </div>
            {distance !== null && (
              <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0' }}>
                📍 {formatDistance(distance)} away
              </p>
            )}
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
              {location.unlocked ? 'Click to view clue' : 'Locked'}
            </p>
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #fed7aa'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // User location marker
  const UserMarker = () => {
    return (
      <div
        style={{
          position: 'relative',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Pulsing circle */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#3b82f6',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        {/* Center dot */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#3b82f6',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1
          }}
        />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-300"
    >
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Quest Map
          </h3>
          {onRequestLocation && locationPermission === 'prompt' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRequestLocation}
              disabled={isRequestingLocation}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
            >
              {isRequestingLocation ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Show My Location
                </>
              )}
            </motion.button>
          )}
          {locationPermission === 'granted' && userLocation && (
            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-lg">
              <Navigation className="w-4 h-4 text-blue-200" />
              Location Active
            </div>
          )}
        </div>
      </div>
      
      <div className="h-[500px] lg:h-[600px] relative">
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          defaultWidth={800}
          defaultHeight={600}
        >
          {/* User Location Marker */}
          {userLocation && locationPermission === 'granted' && (
            <Marker
              anchor={[userLocation.lat, userLocation.lng]}
              payload={{ type: 'user' }}
            >
              <UserMarker />
            </Marker>
          )}

          {/* Location Markers */}
          {locations.map((location, index) => (
            <Marker
              key={location.id}
              anchor={[location.lat, location.lng]}
              payload={location}
            >
              <CustomMarker location={location} index={index} />
            </Marker>
          ))}
        </Map>
      </div>

      {/* Legend */}
      <div className="p-4 bg-orange-50 border-t-2 border-orange-200">
        <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-400 rounded-full border-2 border-white shadow flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white shadow flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Locked</span>
            </div>
            {userLocation && locationPermission === 'granted' && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow" />
                <span className="text-gray-700">You</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">Powered by OpenStreetMap</p>
        </div>
      </div>
    </motion.div>
  );
}
