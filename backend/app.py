from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import random
from threading import Lock
from datetime import datetime

# Initialize Flask app and SocketIO
app = Flask(__name__, static_folder='../frontend/build')
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")  # Allow React frontend
CORS(app, origins="http://localhost:3000")  # Allow React frontend for all routes

# Global thread management
thread = None
thread_lock = Lock()

# Generate current date-time
def get_current_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y %H:%M:%S")

# Simulate sensor data
def get_sensor_data():
    return {"sensor_value": round(random.random() * 100, 3), "date": get_current_datetime()}

# Background thread that sends sensor data to clients
def background_thread():
    print("Background thread started", flush=True)  # Add logging here to verify the thread is running
    while True:
        data = get_sensor_data()
        print(f"Emitting data: {data}")  # Log emitted data to the console for debugging
        socketio.emit('new_data', data)
        socketio.sleep(1)  # Emit data every second

# Serve the root index file
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Handle client connection
@socketio.on('connect')
def test_connect():
    global thread
    print('Client connected')

    # Start the background thread if it is not already running
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)

""" @socketio.on('connect')
def test_connect():
    print('Client connected')
    data = get_sensor_data()  # Get sample data
    print(f"Emitting data immediately: {data}")  # Log data to ensure it's being emitted
    socketio.emit('new_data', data)  # Emit data immediately """

 
# Handle client disconnection
@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected', request.sid)

# Run the app with SocketIO
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)