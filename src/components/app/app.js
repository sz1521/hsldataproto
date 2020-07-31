import React, { useState, useEffect, useCallback } from "react";
import "./app.css";
import MapView from "../map";
import bbox2geohashes from "../../util/bbox2geohashes";
import useSound from 'use-sound';
import radarSFX from '../../sounds/beep.mp3';
import getDistance from "../../util/distance";
import normalize from "../../util/normalize";

var mqtt = require("mqtt");
var options = {
  protocol: "wss",
  clientId: "52521rb",
  connectTimeout: 5000,
  port: 443,
  useSSL: true,
};
const client = mqtt.connect("wss://mqtt.hsl.fi:443/", options);

// if dev, uses fake GPS location
const dev = false;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState([0, 0]);
  const [busPosition, setBusPosition] = useState([0, 0]);
  const [soundVolume, setSoundVolume] = useState(0);

  client.on("message", function (topic, message) {
    let d = new Date();
    let n = d.getSeconds();
    // Only check every 3 seconds
    if (n % 3 === 0) {
      const jsonMessage = JSON.parse(message.toString());
      if (
        jsonMessage &&
        jsonMessage.VP &&
        jsonMessage.VP.lat > 0 &&
        jsonMessage.VP.long > 0 &&
        (busPosition!==[jsonMessage.VP.lat, jsonMessage.VP.long])
      ) {
        setBusPosition([jsonMessage.VP.lat, jsonMessage.VP.long]);
        const distance = getDistance(location[0], location[1], jsonMessage.VP.lat, jsonMessage.VP.long)
        if (distance < 1000) {
          setSoundVolume(normalize(distance));
          stop();
          play();
         }
       }
    }
  });

  const [play, { stop }] = useSound(radarSFX,{ volume: soundVolume });

  const getLocation = () => {
    if (dev) {
      setLocation([60.1668392, 24.9391116]);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setLocation([position.coords.latitude, position.coords.longitude]);
      });
    } else {
      console.log("Geolocation not Available");
      setLocation([60.1668392, 24.9391116]);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const unSubscribe = () => {
        const boxArea = bbox2geohashes(
          location[0] - 0.01,
          location[1] - 0.01,
          location[0] + 0.01,
          location[1] + 0.01
        );
    
        boxArea.forEach((area) => {
          client.unsubscribe(
            "/hfp/v2/journey/ongoing/+/+/+/+/+/+/+/+/+/0/" + area + "/+/#"
          );
        });
    }
  
    window.addEventListener('beforeunload', unSubscribe);
  
    return () => {
      window.removeEventListener('beforeunload', unSubscribe);
    }
  }, [location]);

  const subscribe = useCallback(() => {
    const boxArea = bbox2geohashes(
      location[0] - 0.01,
      location[1] - 0.01,
      location[0] + 0.01,
      location[1] + 0.01
    );
    client.setMaxListeners(boxArea.length);
    // get only most important status changes (geohash_level 0: 3 %) in GPS area
    // https://digitransit.fi/en/developers/apis/4-realtime-api/vehicle-positions/
    boxArea.forEach((area) => {
      client.subscribe(
        "/hfp/v2/journey/ongoing/+/+/+/+/+/+/+/+/+/0/" + area + "/+/#"
      );
    });
    setIsLoading(false);
  },[location]);

  useEffect(() => {
    if (location[0] !== 0) {
      subscribe();
    }
  }, [location, subscribe]);

  return (
    <div className="App">
      {isLoading && <p>Loading...</p>}
      {!isLoading && location && (
        <MapView position={location} data busPosition={busPosition} />
      )}
    </div>
  );
};

export default App;
