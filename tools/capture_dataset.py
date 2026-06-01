import argparse
import csv
import os
import time

import cv2


def ensure_csv(csv_path: str):
    if os.path.exists(csv_path):
        return
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["image_path", "plate_number", "notes"])
        writer.writeheader()


def append_row(csv_path: str, image_path: str, plate_number: str, notes: str):
    with open(csv_path, "a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["image_path", "plate_number", "notes"])
        writer.writerow(
            {
                "image_path": image_path.replace("\\", "/"),
                "plate_number": plate_number,
                "notes": notes,
            }
        )


def main():
    parser = argparse.ArgumentParser(description="Capture ANPR samples from laptop camera")
    parser.add_argument("--camera", default=0, help="Camera index or stream source")
    parser.add_argument(
        "--output-dir",
        default=os.path.join("datasets", "captured"),
        help="Directory where captured images will be stored",
    )
    parser.add_argument(
        "--csv",
        default=os.path.join("datasets", "captured_labels.csv"),
        help="CSV file where capture metadata will be appended",
    )
    parser.add_argument(
        "--label",
        default="",
        help="Optional ground-truth plate to attach to every captured image",
    )
    parser.add_argument(
        "--notes",
        default="laptop-camera",
        help="Optional notes stored with each capture",
    )
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    ensure_csv(args.csv)

    source = int(args.camera) if str(args.camera).isdigit() else args.camera
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise RuntimeError(f"Camera open nahi hui: {args.camera}")

    print("\nControls:")
    print("  C  capture image")
    print("  Q  quit\n")

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("Frame read nahi hua, stopping.")
                break

            preview = frame.copy()
            cv2.putText(
                preview,
                "C capture | Q quit",
                (12, 28),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2,
            )
            if args.label:
                cv2.putText(
                    preview,
                    f"Label: {args.label}",
                    (12, 58),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2,
                )

            cv2.imshow("Dataset Capture", preview)
            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break
            if key == ord("c"):
                ts = int(time.time() * 1000)
                filename = f"capture_{ts}.jpg"
                absolute_path = os.path.join(args.output_dir, filename)
                cv2.imwrite(absolute_path, frame)
                append_row(args.csv, absolute_path, args.label, args.notes)
                print(f"Saved: {absolute_path}")

    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
