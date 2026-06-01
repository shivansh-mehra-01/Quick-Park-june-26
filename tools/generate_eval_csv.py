"""
generate_eval_csv.py  —  v2 (Fixed)
=====================================
Eval CSV banata hai:
  1. datasets/number_plate_labels.csv se (filenames + plate numbers)
  2. datasets/eval_images/*.xml se (Pascal VOC format bounding box annotations)

v2 Fixes:
  - XML encoding errors handle karta hai (latin-1, cp1252 fallback)
  - Garbage labels filter karta hai (TERRANO, CRETA, foreign plates, etc.)
  - Duplicate images filter karta hai (same plate multiple photos mein)
  - Only valid Indian plates accept karta hai

Usage:
    python tools/generate_eval_csv.py --root . --output datasets/eval_ready.csv
"""

import argparse
import csv
import os
import re
import xml.etree.ElementTree as ET

# ── Valid Indian state codes ───────────────────────────────────────────────────
VALID_STATES = {
    "AN", "AP", "AR", "AS", "BH", "BR", "CG", "CH", "DD", "DL", "DN",
    "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD", "MH",
    "ML", "MN", "MP", "MZ", "NL", "OD", "OR", "PB", "PY", "RJ", "SK",
    "TG", "TN", "TR", "TS", "UA", "UK", "UP", "WB",
}

# ── Plate format regex (Indian RTO) ───────────────────────────────────────────
PLATE_RE = re.compile(
    r"^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$", re.IGNORECASE
)

# ── Non-plate labels that appear in dataset ────────────────────────────────────
GARBAGE_LABELS = {
    "plate", "license", "licenseplate", "license_plate", "numberplate",
    "number-plate", "lp", "number plate",
    # Car brand names that appear in annotations
    "terrano", "creta", "duster", "innova", "scorpio", "alto", "swift",
    "brezza", "baleno", "ciaz", "polo", "vento", "rapid", "octavia",
    "superb", "laura", "yeti", "wagon", "fortuner", "car", "vehicle",
    "auto", "india", "devanagri", "devanagari",
}


def is_valid_indian_plate(txt: str) -> bool:
    """Check karo ki text valid Indian plate number hai."""
    if not txt or len(txt) < 5 or len(txt) > 13:
        return False
    clean = re.sub(r"[^A-Z0-9]", "", txt.upper())
    if len(clean) < 5 or len(clean) > 13:
        return False
    if clean[:2] not in VALID_STATES:
        return False
    if txt.lower() in GARBAGE_LABELS:
        return False
    # Must have digits somewhere after state code
    if not any(c.isdigit() for c in clean[2:]):
        return False
    return True


def load_labels_csv(csv_path: str) -> dict:
    """number_plate_labels.csv se {filename -> plate_number} dict banao."""
    mapping = {}
    if not os.path.exists(csv_path):
        print(f"[WARN] Labels CSV nahi mila: {csv_path}")
        return mapping
    with open(csv_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            fn = row.get("filename", "").strip()
            plate = row.get("plate_number", "").strip().upper()
            if fn and plate and is_valid_indian_plate(plate):
                mapping[fn] = plate
    print(f"[INFO] Labels CSV se {len(mapping)} valid entries load kiye")
    return mapping


def _try_parse_xml(xml_path: str):
    """XML ko multiple encodings try karke parse karo."""
    encodings = ["utf-8", "latin-1", "cp1252", "utf-8-sig", "ascii"]
    for enc in encodings:
        try:
            with open(xml_path, "r", encoding=enc, errors="replace") as f:
                content = f.read()
            return ET.fromstring(content)
        except Exception:
            continue
    return None


def load_xml_annotations(eval_images_dir: str) -> dict:
    """
    eval_images/ ke XML files parse karo (Pascal VOC format).
    Returns: {image_filename -> plate_text}

    Filters:
    - Garbage labels (car names, etc.)
    - Invalid/foreign plates
    - Encoding errors handled gracefully
    """
    xml_data = {}
    if not os.path.isdir(eval_images_dir):
        print(f"[WARN] eval_images dir nahi mila: {eval_images_dir}")
        return xml_data

    xml_ok = 0
    xml_skip_invalid = 0
    xml_skip_error = 0

    for root_dir, dirs, files in os.walk(eval_images_dir):
        for fname in files:
            if not fname.lower().endswith(".xml"):
                continue
            xml_path = os.path.join(root_dir, fname)

            root = _try_parse_xml(xml_path)
            if root is None:
                xml_skip_error += 1
                continue

            try:
                # Image filename
                img_file_el = root.find("filename")
                if img_file_el is None:
                    xml_skip_invalid += 1
                    continue
                img_filename = (img_file_el.text or "").strip()
                if not img_filename:
                    xml_skip_invalid += 1
                    continue

                # Plate text from <object><name>
                plate_texts = []
                for obj in root.findall("object"):
                    name_el = obj.find("name")
                    if name_el is not None and name_el.text:
                        txt = name_el.text.strip().upper()
                        if is_valid_indian_plate(txt):
                            plate_texts.append(txt)

                if img_filename and plate_texts:
                    xml_data[img_filename] = plate_texts[0]
                    xml_ok += 1
                else:
                    xml_skip_invalid += 1
            except Exception:
                xml_skip_error += 1

    print(f"[INFO] XML valid entries: {xml_ok}")
    print(f"[INFO] XML skipped (invalid label): {xml_skip_invalid}")
    print(f"[INFO] XML skipped (parse error): {xml_skip_error}")
    return xml_data


def find_image_path(root_dir: str, filename: str) -> str:
    """Image file ko project mein dhundho."""
    candidates = [
        os.path.join(root_dir, "datasets", "eval_images", filename),
        os.path.join(root_dir, filename),
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.relpath(c, root_dir).replace("\\", "/")

    # State-code subfolder (e.g. datasets/eval_images/MH/MH01AB1234.jpg)
    state_code = filename[:2].upper() if len(filename) >= 2 else ""
    subfolder_path = os.path.join(
        root_dir, "datasets", "eval_images", state_code, filename
    )
    if os.path.exists(subfolder_path):
        return os.path.relpath(subfolder_path, root_dir).replace("\\", "/")

    # Walk datasets/eval_images
    eval_dir = os.path.join(root_dir, "datasets", "eval_images")
    if os.path.isdir(eval_dir):
        for dirpath, _, walk_files in os.walk(eval_dir):
            if filename in walk_files:
                return os.path.relpath(
                    os.path.join(dirpath, filename), root_dir
                ).replace("\\", "/")

    return ""  # Not found


def main():
    parser = argparse.ArgumentParser(
        description="Evaluation CSV generator for LPR dataset (v2 - Fixed)"
    )
    parser.add_argument("--root", default=".", help="Project root directory")
    parser.add_argument(
        "--output",
        default="datasets/eval_ready.csv",
        help="Output CSV file path",
    )
    parser.add_argument(
        "--source",
        choices=["both", "csv", "xml"],
        default="both",
        help="Data source: csv/xml/both",
    )
    parser.add_argument(
        "--dedup",
        action="store_true",
        default=True,
        help="Remove duplicate plate numbers (keep one image per plate)",
    )
    args = parser.parse_args()

    root_dir = os.path.abspath(args.root)
    labels_csv = os.path.join(root_dir, "datasets", "number_plate_labels.csv")
    eval_images_dir = os.path.join(root_dir, "datasets", "eval_images")
    output_path = os.path.join(root_dir, args.output)

    # Merge sources
    all_entries = {}  # {filename -> plate_number}
    xml_filenames = set()

    if args.source in ("csv", "both"):
        csv_data = load_labels_csv(labels_csv)
        all_entries.update(csv_data)

    if args.source in ("xml", "both"):
        xml_data = load_xml_annotations(eval_images_dir)
        xml_filenames = set(xml_data.keys())
        # XML overrides CSV (annotations are more precise)
        all_entries.update(xml_data)

    print(f"\n[INFO] Total unique entries before dedup: {len(all_entries)}")

    # Deduplicate: same plate number multiple images mein hai
    # Keep one image per plate number (avoid inflated accuracy metrics)
    if args.dedup:
        seen_plates = {}  # {plate -> filename}
        deduped = {}
        for filename, plate in sorted(all_entries.items()):
            if plate not in seen_plates:
                seen_plates[plate] = filename
                deduped[filename] = plate
            # else: skip duplicate
        removed = len(all_entries) - len(deduped)
        all_entries = deduped
        print(f"[INFO] After dedup: {len(all_entries)} entries (removed {removed} duplicates)")

    # Write output CSV
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    found_count = 0
    not_found_count = 0

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["image_path", "plate_number", "source"]
        )
        writer.writeheader()

        for filename, plate in sorted(all_entries.items()):
            img_rel = find_image_path(root_dir, filename)
            if img_rel:
                src = "xml" if filename in xml_filenames else "csv"
                writer.writerow({
                    "image_path": img_rel,
                    "plate_number": plate,
                    "source": src,
                })
                found_count += 1
            else:
                not_found_count += 1

    print(f"\n✅ CSV generate ho gaya: {output_path}")
    print(f"   Valid image-plate pairs: {found_count}")
    print(f"   Images not found on disk: {not_found_count}")
    print(f"\n💡 Next step:")
    print(f"   python tools/evaluate_ocr.py --csv {args.output} --root . --limit 100 --save-json models/eval_report.json")


if __name__ == "__main__":
    main()
