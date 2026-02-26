import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue in some bundlers (use ES imports instead of require)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const ClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    }
  });
  return null;
};

const MapPicker = ({ latitude, longitude, radius = 15, onChange }) => {
  const center = latitude && longitude ? [latitude, longitude] : [20, 77];

  useEffect(() => {
    // no-op
  }, [latitude, longitude]);

  return (
    <div className="w-full h-80 rounded overflow-hidden border">
      <MapContainer center={center} zoom={latitude && longitude ? 18 : 5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onClick={(latlng) => onChange && onChange({ latitude: latlng.lat, longitude: latlng.lng })} />
        {latitude && longitude && (
          <>
            <Marker position={[latitude, longitude]} />
            <Circle center={[latitude, longitude]} radius={radius} pathOptions={{ color: 'blue', opacity: 0.4 }} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
