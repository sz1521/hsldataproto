import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
// import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
// import Button from "@material-ui/core/Button";

// const client = new W3CWebSocket(
//   "wss://mqtt.hsl.fi:443/vp/bus/0055/01216/1069/1/Malmi/07:20/1130106/2/60;24/19/73/44"
// );

var mqtt = require("mqtt");
var options = {
  protocol: "mqtts",
  clientId: "52521rb",
  connectTimeout: 5000,
  port: 8883,
  path:
    "/hfp/v2/journey/ongoing/vp/bus/0055/01216/1069/1/Malmi/07:20/1130106/2/60;24/19/73/44",
};
var client = mqtt.connect("mqtts://mqtt.hsl.fi:8883/", options);

function App() {
  const [data, setData] = useState();
  const [busData, setBusData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [locationLat, setLocationLat] = useState(60.199284);
  const [locationLon, setLocationLon] = useState(24.94054);

  const [mesg, setMesg] = useState(
    <>
      <em>nothing heard</em>
    </>
  );

  var note;
  client.on("message", function (topic, message) {
    note = message.toString();
    // Updates React state with message
    setMesg(note);
    console.log(note);
    client.end();
  });

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        console.log("Latitude is :", position.coords.latitude);
        setLocationLat(position.coords.latitude);
        console.log("Longitude is :", position.coords.longitude);
        setLocationLon(position.coords.longitude);
        const map = mapRef.current.leafletElement;
        map.invalidateSize();
      });
    } else {
      console.log("Not Available");
    }
  };

  useEffect(() => {
    getLocation();
    // client.onopen = () => {
    //   console.log("WebSocket Client Connected");
    //   client.send("/hfp/v2/journey/ongoing/+/+/+/+/+/+/+/+/+/+/60;24/19/85/#");
    //   client.send("/hfp/v2/journey/ongoing/+/+/+/+/+/+/+/+/+/+/60;24/19/86/#");
    // };
    // client.onclose = () => {
    //   console.log("WebSocket Client disconnected");
    // };
    // client.onerror = (error) => {
    //   console.log("WebSocket error ", error);
    // };
    // client.onmessage = (message) => {
    //   console.log(message);
    // };
  }, []);

  useEffect(() => {
    console.info(data);
  }, [data]);

  useEffect(() => {
    console.info(busData);
  }, [busData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const result = await axios(
          "https://api.digitransit.fi/geocoding/v1/reverse?point.lat=" +
            locationLat +
            "&point.lon=" +
            locationLon +
            "&size=1"
        );
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [locationLat, locationLon]);

  const mapRef = useRef();
  return (
    <div className="App">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Loading error!</p>}
      <Map
        ref={mapRef}
        useFlyTo={true}
        animate
        center={[locationLat, locationLon]}
        pan={[locationLat, locationLon]}
        zoom={16}
        enableHighAccuracy
        style={{
          height: "calc(100vh - 4rem)",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[locationLat, locationLon]}>
          <Popup>
            {data &&
              data.features &&
              data.features[0] &&
              data.features[0].properties.region}
          </Popup>
        </Marker>
      </Map>
      <p>The message is: {mesg}</p>
      {/* <Button onClick={getLocation}>Find me</Button> */}
    </div>
  );
}

export default App;
