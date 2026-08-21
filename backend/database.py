import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "reports.sqlite3"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            image_path TEXT,
            confidence REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def insert_report(category, severity, description,
                  latitude, longitude, image_path, confidence):
    conn = get_connection()
    cursor = conn.execute("""
        INSERT INTO reports
        (category, severity, description, latitude, longitude,
         image_path, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        category, severity, description, latitude, longitude,
        image_path, confidence
    ))
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    return report_id

def get_reports(category=None, severity=None):
    conn = get_connection()
    query = "SELECT * FROM reports"
    params = []
    conditions = []
    
    if category:
        conditions.append("category = ?")
        params.append(category)
    if severity:
        conditions.append("severity = ?")
        params.append(severity)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY created_at DESC"
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(row) for row in rows]
