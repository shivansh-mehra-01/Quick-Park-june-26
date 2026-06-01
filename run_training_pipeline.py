"""
run_training_pipeline.py  —  Industry-Level LPR Training Pipeline
==================================================================
Ye script complete training pipeline run karta hai:

Step 1: Eval CSV generate karo (XML annotations + labels CSV se)
Step 2: OCR Corrector model train karo (from labeled dataset)
Step 3: Model ko lpr_sequential.py mein integrate karo
Step 4: Evaluation run karo (accuracy measure karo)
Step 5: Report generate karo

Usage:
    python run_training_pipeline.py

Ya sirf specific steps:
    python run_training_pipeline.py --skip-eval   (training only, no evaluation)
    python run_training_pipeline.py --eval-only   (already trained, just evaluate)
    python run_training_pipeline.py --limit 50    (evaluate first 50 images)
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.absolute()


def print_header(title: str):
    print(f"\n{'═'*60}")
    print(f"  {title}")
    print(f"{'═'*60}")


def print_step(n: int, title: str):
    print(f"\n{'─'*50}")
    print(f"  Step {n}: {title}")
    print(f"{'─'*50}")


def run_python(script_path: str, args: list = None, check: bool = True) -> int:
    """Python script run karo aur exit code return karo."""
    cmd = [sys.executable, script_path] + (args or [])
    print(f"\n  > {' '.join(str(c) for c in cmd)}")
    result = subprocess.run(cmd, cwd=str(PROJECT_ROOT))
    if check and result.returncode != 0:
        print(f"\n[ERROR] Script failed: {script_path}")
    return result.returncode


def load_eval_report(report_path: str) -> dict:
    """Evaluation report load karo."""
    if os.path.exists(report_path):
        with open(report_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def print_accuracy_report(report: dict):
    """Accuracy report print karo."""
    summary = report.get("summary", {})
    if not summary:
        print("  [INFO] No evaluation report found.")
        return

    print_header("📊 ACCURACY REPORT")

    total = summary.get("positive_images", 0)
    exact = summary.get("exact_matches", 0)
    exact_rate = summary.get("exact_match_rate", 0) * 100
    char_acc = summary.get("average_character_accuracy", 0) * 100
    fp_rate = summary.get("false_positive_rate", 0) * 100
    miss_rate = summary.get("missed_detection_rate", 0) * 100
    threshold = summary.get("threshold", 0)

    print(f"\n  {'Metric':<35} {'Value':>10}")
    print(f"  {'─'*46}")
    print(f"  {'Total Positive Images':<35} {total:>10,}")
    print(f"  {'Exact Match Count':<35} {exact:>10,}")
    print(f"  {'Exact Match Rate (Accuracy)':<35} {exact_rate:>9.1f}%")
    print(f"  {'Average Character Accuracy':<35} {char_acc:>9.1f}%")
    print(f"  {'False Positive Rate':<35} {fp_rate:>9.1f}%")
    print(f"  {'Missed Detection Rate':<35} {miss_rate:>9.1f}%")
    print(f"  {'Confidence Threshold':<35} {threshold:>10.2f}")

    # Rating
    print(f"\n  {'─'*46}")
    if exact_rate >= 95:
        rating = "🏆 EXCELLENT (Industry Grade)"
    elif exact_rate >= 90:
        rating = "✅ GOOD (Production Ready)"
    elif exact_rate >= 80:
        rating = "⚠️  FAIR (Needs Improvement)"
    elif exact_rate >= 70:
        rating = "⚠️  BELOW TARGET"
    else:
        rating = "❌ POOR (Significant Work Needed)"

    print(f"\n  Overall Rating: {rating}")
    print(f"  Target: 95%+ exact match rate for industry deployment")

    # Show some failures if available
    results = report.get("results", [])
    failures = [
        r for r in results
        if r.get("expected_plate") and r.get("accepted_prediction")
        and r["expected_plate"] != r["accepted_prediction"]
    ]

    if failures:
        print(f"\n  📋 Sample OCR Errors (first 10):")
        print(f"  {'Expected':<15} {'Predicted':<15} {'Conf':>6} {'Char Acc':>9}")
        print(f"  {'─'*50}")
        for r in failures[:10]:
            exp = r.get("expected_plate", "")
            pred = r.get("accepted_prediction", "")
            conf = r.get("confidence", 0)
            cacc = r.get("character_accuracy", 0) * 100
            print(f"  {exp:<15} {pred:<15} {conf:>6.2f} {cacc:>8.1f}%")


def main():
    parser = argparse.ArgumentParser(
        description="LPR Industry Training Pipeline"
    )
    parser.add_argument(
        "--skip-eval", action="store_true",
        help="Training ke baad evaluation mat karo"
    )
    parser.add_argument(
        "--eval-only", action="store_true",
        help="Sirf evaluation karo (training skip)"
    )
    parser.add_argument(
        "--limit", type=int, default=0,
        help="Evaluate first N images only (0 = all)"
    )
    parser.add_argument(
        "--threshold", type=float, default=0.70,
        help="OCR confidence threshold for evaluation"
    )
    args = parser.parse_args()

    print_header("🚀 LPR INDUSTRY TRAINING PIPELINE")
    print(f"  Project Root: {PROJECT_ROOT}")
    print(f"  Python: {sys.executable}")

    tools_dir = PROJECT_ROOT / "tools"
    models_dir = PROJECT_ROOT / "models"
    eval_csv = PROJECT_ROOT / "datasets" / "eval_ready.csv"
    eval_report = models_dir / "eval_report.json"

    start_time = time.time()
    success = True

    # ── Step 1: Generate Eval CSV ─────────────────────────────────────────────
    if not args.eval_only:
        print_step(1, "Generate Evaluation CSV (XML + Labels CSV)")
        rc = run_python(
            str(tools_dir / "generate_eval_csv.py"),
            ["--root", str(PROJECT_ROOT), "--output", "datasets/eval_ready.csv"]
        )
        if rc != 0:
            print("[WARN] CSV generation had errors, continuing...")

        # ── Step 2: Train OCR Corrector Model ─────────────────────────────────
        print_step(2, "Train OCR Corrector Model")
        if eval_csv.exists():
            rc = run_python(
                str(tools_dir / "train_ocr_corrector.py"),
                ["--root", str(PROJECT_ROOT), "--csv", "datasets/eval_ready.csv"]
            )
        else:
            # Fallback: use number_plate_labels.csv directly
            print("  [INFO] eval_ready.csv nahi mila, labels CSV se train kar rahe hain...")
            rc = run_python(
                str(tools_dir / "train_ocr_corrector.py"),
                ["--root", str(PROJECT_ROOT), "--csv", "datasets/number_plate_labels.csv"]
            )
        if rc != 0:
            print("[WARN] Training had errors, continuing with existing models...")

        print_step(3, "Model Integration (lpr_sequential.py already integrated)")
        print("  ✅ ML models automatically loaded by lpr_sequential.py at startup")
        print(f"  📁 Models location: {models_dir}")

        # List generated models
        if models_dir.exists():
            for f in models_dir.glob("*.json"):
                size_kb = f.stat().st_size / 1024
                print(f"     • {f.name:<30} {size_kb:.1f} KB")

    # ── Step 4: Evaluation ────────────────────────────────────────────────────
    if not args.skip_eval:
        step_num = 4 if not args.eval_only else 1
        print_step(step_num, "OCR Evaluation (Accuracy Measurement)")

        if not eval_csv.exists():
            print(f"  [WARN] Eval CSV nahi mila: {eval_csv}")
            print("  Pehle Step 1 run karo: python run_training_pipeline.py")
            if args.eval_only:
                sys.exit(1)
        else:
            eval_args = [
                "--csv", str(eval_csv),
                "--root", str(PROJECT_ROOT),
                "--threshold", str(args.threshold),
                "--save-json", str(eval_report),
            ]
            if args.limit > 0:
                eval_args += ["--limit", str(args.limit)]

            print(f"\n  ⏳ Evaluating... (yeh time lagega, OCR processing ho rahi hai)")
            if args.limit:
                print(f"  (Sirf first {args.limit} images evaluate ho rahe hain)")
            else:
                print(f"  (Poora dataset evaluate ho raha hai)")

            rc = run_python(str(tools_dir / "evaluate_ocr.py"), eval_args, check=False)

            # Print accuracy report
            if eval_report.exists():
                report = load_eval_report(str(eval_report))
                print_accuracy_report(report)
            else:
                print("  [INFO] Evaluation report generate nahi hua")

    # ── Done ──────────────────────────────────────────────────────────────────
    elapsed = time.time() - start_time
    print_header(f"✅ Pipeline Complete ({elapsed:.1f}s)")

    if not args.skip_eval and eval_report.exists():
        print(f"\n  📊 Full report: {eval_report}")

    print(f"\n  💡 Agle steps:")
    print(f"     1. Camera se live test karo: python lpr_sequential.py")
    print(f"     2. Backend start karo: python backend/app.py")
    print(f"     3. Aur data add karo datasets/eval_images/ mein accuracy badhane ke liye")
    print(f"\n  📚 Industry deployment checklist:")
    print(f"     • ≥95% exact match rate? → Check eval_report.json")
    print(f"     • GPU support? → EasyOCR: easyocr.Reader(['en'], gpu=True)")
    print(f"     • PaddleOCR? → pip install paddlepaddle paddleocr")
    print(f"     • Camera angle? → 30-60° from perpendicular is optimal")


if __name__ == "__main__":
    main()
