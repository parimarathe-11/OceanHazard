import uuid
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
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
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.get("/api/reports")
def reports():
    category = request.args.get("category")
    severity = request.args.get("severity")
    try:
        data = get_reports(category=category, severity=severity)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Route to serve uploads statically and securely
@app.get("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.post("/api/reports")
def create_report():
    description = request.form.get("description", "").strip()
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    image = request.files.get("image")

    # 1. Coordinate and Image Presence Validation
    if not latitude or not longitude:
        return jsonify({"error": "Location coordinates are required."}), 400
    if not image or image.filename == "":
        return jsonify({"error": "Image file is required."}), 400

    # 2. Coordinates Range Validation
    try:
        latitude = float(latitude)
        longitude = float(longitude)
        if not (-90.0 <= latitude <= 90.0):
            return jsonify({"error": "Latitude must be between -90.0 and 90.0."}), 400
        if not (-180.0 <= longitude <= 180.0):
            return jsonify({"error": "Longitude must be between -180.0 and 180.0."}), 400
    except ValueError:
        return jsonify({"error": "Latitude and longitude must be numbers."}), 400

    # 3. Description Length Validation
    if len(description) > 1000:
        return jsonify({"error": "Description cannot exceed 1000 characters."}), 400

    # 4. File Type and Size Validation
    if not allowed_file(image.filename):
        return jsonify({"error": "Unsupported image format. Allowed: PNG, JPG, JPEG, WEBP."}), 400

    # Check file size
    image.seek(0, 2)
    file_size = image.tell()
    image.seek(0)
    if file_size > MAX_FILE_SIZE:
        return jsonify({"error": "Image file size exceeds the 5MB limit."}), 400

    # 5. Generate Unique Filename to Prevent Conflicts
    original_name = secure_filename(image.filename)
    ext = original_name.rsplit(".", 1)[1].lower() if "." in original_name else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = UPLOAD_DIR / unique_filename

    # Save the file
    try:
        image.save(save_path)
    except Exception as e:
        return jsonify({"error": f"Failed to save uploaded image: {str(e)}"}), 500

    # 6. Analyze Image and Generate Threat Triage
    try:
        result = analyze_image(save_path)
    except Exception as e:
        # Cleanup uploaded file if processing fails
        if save_path.exists():
            save_path.unlink()
        return jsonify({"error": f"Image processing failed: {str(e)}"}), 500

    category = result["category"]
    confidence = float(result["confidence"])
    severity = calculate_severity(category)

    # 7. Write to SQLite Database
    try:
        # Save relative URL path so frontend can construct correct image references
        db_image_path = f"uploads/{unique_filename}"
        report_id = insert_report(
            category,
            severity,
            description,
            latitude,
            longitude,
            db_image_path,
            confidence
        )
    except Exception as e:
        # Cleanup file if DB insert fails
        if save_path.exists():
            save_path.unlink()
        return jsonify({"error": f"Failed to log report to database: {str(e)}"}), 500

    return jsonify({
        "id": report_id,
        "category": category,
        "confidence": confidence,
        "severity": severity,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "image_path": db_image_path
    }), 201

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
