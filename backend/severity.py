def calculate_severity(category):
    category = category.lower()
    if category in ["oil spill", "large debris"]:
        return "High"
    if category in ["plastic waste", "marine debris"]:
        return "Medium"
    return "Low"
