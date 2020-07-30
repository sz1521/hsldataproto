import React, { useRef } from "react";
import "./map.css";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

const MapView = (props) => {

  const {position, data} = props;

  const mapRef = useRef();
  return (
      <Map
        ref={mapRef}
        // useFlyTo={true}
        animate
        center={position}
        zoom={16}
        enableHighAccuracy
        style={{
          height: "calc(100vh - 4rem)",
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
      </Map>
  );
}

export default MapView;
