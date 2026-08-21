from database import init_db, insert_report

init_db()

# Seed 4 reports
insert_report(
    category="Oil Spill",
    severity="High",
    description="Heavy crude oil leakage detected off the coast of Mumbai, spreading approximately 3km wide. Immediate containment required.",
    latitude=18.9500,
    longitude=72.8200,
    image_path="uploads/demo_oil.jpg",
    confidence=0.94
)

insert_report(
    category="Plastic Waste",
    severity="Medium",
    description="Large pile of single-use plastic bottles and plastic bags accumulated on Goa beach tide line.",
    latitude=15.5414,
    longitude=73.7431,
    confidence=0.88,
    image_path="uploads/demo_plastic.jpg"
)

insert_report(
    category="Marine Debris",
    severity="Medium",
    description="Discarded commercial drift nets tangled on submerged rocks. Severe hazard for marine life.",
    latitude=12.9200,
    longitude=74.8400,
    confidence=0.79,
    image_path="uploads/demo_nets.jpg"
)

insert_report(
    category="Clean Ocean",
    severity="Low",
    description="Clear blue water check near Havelock island. No visible waste or pollutants.",
    latitude=12.0300,
    longitude=92.9800,
    confidence=0.95,
    image_path="uploads/demo_clean.jpg"
)

print("Database initialized and seeded with 4 realistic reports successfully!")
