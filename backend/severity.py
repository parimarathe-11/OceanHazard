def calculate_severity(category):
    cat_lower = category.lower()
    if "oil" in cat_lower or "chemical" in cat_lower or "spill" in cat_lower:
        return "High"
    if "plastic" in cat_lower or "debris" in cat_lower or "waste" in cat_lower:
        return "Medium"
    return "Low"
