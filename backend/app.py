from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import random
from threading import Lock
from datetime import datetime
import serial
import serial.tools.list_ports





# Initialize Flask app and SocketIO
app = Flask(__name__, static_folder='../frontend/build')
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")  # Allow React frontend
CORS(app, origins="http://localhost:3000")  # Allow React frontend for all routes

# Global thread management
thread = None
thread_lock = Lock()

# Global serial object
ser = None
selected_port_mode = "random"  # default mode can be "Random" or "Serial"

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
    """ now = datetime.now()
    return now.strftime("%m/%d/%Y %H:%M:%S") """
    return 1

# Put data all together in an array
def get_data_og():
    return {"date": get_current_datetime(), 
            "sensor_value": get_occlusion_sensor_value(), 
            "saline_volume": get_fluid_tracking_values()[0], 
            "drainage_volume": get_fluid_tracking_values()[1],
            "flush_times": get_flush_initiation_times()}

# Send port options
@app.route('/api/ports', methods=['GET'])
def list_ports():
    ports = serial.tools.list_ports.comports()
    port_list = [port.device for port in ports]
    return jsonify(port_list)

# Select port
@app.route('/api/set_port', methods=['POST'])
def set_port():
    global ser, selected_port_mode
    data = request.get_json()
    selected_port = data.get('port')
    print(f"SELECTED PORT IS: {selected_port}")
    # Initialize serial connection
    # ser = serial.Serial('/dev/cu.usbmodem14101', 9600)
    if selected_port == "random":
        selected_port_mode = "random"
        ser = None  # Just in case
        print("Switched to Random mode")
        return jsonify({"message": "Switched to Random data mode"}), 200
    else:
        try:
            ser = serial.Serial(selected_port, 9600, timeout=1)
            selected_port_mode = "serial"
            print(f"Connected to {selected_port}")
            return jsonify({"message": f"Connected to {selected_port}"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500


# Get serial data
def get_data():
    if selected_port_mode == "random":
        now = datetime.now()
        return {"date": get_current_datetime(), 
                "sensor_value": get_occlusion_sensor_value(), 
                "saline_volume": get_fluid_tracking_values()[0], 
                "drainage_volume": get_fluid_tracking_values()[1],
                "flush_times": get_flush_initiation_times()}
    else:
        try:
            line = ser.readline().decode('utf-8').strip()
            print(f"Serial raw: {line}")

            values = line.split(',')
            if len(values) == 5:
                return {
                    'time_ms': int(values[0]),
                    'sensor_value': int(values[1]),
                    'saline_volume': int(values[2]),
                    'drainage_volume': int(values[3]),
                    'flush_times': int(values[4]),
                    'date': get_current_datetime()
                }
            else:
                print("Unexpected number of values.")
                return {
                        'time_ms': 1,
                        'sensor_value': 1,
                        'saline_volume': 1,
                        'drainage_volume': 1,
                        'flush_times': 1,
                        'date': get_current_datetime()}
        except Exception as e:
            print(f"Error parsing serial data: {e}")
            return {'time_ms': 1,
                    'sensor_value': 1,
                    'saline_volume': 1,
                    'drainage_volume': 1,
                    'flush_times': 1,
                    'date': get_current_datetime()}



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