from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from database import init_db, insert_report, get_reports
from ai_service import analyze_image
from severity import calculate_severity

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.get("/api/reports")
def reports():
    return jsonify(get_reports())

@app.post("/api/reports")
def create_report():
    description = request.form.get("description", "").strip()
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    image = request.files.get("image")

    if not latitude or not longitude:
        return jsonify({"error": "Location is required"}), 400
    if not image or image.filename == "":
        return jsonify({"error": "Image is required"}), 400
    if not allowed_file(image.filename):
        return jsonify({"error": "Unsupported image type"}), 400

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except ValueError:
        return jsonify({"error": "Latitude and longitude must be numbers"}), 400

    filename = secure_filename(image.filename)
    save_path = UPLOAD_DIR / filename
    image.save(save_path)

    try:
        result = analyze_image(save_path)
    except Exception:
        return jsonify({"error": "Image analysis failed"}), 500

    category = result["category"]
    confidence = float(result["confidence"])
    severity = calculate_severity(category)

    report_id = insert_report(
        category,
        severity,
        description,
        latitude,
        longitude,
        str(save_path),
        confidence
    )

    return jsonify({
        "id": report_id,
        "category": category,
        "confidence": confidence,
        "severity": severity,
        "description": description,
        "latitude": latitude,
        "longitude": longitude
    }), 201

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
