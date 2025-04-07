/* import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
 */



import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');  // Flask backend

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    socket.on('new_data', (receivedData) => {
      setData(receivedData);
    });
  }, []);

  return (
    <div className="App">
      <h1>Arduino Data</h1>
      <p>{data}</p>
    </div>
  );
}

export default App;
