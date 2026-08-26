# Ocean Hazard Reporting & Mapping System

An AI-assisted crowdsourced platform for reporting, analyzing, and mapping marine hazards.

## Project Structure
- `backend/`: Flask web server, SQLite database integration, and image analysis service.
- `frontend/`: Single-page client app displaying a leaflet map, submission form, and statistics.

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Run a local web server from the project root:
   ```bash
   python -m http.server 5500 -d frontend
   ```
2. Open `http://127.0.0.1:5500` in your web browser.
