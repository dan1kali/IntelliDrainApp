from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os

# app = Flask(__name__)
app = Flask(__name__, static_folder='../frontend/build')
socketio = SocketIO(app)
CORS(app)  # This will allow all origins by default

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')
#    return 'Hello from Flask!'

@socketio.on('update_data')
def handle_update_data(data):
    # Emit the data to the frontend (React)
    socketio.emit('new_data', data)

if __name__ == '__main__':
    socketio.run(app)
#     app.run(debug=True)
