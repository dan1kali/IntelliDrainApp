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
    sensorValues: [],
  });

  const [timestamps, setTimestamps] = useState([]);
  const [status, setStatus] = useState('stopped'); // Track the status (stopped, started, paused)
  const [timeRange, setTimeRange] = useState('all'); // '5min', '1hr', '24hr', 'all'

  // State for Patient Data
  const [patientData, setPatientData] = useState({
    name: '',
    sex: '',
    notes: '',
  });

  const [showStopPrompt, setShowStopPrompt] = useState(false); // State for stop prompt
  const [isDataSaving, setIsDataSaving] = useState(false); // Flag for data saving in process

  useEffect(() => {
    // Establish socket event listeners when the component mounts
    socket.on('connect', () => {
      console.log('Socket connected');
    });
  
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });


    socket.on('new_data', (receivedData) => {
      if (status === 'started') {
        console.log('Received data:', receivedData);
    
        setData((prevData) => {
          const flushTime = receivedData.flush_times === 1 ? new Date() : null;
    
          const previousSalineVolumeArray = prevData.salineVolumes || [];
          const lastValue = previousSalineVolumeArray.length > 0 ? previousSalineVolumeArray[previousSalineVolumeArray.length - 1] : 0;
          const newValue = receivedData.flush_times === 1 ? lastValue + 15 : lastValue;

          const lastDrainageValue = prevData.drainageVolumes.length > 0 ? prevData.drainageVolumes[prevData.drainageVolumes.length - 1] : 0;
          const newDrainageValue = Math.max(0, lastDrainageValue + 1);  // Ensure it doesn't go below 0    

          return {
            ...prevData,
            salineVolumes: [...previousSalineVolumeArray, newValue],
            drainageVolumes: [...prevData.drainageVolumes, newDrainageValue],
            flushTimes: [flushTime, ...prevData.flushTimes],
            sensorValues: [...prevData.sensorValues, receivedData.sensor_value],
          };
        });
    
        setTimestamps((prevTimestamps) => [
          ...prevTimestamps,
          new Date(receivedData.date),
        ]);
      }
    });
    
    
    
  
    // Cleanup the socket event listeners when the component unmounts or the status changes
    return () => {
      socket.off('new_data');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [status]);  // Effect depends on `status`
  




  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');

  // useEffect to fetch ports when the component mounts
  useEffect(() => {
    fetch('http://localhost:5000/api/ports')
      .then((res) => res.json())
      .then((data) => setPorts(data))
      .catch((err) => {
        console.error('Error fetching ports:', err);
      });
  }, []);  // Empty dependency array to run only on mount

  const handleSelect = () => {
    fetch('http://localhost:5000/api/set_port', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port: selectedPort }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Port set response:', data);
      })
      .catch((err) => {
        console.error('Error setting port:', err);
      });
  };


  const handleStartButton = () => {
    setStatus('started');  // Update status to 'started' to start collecting data from socket
  };

  const handlePauseButton = () => {
    setStatus('paused');  // Update status to 'paused' to pause data collection, but socket is still connected
  };

  const handleStopButton = () => {
    setStatus('paused');  // Update status to 'paused'
    setShowStopPrompt(true);  // Show prompt when stopping
  };

  const handleCancelData = () => {
    setShowStopPrompt(false); // Hide the stop prompt without clearing data
    setStatus('paused');
  };

  const handleSaveData = async () => {
    setIsDataSaving(true);
    await handleDownload(); 
  
    setData({
      salineVolumes: [],
      drainageVolumes: [],
      flushTimes: [],
      sensorValues: [],
    });
    setTimestamps([]);
    setStatus('stopped');
    setShowStopPrompt(false);
  
    setIsDataSaving(false);
  };

  const handleDontSaveData = () => {
    setStatus('stopped'); // Simply stop without clearing data
    setData({
      salineVolumes: [],
      drainageVolumes: [],
      flushTimes: [],
      sensorValues: [],
    });
    setTimestamps([]);
    setShowStopPrompt(false);
  };

  const handleDownload = () => {
    const patientInfo = [
      ['Patient Name', patientData.name || 'N/A'],
      ['Sex', patientData.sex || 'N/A'],
      ['Notes', patientData.notes || 'N/A'],
    ];
  
    const blankRow = [];
  
    const header = [
      'Date',
      'Time',
      'Saline Volume',
      'Drainage Volume',
      'Sensor Value',
      '', // Spacer column
      'Flush Date',
      'Flush Time',
    ];
  
    // Prepare main sensor data rows
    const dataRows = data.salineVolumes.map((salineVolume, index) => {
      const timestamp = timestamps[index];
      const date = timestamp ? timestamp.toLocaleDateString() : '';
      const time = timestamp ? timestamp.toLocaleTimeString() : '';
  
      return [
        date,
        time,
        salineVolume,
        data.drainageVolumes[index],
        data.sensorValues[index],
      ];
    });
  
    // Prepare flush time rows (no alignment)
    const flushRows = data.flushTimes
      .filter(flush => flush !== null)
      .map(flush => [
        flush.toLocaleDateString(),
        flush.toLocaleTimeString(),
      ]);
  
    // Determine the max number of rows needed
    const maxRows = Math.max(dataRows.length, flushRows.length);
  
    // Merge dataRows and flushRows into a single table with spacing
    const mergedRows = Array.from({ length: maxRows }).map((_, i) => {
      const dataRow = dataRows[i] || ['', '', '', '', ''];
      const flushRow = flushRows[i] || ['', ''];
      return [...dataRow, '', ...flushRow]; // Insert blank column in between
    });
  
    const csvContent = [
      patientInfo,
      blankRow,
      header,
      ...mergedRows,
    ]
      .map(row => row.join(','))
      .join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
      { data: filteredData.data,
        borderColor: 'rgb(192, 47, 69)',
        backgroundColor: 'rgba(255, 182, 193, 0.4)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time',
          color: 'rgba(17, 56, 100, 1)',
        },
        ticks: {
          color: 'rgba(17, 56, 100, 1)',
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(216, 191, 216, 0.5)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Occlusion Sensor Value',
          color: 'rgba(17, 56, 100, 1)',
        },
        ticks: {
          color: 'rgba(17, 56, 100, 1)',
        },
        grid: {
          color: 'rgba(216, 191, 216, 0.5)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleColor: 'rgba(222, 236, 252, 1)',
        bodyColor: 'rgba(222, 236, 252, 1)',
      },
    },
  };

  return (
    <div className="App">
      <h1>IntelliDrain Fluid Tracking</h1>

      <div className="layoutContainer">

        <div className="leftColumn">

          {/* <div className="controlsContainer">
            <label htmlFor="device-select">Select Device: </label>
            <select id="device-select">
              <option value="device1">Device 1</option>
              <option value="device2">Device 2</option>
              <option value="device3">Device 3</option>
            </select>
          </div> */}


          <div className="controlsContainer">
            <label htmlFor="device-select">Select Port: </label>
            <select
              id="device-select"
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
            >
              <option value="">Select a port</option>

              {/* Add random option */}
              <option value="random">Random</option>


              {ports.map((port) => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
            <button onClick={handleSelect} disabled={!selectedPort}>
              Connect
            </button>

            {/* Button to manually rescan ports */}
            <button
              onClick={() => {
                fetch('http://localhost:5000/api/ports')
                  .then((res) => res.json())
                  .then((data) => setPorts(data))
                  .catch((err) => {
                    console.error('Error fetching ports:', err);
                  });
              }}
            >
              Rescan Ports
            </button>
          </div>

          <div className="controlsContainer">
            <button onClick={handleStartButton} disabled={status === 'started'}>Start</button>
            <button onClick={handlePauseButton} disabled={status !== 'started'}>Pause</button>
            <button onClick={handleStopButton} disabled={status === 'stopped'}>Stop</button>
          </div>

          <div className="patientDataContainer">
            <h3>Patient Data</h3>
            <div className="formGroup">
              <label>Name: </label>
              <input
                type="text"
                name="name"
                value={patientData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="formGroup">
              <label>Sex: </label>
              <select
                name="sex"
                value={patientData.sex}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="male">M</option>
                <option value="female">F</option>
              </select>
            </div>

            <div className="formGroup">
              <label>Notes: </label>
              <textarea
                name="notes"
                value={patientData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button className="downloadButton" onClick={handleDownload}>
            Download Data
          </button>

        </div>

        <div className="centerColumn">
          <div className="dataDisplay">
            <h3>Last 24 Hours</h3>
            {data.drainageVolumes.length > 86400 && data.salineVolumes.length > 86400 ? (
              <>
                <div className="volume-display">
                  <div className="big-bold">
                    <span className="number">
                      {(
                        (data.drainageVolumes[data.drainageVolumes.length - 1] - data.drainageVolumes[data.drainageVolumes.length - 86400]) -
                        (data.salineVolumes[data.salineVolumes.length - 1] - data.salineVolumes[data.salineVolumes.length - 86400])
                      ).toFixed(1)}
                    </span>
                    <span className="unit">cc</span>
                  </div>
                  <div className="label">Net Drainage</div>

                  <div className="amounts-container">
                    <p className="grey-text">
                      {(
                        data.drainageVolumes[data.drainageVolumes.length - 1] -
                        data.drainageVolumes[data.drainageVolumes.length - 86400]
                      ).toFixed(1) || '0.0'} cc Drained
                    </p>
                    <p className="grey-text">
                      {(
                        data.salineVolumes[data.salineVolumes.length - 1] -
                        data.salineVolumes[data.salineVolumes.length - 86400]
                      ).toFixed(1) || '0.0'} cc Flushed
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="volume-display">
                  <div className="big-bold">
                    {(
                      (data.drainageVolumes?.[data.drainageVolumes.length - 1] ?? 0) -
                      (data.salineVolumes?.[data.salineVolumes.length - 1] ?? 0)
                    ).toFixed(1)} cc
                  </div>
                  <div className="label">Net Volume Drained</div>

                  <div className="amounts-container">
                    <p className="grey-text">
                      {data.drainageVolumes[data.drainageVolumes.length - 1]?.toFixed(1) || '0.0'} cc Drained
                    </p>
                    <p className="grey-text">
                      {data.salineVolumes[data.salineVolumes.length - 1]?.toFixed(1) || '0.0'} cc Flushed
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>


          <div className="dataDisplay">
            <h3>Cumulative to Date</h3>
            <div className="volume-display">
              <div className="big-bold">
              {((data.drainageVolumes?.[data.drainageVolumes.length - 1] ?? 0) -
                (data.salineVolumes?.[data.salineVolumes.length - 1] ?? 0)).toFixed(1)} cc
              </div>
              <div className="label">Net Volume Drained</div>
              <div className="amounts-container">

                <p className="grey-text">
                  {data.drainageVolumes[data.drainageVolumes.length - 1]?.toFixed(1) || '0.0'} cc Drained
                </p>
                <p className="grey-text">
                  {data.salineVolumes[data.salineVolumes.length - 1]?.toFixed(1) || '0.0'} cc Flushed
                </p>
              </div>
            </div>

          </div>

          <div className="scrollingData">
            <h3>Flushing Timestamps</h3>
            <div className="timestampsContainer">
              {data.flushTimes.map((flushTime, index) =>
                flushTime ? (
                  <p key={index}>{flushTime.toLocaleString()}</p>
                ) : null
              )}
            </div>
          </div>



        </div>


        <div className="rightColumn">
          <div className="chartContainer">
            <h3>Sensor Output</h3>
            <Line data={chartData} options={chartOptions} />
            <div className="timeRangeButtons">
              <button onClick={() => setTimeRange('all')}>All Time</button>
              <button onClick={() => setTimeRange('24hr')}>24 Hours</button>
              <button onClick={() => setTimeRange('1hr')}>1 Hour</button>
              <button onClick={() => setTimeRange('5min')}>5 Min</button>
            </div>


          </div>


        </div>

      </div>

      {showStopPrompt && (
        <div className="stopPrompt">
          <p>Do you want to save the data before stopping?</p>
          <button onClick={handleCancelData}>Cancel</button>
          <button onClick={handleSaveData} disabled={isDataSaving}>Save</button>
          <button onClick={handleDontSaveData}>Don't Save</button>
        </div>
      )}
    </div>
  );
}

export default App;
