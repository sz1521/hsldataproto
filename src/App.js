import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('wss://mqtt.hsl.fi:443');

function App() {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {

    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      console.log(message);
    };

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false)

      try {
        const result = await axios(
          'http://api.digitransit.fi/routing/v1/routers/waltti/',
        );
        setData(result.data);
      } catch (error) {
        setIsError(true)
      }
      setIsLoading(false);
    };
 
    fetchData();
  }, []);

  useEffect(() => {
    console.info(data)
  }, [data]);

  return (
    <div className="App">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Loading error!</p>}
    </div>
  );
}

export default App;
