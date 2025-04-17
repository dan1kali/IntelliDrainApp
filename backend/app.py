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
    print(f"\n\nSELECTED PORT IS: {selected_port}\n\n")
    # Initialize serial connection
    # ser = serial.Serial('/dev/cu.usbmodem14101', 9600)
    if selected_port == "random":
        selected_port_mode = "random"
        ser = None  # Just in case
        print("\n\nSwitched to Random mode\n\n")
        return jsonify({"message": "Switched to Random data mode"}), 200
    else:
        try:
            ser = serial.Serial(selected_port, 9600, timeout=1)
            selected_port_mode = "serial"
            print(f"\n\nConnected to {selected_port}\n\n")
            return jsonify({"message": f"Connected to {selected_port}"}), 200
        except Exception as e:
            print(f"\n\nError for some reason\n\n")
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
        # print(ser)
        line = ser.readline().decode('utf-8').strip()
        print(f"\nSerial raw: {line}\n")

        values = line.split(',')
        if len(values) == 5:
            return {
                'time_ms': float(values[0]),
                'sensor_value': float(values[1]),
                'saline_volume': float(values[2]),
                'drainage_volume': float(values[3]),
                'flush_times': int(values[4]),
                'date': get_current_datetime()
            }
        else:
            print("Unexpected number of values.")
            return None



# Background thread that sends sensor data to clients
def background_thread():
    print("Background thread started", flush=True)
    while True:
        data = get_data()
        if data:  # Only emit if data is valid (not None)
            print(f"Emitting data: {data}")
            socketio.emit('new_data', data)
        socketio.sleep(1)
    else:
        print("Skipped emitting due to malformed data")



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