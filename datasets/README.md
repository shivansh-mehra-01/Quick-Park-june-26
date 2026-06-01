# Dataset Guide

Ye folder labeled OCR evaluation aur future fine-tuning ke liye rakha gaya hai.

## Recommended Structure

```text
datasets/
  README.md
  eval_template.csv
  captured_labels.csv
  captured/
    capture_*.jpg
  eval_images/
    sample_001.jpg
    sample_002.jpg
```

## CSV Format

`eval_template.csv` aur `captured_labels.csv` me ye columns use karo:

- `image_path`: image ka path, relative ya absolute
- `plate_number`: correct ground-truth plate text
- `notes`: optional metadata, jaise `day`, `night`, `blur`, `angled`

## Best Practice

- Har plate ke multiple conditions collect karo:
  - daylight
  - low light
  - slight blur
  - tilted angle
  - partial dirt
- Kuch negative samples bhi rakho jisme plate clearly visible na ho
- Agar image me correct plate nahi hai ya sample negative hai, `plate_number` blank chhod sakte ho

## Quick Start

1. Images ko `datasets/eval_images/` me daalo
2. `datasets/eval_template.csv` me path aur label fill karo
3. Evaluation chalao:

```bash
python tools/evaluate_ocr.py --csv datasets/eval_template.csv --root .
```

## Camera Capture

Laptop camera se samples capture karne ke liye:

```bash
python tools/capture_dataset.py --camera 0 --output-dir datasets/captured --csv datasets/captured_labels.csv
```

Same vehicle ke repeated labeled captures ke liye:

```bash
python tools/capture_dataset.py --camera 0 --label MH12AB1234 --notes day-front
```
