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

def get_occlusion_sensor_value():
    # INSERT FUTURE CODE HERE
    return round(random.random() * 100, 2)

def get_fluid_tracking_values():
    # INSERT FUTURE CODE HERE
    saline_volume = round(random.random() * 100, 2)
    drainage_volume = round(random.random() * 100, 2)
    return saline_volume, drainage_volume

def get_flush_initiation_times():
    # INSERT FUTURE CODE HERE
    return round(random.random() * 100, 2)

# Put data all together in an array
def get_data():
    return {"date": get_current_datetime(), 
            "sensor_value": get_occlusion_sensor_value(), 
            "saline_volume": get_fluid_tracking_values()[0], 
            "drainage_volume": get_fluid_tracking_values()[1],
            "flush_times": get_flush_initiation_times()}

# Background thread that sends sensor data to clients
def background_thread():
    print("Background thread started", flush=True)  # Add logging here to verify the thread is running
    while True:
        data = get_data()
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


# Handle client disconnection
@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected', request.sid)

# Run the app with SocketIO
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)