import React, { useState, useEffect } from "react";
import "./app.css";
// import Button from "@material-ui/core/Button";
import MapView from "../map";
import bbox2geohashes from "../../util/bbox2geohashes";

var mqtt = require("mqtt");
var options = {
  protocol: "wss",
  clientId: "52521rb",
  connectTimeout: 5000,
  port: 443,
  useSSL: true,
};
const client = mqtt.connect("wss://mqtt.hsl.fi:443/", options);

const dev = true;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [location, setLocation] = useState([0, 0]);
  const [busPosition, setBusPosition] = useState([0, 0]);

  client.on("message", function (topic, message) {
    let d = new Date();
    let n = d.getSeconds();
    if (n % 6 === 0) {
      const jsonMessage = JSON.parse(message.toString());
      if (
        jsonMessage &&
        jsonMessage.VP &&
        jsonMessage.VP.lat > 0 &&
        jsonMessage.VP.long > 0
      ) {
        setBusPosition([jsonMessage.VP.lat, jsonMessage.VP.long]);
        console.log("Bus located! at ", [
          jsonMessage.VP.lat,
          jsonMessage.VP.long,
        ]);
      }
    }
  });

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

  const unSubscribe = () => {
    const boxArea = bbox2geohashes(
      location[0] - 0.01,
      location[1] - 0.01,
      location[0] + 0.01,
      location[1] + 0.01
    );

    boxArea.forEach((area) => {
      client.unsubscribe(
        "/hfp/v2/journey/ongoing/+/+/+/+/+/+/+/+/+/+/" + area + "/+/#"
      );
    });
  };

  const subscribe = () => {
    const boxArea = bbox2geohashes(
      location[0] - 0.01,
      location[1] - 0.01,
      location[0] + 0.01,
      location[1] + 0.01
    );

    boxArea.forEach((area) => {
      client.subscribe(
        "/hfp/v2/journey/ongoing/+/+/+/+/+/+/+/+/+/+/" + area + "/+/#"
      );
    });
  };

  useEffect(() => {
    if (location[0] !== 0) {
      subscribe();
      setIsLoading(false);
    }
  }, [location]);

  return (
    <div className="App">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Loading error!</p>}

      {location && (
        <MapView position={location} data busPosition={busPosition} />
      )}
      {/* <p>{mesg}</p> */}
      {/* <Button onClick={getLocation}>Find me</Button> */}
    </div>
  );
};

export default App;
