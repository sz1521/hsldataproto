import React, { useRef } from "react";
import "./map.css";
import { Map, Marker, Popup, TileLayer, CircleMarker } from "react-leaflet";

const MapView = (props) => {
  const { position, data, busPosition = [0, 0] } = props;

  const mapRef = useRef();
  return (
    <Map
      ref={mapRef}
      // useFlyTo={true}
      animate
      center={position}
      zoom={14}
      enableHighAccuracy
      style={{
        height: "100vh",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position}>
        <Popup>
          {data &&
            data.features &&
            data.features[0] &&
            data.features[0].properties.region}
        </Popup>
      </Marker>
      <CircleMarker center={busPosition} radius={20} />
    </Map>
  );
};

export default MapView;
