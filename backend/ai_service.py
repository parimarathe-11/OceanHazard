from PIL import Image

def analyze_image(image_path):
    # Day-1 prototype fallback.
    # Replace only this function if a stable trained/pretrained
    # model is available.
    Image.open(image_path).verify()
    return {
        "category": "marine debris",
        "confidence": 0.78
    }
