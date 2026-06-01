import os
import csv
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from lpr_sequential import detect_plate_in_image, FINAL_ACCEPT_THRESHOLD, init_alpr

IMAGE_DIR = "datasets/eval_images"
OUTPUT_CSV = "datasets/auto_labeled.csv"

def generate_labels():
    images = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.webp'))]
    images.sort()
    
    alpr = init_alpr()
    
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["image_path", "plate_number", "notes"])
        
        for img_name in images:
            img_path = os.path.join(IMAGE_DIR, img_name)
            try:
                result = detect_plate_in_image(img_path, alpr=alpr, threshold=FINAL_ACCEPT_THRESHOLD)
                plate = result.get("plate_number", "") if result else ""
                notes = result.get("source", "auto-detected") if result else "no-plate"
                writer.writerow([os.path.join(IMAGE_DIR, img_name), plate, notes])
                print(f"[OK] {img_name} -> {plate or 'NO PLATE'}")
            except Exception as e:
                writer.writerow([os.path.join(IMAGE_DIR, img_name), "", f"error:{e}"])
                print(f"[ERR] {img_name} -> {e}")
    
    del alpr
    print(f"\nCSV saved: {OUTPUT_CSV}")

if __name__ == "__main__":
    generate_labels()