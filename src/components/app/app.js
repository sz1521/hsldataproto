import React, { useState, useEffect, useRef } from "react";
import "./app.css";
import axios from "axios";
// import Button from "@material-ui/core/Button";
import MapView from "../map"

var mqtt = require("mqtt");
var options = {
  protocol: "wss",
  clientId: "52521rb",
  connectTimeout: 5000,
  port: 443,
  useSSL: true,
};
var client = mqtt.connect("wss://mqtt.hsl.fi:443/", options);


const App = () => {
  const [data, setData] = useState();
  const [busData, setBusData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [locationLat, setLocationLat] = useState(60.1668392);
  const [locationLon, setLocationLon] = useState(24.9391116);

  const [mesg, setMesg] = useState(
    <>
      <em>nothing heard</em>
    </>
  );

  var note;
  client.on("message", function (topic, message) {
    console.log("Incoming message!");
    note = message.toString();
    // Updates React state with message
    setMesg(note);
    console.log(note);
    client.end();
  });

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        // console.log("Latitude is :", position.coords.latitude);
        setLocationLat(position.coords.latitude);
        // console.log("Longitude is :", position.coords.longitude);
        setLocationLon(position.coords.longitude);
      });
    } else {
      console.log("Geolocation not Available");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // for testing only
  useEffect(() => {
    console.info(data);
  }, [data]);

  useEffect(() => {
    console.info(busData);
  }, [busData]);

  useEffect(() => {
    client.subscribe('/hfp/v2/journey/ongoing/vp/+/+/+/+/+/+/+/+/0/#');

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

      <MapView position={[locationLat, locationLon]} data/>
      <p>The message is: {mesg}</p>
      {/* <Button onClick={getLocation}>Find me</Button> */}
    </div>
  );
}

export default App;
