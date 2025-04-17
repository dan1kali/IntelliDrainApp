import './App.css';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

var socket = io('http://localhost:5000', {
  transports: ['websocket'],  // Use WebSocket transport for faster and more stable communication
});
<<<<<<< HEAD

=======
  
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
function App() {
  const [data, setData] = useState({
    salineVolumes: [],
    drainageVolumes: [],
    flushTimes: [],
    sensorValues: [],
  });
<<<<<<< HEAD

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
=======
  const [labels, setLabels] = useState([]);
  const [status, setStatus] = useState('stopped'); // Track the status (stopped, started, paused)
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5

  useEffect(() => {
    // Establish socket event listeners when the component mounts
    socket.on('connect', () => {
      console.log('Socket connected');
    });
  
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  
/*     socket.on('new_data', (receivedData) => {
      if (status === 'started') {
        console.log('Received data:', receivedData);
        
        // Update the state with the received data
        setData((prevData) => {
          const firstSalineVolume = prevData.salineVolumes[0] || receivedData.saline_volume;
          const salineVolumeDifference = receivedData.saline_volume - firstSalineVolume;
  
          return {
            ...prevData,
            salineVolumes: [...prevData.salineVolumes, salineVolumeDifference],
            drainageVolumes: [...prevData.drainageVolumes, receivedData.drainage_volume],
            flushTimes: [...prevData.flushTimes, receivedData.flush_times],
            sensorValues: [...prevData.sensorValues, receivedData.sensor_value],
          };
        });
  
        // Update the timestamps state
        setTimestamps((prevTimestamps) => [
          ...prevTimestamps,
          new Date(receivedData.date),
        ]);
      }
    }); */


    socket.on('new_data', (receivedData) => {
      if (status === 'started') {
        console.log('Received data:', receivedData);
    
        // Update the state with the received data
        setData((prevData) => {
          const firstSalineVolume = prevData.salineVolumes.length > 0 ? prevData.salineVolumes[0] : receivedData.saline_volume;
          //console.log('First saline volume:', firstSalineVolume);
          const salineVolumeDifference = receivedData.saline_volume - firstSalineVolume;
          //console.log('Saline volume difference:', salineVolumeDifference);

          // Record flush time if a 1 is returned
          const flushTime = receivedData.flush_times === 1 ? new Date() : null;

          return {
            ...prevData,
            salineVolumes: [...prevData.salineVolumes, receivedData.saline_volume],  // Store actual saline volume
            drainageVolumes: [...prevData.drainageVolumes, receivedData.drainage_volume],
            flushTimes: [...prevData.flushTimes, flushTime],
            sensorValues: [...prevData.sensorValues, receivedData.sensor_value],
          };
        });
    
        // Update the timestamps state
        setTimestamps((prevTimestamps) => [
          ...prevTimestamps,
          new Date(receivedData.date),
        ]);
      }
    });
<<<<<<< HEAD
    
  
    // Cleanup the socket event listeners when the component unmounts or the status changes
=======

>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
    return () => {
      socket.off('new_data');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [status]);  // Effect depends on `status`
  

<<<<<<< HEAD



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
=======
  const handleStart = () => {
    setStatus('started');  // Update status to 'started'
    // Add any start logic here (like initiating data fetching or starting a process)
  };

  const handlePause = () => {
    setStatus('paused');  // Update status to 'paused'
    // Add any pause logic here (like pausing data fetching or halting a process)
  };

  const handleStop = () => {
    setStatus('stopped');  // Update status to 'stopped'
    // Add any stop logic here (like stopping data fetching or halting a process)
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
  };

  const handleDownload = () => {
    // Format the data as CSV
    // First print patient data
    const patientInfo = [
      ['Patient Name', patientData.name || 'N/A'],
      ['Sex', patientData.sex || 'N/A'],
      ['Notes', patientData.notes || 'N/A'],
    ];

    const blankRow = ['', '', '', '', '', ''];
    const header = ['Date', 'Timestamp', 'Saline Volume', 'Drainage Volume', 'Sensor Value', '', 'Flush Date/Times']; // CSV Header
    const rows = data.salineVolumes.map((salineVolume, index) => [
      timestamps[index].toLocaleString(), // Timestamp formatted as a string
      salineVolume,
      data.drainageVolumes[index],
      data.sensorValues[index],
      [],
      data.flushTimes[index].toLocaleString(),

    ]);
  
    const csvContent = [patientInfo, blankRow, header, rows]
      .map(row => row.join(','))
      .join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
    // Create an invisible download link
    const link = document.createElement('a');
    if (link.download !== undefined) { // Check if the browser supports download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'data.csv'); // The name of the file
      link.style.visibility = 'hidden'; // Hide the link
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up
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
<<<<<<< HEAD
          color: 'rgba(17, 56, 100, 1)',
          maxTicksLimit: 10,
        },
=======
          color: 'rgba(106, 90, 205, 1)',  // Tick mark color (purple)
          autoSkip: true,        },
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
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

<<<<<<< HEAD

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
=======
          <div className="dataDisplay">
            <h3>Fluid Tracking</h3>
            <p>Total Drainage: {data.drainageVolumes[data.drainageVolumes.length - 1]}</p>
            <p>Total Flush: {data.salineVolumes[data.salineVolumes.length - 1]}</p>
            <p>Net Volume Drained: {(data.drainageVolumes[data.drainageVolumes.length - 1] - data.salineVolumes[data.salineVolumes.length - 1]).toFixed(2)}</p>
          </div>

          <div className="scrollingData">
            <h3>Flushing Timestamps</h3>
            {data.flushTimes.map((flushTime, index) => (
              <p key={index}>{flushTime}</p>
            ))}
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
          </div>

          <div className="controlsContainer">
<<<<<<< HEAD
            <button onClick={handleStartButton} disabled={status === 'started'}>Start</button>
            <button onClick={handlePauseButton} disabled={status !== 'started'}>Pause</button>
            <button onClick={handleStopButton} disabled={status === 'stopped'}>Stop</button>
=======
            <button onClick={handleStart} disabled={status === 'started'}>Start</button>
            <button onClick={handlePause} disabled={status !== 'started'}>Pause</button>
            <button onClick={handleStop} disabled={status === 'stopped'}>Stop</button>
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
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

<<<<<<< HEAD
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
=======
        <div className="rightColumn">

          <div className="chartContainer">
            <h3>Sensor Output</h3>
            <Line data={chartData} options={chartOptions} />
>>>>>>> ec43838daba7a4ce1c0e21115d898bf1031ca8e5
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
                  {((data.drainageVolumes[data.drainageVolumes.length - 1] - data.drainageVolumes[data.drainageVolumes.length - 86400]) -
                    (data.salineVolumes[data.salineVolumes.length - 1] - data.salineVolumes[data.salineVolumes.length - 86400])).toFixed(1)} 
                    </span>
                    <span className="unit">cc</span>

                  </div>
                  <div className="label">Net Drainage</div>

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
               
              </>
            ) : (
              <>
                <div className="volume-display">
                  <div className="big-bold">
                  {((data.drainageVolumes?.[data.drainageVolumes.length - 1] ?? 0) -
                  (data.salineVolumes?.[data.salineVolumes.length - 1] ?? 0)).toFixed(1)} cc
                  </div>
                  <div className="label">Net Volume Drained</div>

                  <p className="grey-text">
                    {data.drainageVolumes[data.drainageVolumes.length - 1]?.toFixed(1) || '0.0'} cc Drained
                  </p>
                  <p className="grey-text">
                    {data.salineVolumes[data.salineVolumes.length - 1]?.toFixed(1) || '0.0'} cc Flushed
                  </p>

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

              <p className="grey-text">
                {data.drainageVolumes[data.drainageVolumes.length - 1]?.toFixed(1) || '0.0'} cc Drained
              </p>
              <p className="grey-text">
                {data.salineVolumes[data.salineVolumes.length - 1]?.toFixed(1) || '0.0'} cc Flushed
              </p>

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
