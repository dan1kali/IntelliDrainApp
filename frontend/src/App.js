import './App.css';

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


var socket = io('http://localhost:5000', {
  transports: ['websocket'],  // Use WebSocket transport for faster and more stable communication
});


function App() {
  const [data, setData] = useState({
    salineVolumes: [],
    drainageVolumes: [],
    flushTimes: [],
    sensorValues: [],  // Make sure this is an array
  });

  const [timestamps, setTimestamps] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); // '5min', '1hr', '24hr', 'all'


  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('new_data', (receivedData) => {
      console.log('Received data:', receivedData);
      setData((prevData) => ({
        ...prevData, // Retain the previous data
        salineVolumes: [...prevData.salineVolumes, receivedData.saline_volume], // Append the new sensor value to the array
        drainageVolumes: [...prevData.drainageVolumes, receivedData.drainage_volume], // Append the new sensor value to the array
        flushTimes: [...prevData.flushTimes, receivedData.flush_times],
        sensorValues: [...prevData.sensorValues, receivedData.sensor_value], // Append the new sensor value to the array
      }));
      
      setTimestamps((prevTimestamps) => [
        ...prevTimestamps,
        new Date(receivedData.date),
      ]);
    });

    return () => {
      socket.off('new_data');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const handleStart = () => {
    setIsStarted(true);
    // Add your start logic here (like initiating data fetching or starting a process)
  };

  const handleStop = () => {
    setIsStarted(false);
    // Add your stop logic here (like stopping data fetching or halting a process)
  };

  // Handle Download Button click
  const handleDownload = () => {
    // Add your download logic here, like generating a file to download
  };

  const getFilteredChartData = () => {
    const now = new Date();
    const timeLimits = {
      '5min': 5 * 60 * 1000,
      '1hr': 60 * 60 * 1000,
      '24hr': 24 * 60 * 60 * 1000,
    };
  
    let filteredTimestamps = timestamps;
    let filteredValues = data.sensorValues;
  
    if (timeRange !== 'all') {
      const threshold = new Date(now.getTime() - timeLimits[timeRange]);
  
      // Filter based on actual timestamps
      const filteredIndexes = timestamps
        .map((timestamp, index) => (timestamp >= threshold ? index : null))
        .filter((index) => index !== null);
  
      filteredTimestamps = filteredIndexes.map((index) => timestamps[index]);
      filteredValues = filteredIndexes.map((index) => data.sensorValues[index]);
    }
  
    // Format labels from filtered timestamps
    const filteredLabels = filteredTimestamps.map((ts) =>
      ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  
    return {
      labels: filteredLabels,
      data: filteredValues,
    };
  };
  

  
  const filteredData = getFilteredChartData();

  const chartData = {
    labels: filteredData.labels,
    datasets: [
      {
        data: filteredData.data,
        borderColor: 'rgb(192, 47, 69)',
        backgroundColor: 'rgba(255, 182, 193, 0.4)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    layout: {
      padding: {
        top: 20,
        left: 30,
        right: 0,
        bottom: 20,
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time',
          color: 'rgba(106, 90, 205, 1)',  // Text purple full opacity
        },
        ticks: {
          color: 'rgba(106, 90, 205, 1)',  // Tick mark color (purple)
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(216, 191, 216, 0.5)',  // Grid lines lavender, transparent
        },
      },
      y: {
        title: {
          display: true,
          text: 'Occlusion Sensor Value',
          color: 'rgba(106, 90, 205, 1)',  // Soft purple for axis title
        },
        ticks: {
          color: 'rgba(106, 90, 205, 1)',  // Soft purple for tick marks
        },
        grid: {
          color: 'rgba(216, 191, 216, 0.5)',  // Light lavender grid lines with transparency
        },
      },
    },
    plugins: {
      legend: {
          display: false,  // Soft purple for legend text
      },
      tooltip: {
        titleColor: 'rgba(106, 90, 205, 1)',  // Soft purple for tooltip title
        bodyColor: 'rgba(106, 90, 205, 1)',   // Soft purple for tooltip body text
      },
    },
  };

  return (
    <div className="App">
      <h1>Arduino Data</h1>

      <div className="layoutContainer">

        <div className="leftColumn">

          <div className="controlsContainer">
            <label htmlFor="device-select">Select Device: </label>
            <select id="device-select">
              <option value="device1">Device 1</option>
              <option value="device2">Device 2</option>
              <option value="device3">Device 3</option>
            </select>
          </div>

          <div className="dataDisplay">
            <h3>Fluid Tracking</h3>
            <p>Total Drainage: {data.drainageVolumes[data.drainageVolumes.length - 1]}</p>
            <p>Total Flush: {data.salineVolumes[data.salineVolumes.length - 1]}</p>
            <p>Net Volume Drained: {(data.drainageVolumes[data.drainageVolumes.length - 1] - data.salineVolumes[data.salineVolumes.length - 1]).toFixed(2)}</p>
            </div>

            <div className="scrollingData">
            <h3>Flushing Timestamps</h3>
            {data.flushTimes.map((flushTime, index) => (
              /* <p key={index}>Flush time: {new Date(flushTime).toLocaleTimeString()}</p> */
              <p key={index}> {flushTime}</p>
            ))}
          </div>


          <div className="controlsContainer">
            <button onClick={handleStart} disabled={isStarted}>Start</button>
            <button onClick={handleStop} disabled={!isStarted}>Stop</button>
          </div>

        </div>


        <div className="rightColumn">

          <div className="chartContainer">
            <h3>Sensor Output</h3>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="timeRangeButtons">
            <button onClick={() => setTimeRange('all')}>All Time</button>
            <button onClick={() => setTimeRange('24hr')}>24 Hours</button>
            <button onClick={() => setTimeRange('1hr')}>1 Hour</button>
            <button onClick={() => setTimeRange('5min')}>5 Min</button>
          </div>

          <button className="downloadButton" onClick={handleDownload}>
            Download Data
          </button>
        </div>
      </div>
    </div>
  );
}


export default App;
