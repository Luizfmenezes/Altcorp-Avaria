import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface TrackPosition {
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
}

// Custom marker — avoids the broken default-icon asset paths under bundlers.
const busIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:34px;height:34px;border-radius:50% 50% 50% 0;
    background:#bce416;border:2.5px solid #0a0a0c;
    transform:rotate(-45deg);display:grid;place-items:center;
    box-shadow:0 6px 16px rgba(10,10,12,0.35);">
    <div style="transform:rotate(45deg);width:9px;height:9px;border-radius:50%;background:#0a0a0c;"></div>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function TrackingMap({ position }: { position: TrackPosition }) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#f5f5f0" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[position.lat, position.lng]} icon={busIcon}>
        <Popup>
          <strong>{position.label}</strong>
          {position.sublabel ? <br /> : null}
          {position.sublabel}
        </Popup>
      </Marker>
      <Recenter lat={position.lat} lng={position.lng} />
    </MapContainer>
  );
}
