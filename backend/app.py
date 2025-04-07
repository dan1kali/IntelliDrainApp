from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will allow all origins by default
socketio = SocketIO(app)

@app.route('/')
#def hello():
#    return 'Hello from Flask!'
def index():
   return render_template('index.html')

@socketio.on('update_data')
def handle_update_data(data):
    # Emit the data to the frontend (React)
    socketio.emit('new_data', data)

if __name__ == '__main__':
    socketio.run(app)
#     app.run(debug=True)
