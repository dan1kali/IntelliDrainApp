

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

// const socket = io('http://localhost:5000');  // Default connection, let Socket.IO handle the transport
// var socket = io.connect('http://localhost:5000');  // Make sure this is pointing to your Flask server

var socket = io('http://localhost:5000', {
  transports: ['websocket'],  // Use WebSocket transport for faster and more stable communication
});

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Log when the socket is connected and disconnected
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for 'new_data' event from Flask server
    socket.on('new_data', (receivedData) => {
      console.log('Received data:', receivedData); // Debugging line
      setData(receivedData);  // Update state with the new data
    });

    // Clean up the socket connection when the component is unmounted
    return () => {
      socket.off('new_data');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="App">
      <h1>Arduino Data</h1>
      {data ? (
        <p>Sensor Value: {data.sensor_value}</p>  // Only render if data is available
      ) : (
        <p>Waiting for data...</p>  // Fallback message while data is being fetched
      )}
    </div>
  );
}

export default App;
