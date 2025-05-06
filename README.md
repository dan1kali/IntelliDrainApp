# IntelliDrain UI Web Application

This project is a full-stack web application with a **React frontend** and a **Flask backend**. The codebase is organized into two main directories:

- `frontend/`: React application
- `backend/`: Flask REST API


---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 was used)
- [Python](https://www.python.org/) (v3.13 was used)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-project.git
cd your-project
```

### 2. Set Up the Backend (Flask)

```cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Then run app.py. Flask will start on http://localhost:5000.

### 3. Set Up the Frontend (React)

Start a new terminal window to run

```cd frontend
npm install
npm start
```
**Only need to do npm install the first time**


**Also note that if on Macbook, you might need to disable Airplay to enable Websockets since it interferes with port 5000**


